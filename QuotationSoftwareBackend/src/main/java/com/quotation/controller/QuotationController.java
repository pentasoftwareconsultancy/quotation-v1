package com.quotation.controller;

import com.quotation.model.Quotation;

import com.quotation.service.QuotationService;
import com.quotation.service.NotificationService; // ADD THIS IMPORT
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotations")
@CrossOrigin(origins = "http://localhost:5173")
public class QuotationController {

    @Autowired
    private QuotationService service;

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public Quotation saveQuotation(@RequestBody Quotation quotation) {
        Quotation savedQuotation = service.saveQuotation(quotation);

        // 🔔 Notify ADMIN
        String message = " Quotation " + savedQuotation.getQuotationNumber() +
                " created for Client " + savedQuotation.getClient();

        notificationService.createNotification(
                message,
                "ADMIN",
                "QUOTATION_CREATED"
        );

        return savedQuotation;
    }

    @GetMapping
    public List<Quotation> getAllQuotations() {
        return service.getQuotationsForList(); 
    }

    @GetMapping("/{id}")
    public Quotation getQuotationById(@PathVariable String id) {
        return service.getById(id);
    }
    
    @GetMapping("/employee/id/{empId}")
    public List<Quotation> getQuotationsByEmpId(@PathVariable String empId) {
        return service.getQuotationsByEmployee(empId); 
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Quotation> updateQuotationStatus(
            @PathVariable String id, 
            @RequestBody Map<String, String> updates) {
        
        Quotation quotation = service.getById(id);
        if (quotation == null) {
            throw new RuntimeException("Quotation not found");
        }

        String newStatus = updates.get("status");
        quotation.setStatus(newStatus);

        // FIX: Call service.saveQuotation instead of repository.save
        // This ensures the actionDate is updated automatically!
        Quotation updated = service.saveQuotation(quotation); 
        
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuotation(@PathVariable String id) {
        service.deleteQuotation(id);
        return ResponseEntity.noContent().build(); 
    }
    
    @GetMapping("/trigger-reminders/{empId}")
    public ResponseEntity<Void> triggerReminders(@PathVariable String empId) {
        service.triggerDailyReminders(empId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/send-approval-pdf")
    public ResponseEntity<?> sendApprovalPdf(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        try {

            Quotation quotation = service.getById(id);

            service.sendForApprovalWithPdf(id, file);

            // 🔔 Notify ADMIN
            String message = "Quotation " + quotation.getQuotationNumber() +
                    " sent to client for approval.";

            notificationService.createNotification(
                    message,
                    "ADMIN",
                    "QUOTATION_SENT"
            );

            return ResponseEntity.ok("Email sent successfully!");

        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    
    @PostMapping("/{id}/send-to-admin")
    public ResponseEntity<?> sendToAdminForApproval(@PathVariable String id) {
        try {
            Quotation quotation = service.getById(id);
            
            if (quotation == null) {
                return ResponseEntity.status(404).body("Quotation not found");
            }
            
            // Update status to Pending for admin review
            quotation.setStatus("Pending");
            service.saveQuotation(quotation);
            
            // 🔔 Notify ADMIN
            String message = "📋 Quotation " + quotation.getQuotationNumber() +
                    " (Client: " + quotation.getClient() + ", Project: " + quotation.getProject() + 
                    ") submitted for your approval by Employee " + quotation.getPreparedBy();
            
            notificationService.createNotification(
                    message,
                    "ADMIN",
                    "APPROVAL_REQUESTED"
            );
            
            return ResponseEntity.ok("Quotation successfully sent to admin for approval!");
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/approve")
    public String approve(@RequestParam String token) {
        Quotation quotation = service.getByToken(token);
        
        // 1. STRICT LOCK CHECK
        // If quotation is null OR the flag is already true, stop immediately.
        if (quotation == null || quotation.isApprovalUsed()) {
            return renderAlreadyProcessedPage();
        }

        // 2. IMMEDIATE STATE CHANGE
        quotation.setApprovalUsed(true); 
        service.updateStatusAndSave(quotation, "Approved");
        
        

        // 4. NOTIFICATIONS (Happens after DB is locked)
        String msg = "Client " + quotation.getClient() + " approved project: " + quotation.getProject();
        notificationService.createNotification(msg, "ADMIN", "APPROVAL");
        if (quotation.getPreparedBy() != null) {
            notificationService.createNotification(msg, quotation.getPreparedBy(), "APPROVAL");
        }
        service.sendStatusUpdateNotification(quotation);

        return renderSmartPage("Approved Successfully", "✅", "#0369a1", 
        	    "Thank you! Your approval for <b>" + quotation.getProject() + "</b> has been confirmed." +
        	    "Our team has been notified and will proceed with the next steps.");
    }

 // STEP 1: Show the Feedback Form to the Client
    @GetMapping("/reject")
    public String showRejectForm(@RequestParam String token) {
        Quotation quotation = service.getByToken(token);
        if (quotation == null || quotation.isApprovalUsed()) {
            return renderAlreadyProcessedPage();
        }

        return "<html><body style='margin:0; font-family:sans-serif; background: #fff1f2; display:flex; justify-content:center; align-items:center; height:100vh;'>" +
               "<form action='/api/quotations/reject-submit' method='POST' style='background:white; padding:40px; border-radius:25px; box-shadow:0 10px 30px rgba(0,0,0,0.1); text-align:center; max-width:400px; border-top: 6px solid #be123c;'>" +
               "<div style='font-size:50px; margin-bottom:15px;'>✍️</div>" +
               "<h2 style='color:#be123c; margin:0;'>Rejection Feedback</h2>" +
               "<p style='color:#64748b; font-size:14px; margin-top:10px;'>Please let us know why you are rejecting this quotation so we can improve our proposal.</p>" +
               "<input type='hidden' name='token' value='" + token + "'>" +
               "<textarea name='reason' required style='width:100%; height:120px; margin-top:20px; padding:15px; border:1px solid #e2e8f0; border-radius:12px; font-family:inherit; font-size:14px; resize:none;' placeholder='Reason for rejection (e.g., Price too high, scope mismatch...)'></textarea>" +
               "<button type='submit' style='margin-top:25px; background:#be123c; color:white; border:none; padding:14px 30px; border-radius:10px; font-weight:bold; cursor:pointer; width:100%; font-size:16px;'>Submit Feedback</button>" +
               "</form></body></html>";
    }

 // STEP 2: Process the Submission
    @PostMapping("/reject-submit")
    public String handleRejectSubmit(@RequestParam String token, @RequestParam String reason) {
        Quotation quotation = service.getByToken(token);
        if (quotation == null || quotation.isApprovalUsed()) return renderAlreadyProcessedPage();

        // 1. Update Database
        quotation.setApprovalUsed(true);
        quotation.setRejectionReason(reason); 
        
        // 2. Save everything once through the service to trigger the date update
        service.updateStatusAndSave(quotation, "Rejected");

        // 2. 🔔 Bell Icon Notification
        // Result: Client ruchita rejected projectname quotation with comment: "thank you but i dont want"
        String bellMsg = "Client " + quotation.getClient() + 
                         " rejected " + quotation.getProject() + 
                         " quotation with comment: \"" + reason + "\"";

        notificationService.createNotification(
                bellMsg, 
                "ADMIN", 
                "REJECTION"
        );
        
        if (quotation.getPreparedBy() != null) {
            notificationService.createNotification(
                bellMsg, 
                quotation.getPreparedBy(), 
                "REJECTION"
            );
        }

        // 3. 📧 Trigger the email back to the team (already includes reason in Service)
        service.sendStatusUpdateNotification(quotation);

        return renderSmartPage("Feedback Received", "❌", "#be123c", 
            "Thank you. Your feedback for <b>" + quotation.getProject() + "</b> has been sent to our team.");
    }
    
    // --- REUSABLE SMART UI RENDERERS ---

    private String renderSmartPage(String title, String icon, String color, String description) {
        return "<html><body style='margin:0; font-family:sans-serif; background: #f8fafc; display:flex; justify-content:center; align-items:center; height:100vh;'>" +
               "<div style='background:white; padding:50px; border-radius:30px; box-shadow:0 20px 50px rgba(0,0,0,0.08); text-align:center; max-width:450px; border-top: 6px solid " + color + ";'>" +
               "<div style='font-size:60px; margin-bottom:20px;'>" + icon + "</div>" +
               "<h1 style='color:" + color + "; margin:0; font-size:26px;'>" + title + "</h1>" +
               "<p style='color:#475569; line-height:1.6; margin-top:15px; font-size:16px;'>" + description + "</p>" +
               "<div style='margin-top:30px; font-size:11px; color:#94a3b8; letter-spacing:2px; text-transform:uppercase; font-weight:bold;'>Smart Matrix </div>" +
               "</div></body></html>";
    }

    private String renderAlreadyProcessedPage() {
        return "<html><body style='margin:0; font-family:sans-serif; background: #f1f5f9; display:flex; justify-content:center; align-items:center; height:100vh;'>" +
               "<div style='background:white; padding:40px; border-radius:25px; box-shadow:0 10px 30px rgba(0,0,0,0.05); text-align:center; max-width:400px;'>" +
               "<div style='font-size:50px; margin-bottom:15px;'>⚠️</div>" +
               "<h2 style='color:#64748b; margin:0;'>Action Already Taken</h2>" +
               "<p style='color:#94a3b8; margin-top:10px; font-size:14px;'>This quotation has already been processed. No further changes can be made contact with our team.</p>" +
               "</div></body></html>";
    }
}