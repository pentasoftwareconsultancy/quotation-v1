package com.quotation.service;

import com.quotation.model.Quotation;




import java.util.UUID;
import java.time.LocalDateTime;
import com.quotation.repository.QuotationRepository;
import com.quotation.service.NotificationService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate; 
import java.time.format.DateTimeFormatter; 

@Service
public class QuotationService {

    @Autowired
    private QuotationRepository repository;

    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private NotificationService notificationService;

 // Inside QuotationService.java

    @Transactional
    public Quotation saveQuotation(Quotation quotation) {
        if (quotation == null) throw new RuntimeException("Quotation data is missing");
        
        // Fix: If it's a brand new quotation with no status, set to Draft
        if (quotation.getStatus() == null || quotation.getStatus().trim().isEmpty()) {
            quotation.setStatus("Draft");
        }

        // Always update actionDate whenever we save/update
        String now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        quotation.setActionDate(now);
        
        // ✅ ADD THIS BLOCK HERE
        if (quotation.getTimeline() != null && !quotation.getTimeline().isEmpty()) {
            int totalWeeks = 0;

            for (Map<String, String> phase : quotation.getTimeline()) {
                String duration = phase.get("duration"); // e.g. "2 Weeks"

                if (duration != null) {
                    String number = duration.replaceAll("[^0-9]", "");

                    if (!number.isEmpty()) {
                        totalWeeks += Integer.parseInt(number);
                    }
                }
            }

            quotation.setTotalTimeline(totalWeeks + " Weeks");
        }


        return repository.save(quotation);
    }

    // Add this helper to ensure consistency when status changes
    public void updateStatusAndSave(Quotation quotation, String newStatus) {
        quotation.setStatus(newStatus);
        
        this.saveQuotation(quotation);
    }
    public List<Quotation> getQuotationsForList() {
        return repository.findAllExcludingHeavyFields();
    }

    public Quotation getById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteQuotation(String id) {
        repository.deleteById(id);
    }

    public Quotation updateStatus(String id, String newStatus) {
        Quotation quotation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        quotation.setStatus(newStatus);
        return this.saveQuotation(quotation);
    }
    
    public List<Quotation> getQuotationsByEmployee(String empId) {
        return repository.findByPreparedBy(empId);
    }
    
    public Quotation getByToken(String token) {
        return repository.findByApprovalToken(token);
    }
    
    public void triggerDailyReminders(String empId) {
        List<Quotation> quotations;

        // --- ADDED LOGIC HERE ---
        // If Admin is logged in, we fetch ALL quotations to check for expiration.
        // If an Employee is logged in, we only check their specific quotations.
        if ("ADMIN".equalsIgnoreCase(empId.trim())) {
            quotations = repository.findAll(); 
        } else {
            quotations = repository.findByPreparedBy(empId);
        }
        
        
        LocalDate today = LocalDate.now();
        DateTimeFormatter slashFormatter = DateTimeFormatter.ofPattern("d/M/yyyy");

        for (Quotation q : quotations) {
            // Only process if status is Pending or already Expired
            if (!"Pending".equalsIgnoreCase(q.getStatus()) && !"Expired".equalsIgnoreCase(q.getStatus())) {
                continue;
            }

            // This unique key prevents duplicate notifications for the same day
            String reminderKey = "REM_DAILY_" + q.getQuotationNumber() + "_" + today;

            // 1. Notify the specific Employee who prepared this quotation
            // Use q.getPreparedBy() to ensure the right employee gets it even if ADMIN triggered the check
            if (!notificationService.existsByKeyAndUser(reminderKey, q.getPreparedBy())) {
                processReminder(q, q.getPreparedBy(), reminderKey, today, slashFormatter);
            }

            // 2. Notify the Admin
            if (!notificationService.existsByKeyAndUser(reminderKey, "ADMIN")) {
                processReminder(q, "ADMIN", reminderKey, today, slashFormatter);
            }
        }
    }

    // Keep your processReminder helper method as it is, it works great!
    private void processReminder(Quotation q, String recipient, String key, LocalDate today, DateTimeFormatter formatter) {
        try {
            String dateStr = q.getValidUntil();
            if (dateStr == null || dateStr.trim().isEmpty()) return;

            LocalDate expiryDate = LocalDate.parse(dateStr.trim(), formatter);

            if (expiryDate.isBefore(today)) {
                String msg = "❌ EXPIRED: Quotation " + q.getQuotationNumber() + " has expired.";
                notificationService.createNotificationWithKey(msg, recipient, "EXPIRED", key);
                
                if (!"Expired".equals(q.getStatus())) {
                    q.setStatus("Expired");
                    this.saveQuotation(q);
                }
            } else {
                String msg = "⏳ REMINDER: Quotation " + q.getQuotationNumber() + " (Client: " + q.getClient() + ") is still pending.";
                notificationService.createNotificationWithKey(msg, recipient, "DAILY_REMINDER", key);
            }
        } catch (Exception e) {
            System.err.println("Reminder Error for " + q.getQuotationNumber() + ": " + e.getMessage());
        }
    }
    
    public void sendForApprovalWithPdf(String id, MultipartFile file) {

        Quotation quotation = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        try {
        	quotation.setStatus("Pending");
            // This ensures the actionDate is updated to NOW and saved to MongoDB
            this.saveQuotation(quotation);

            // Generate approval token
            String token = UUID.randomUUID().toString();
            quotation.setApprovalToken(token);
            quotation.setApprovalUsed(false);

            this.saveQuotation(quotation);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(quotation.getClientEmail());
            helper.setSubject("Approval Required: " + quotation.getProject());

            String approveUrl = "http://localhost:8080/api/quotations/approve?token=" + token;
            String rejectUrl  = "http://localhost:8080/api/quotations/reject?token=" + token;

            double displayAmount = quotation.getTotalCost();

            if (quotation.getGstPercent() != null && quotation.getGstPercent() > 0) {
                displayAmount = quotation.getFinalAmount();
            }

            String emailBody =

            		"<div style='font-family:Arial,Helvetica,sans-serif;'>"

            		// ✅ Logo (simple, no background)
            		+ "<div style='margin-bottom:15px;'>"
            		+ " <img src='cid:mainLogo' \r\n"
            		+ "       style='width:200px;height:auto;display:block;' \r\n"
            		+ "       alt='Company Logo' />"
            		+ "</div>"

            		// Content
            		+ "<p>Dear <b>" + quotation.getClient() + "</b>,</p>"

            		+ "<p>Please review the quotation and take action below:</p>"

            		// Simple details (no table)
            		+ "<table style='margin-top:10px;font-size:14px;'>"

            		+ "<tr>"
            		+ "<td style='width:140px;font-weight:bold;'>Quotation No:</td>"
            		+ "<td>" + quotation.getQuotationNumber() + "</td>"
            		+ "</tr>"

            		+ "<tr>"
            		+ "<td style='font-weight:bold;'>Date:</td>"
            		+ "<td>" + quotation.getDate() + "</td>"
            		+ "</tr>"

            		+ "<tr>"
            		+ "<td style='font-weight:bold;'>Valid Until:</td>"
            		+ "<td>" + quotation.getValidUntil() + "</td>"
            		+ "</tr>"

            		+ "<tr>"
            		+ "<td style='font-weight:bold;'>Project:</td>"
            		+ "<td>" + quotation.getProject() + "</td>"
            		+ "</tr>"

            		+ "<tr>"
            		+ "<td style='font-weight:bold;'>Total Cost:</td>"
            		+ "<td>₹ " + displayAmount + "</td>"
            		+ "</tr>"

            		+ "<tr>"
            		+ "<td style='font-weight:bold;'>Timeline:</td>"
            		+ "<td>" + quotation.getTotalTimeline() + "</td>"
            		+ "</tr>"

            		+ "</table>"

            		// Buttons
            		+ "<div style='margin-top:20px;'>"

            		+ "<a href='" + approveUrl + "' "
            		+ "style='background:#22c55e;color:white;padding:10px 20px;"
            		+ "text-decoration:none;border-radius:5px;margin-right:10px;'>Approve</a>"

            		+ "<a href='" + rejectUrl + "' "
            		+ "style='background:#ef4444;color:white;padding:10px 20px;"
            		+ "text-decoration:none;border-radius:5px;'>Reject</a>"

            		+ "</div>"


            		// Footer text only
            		+ "<p style='margin-top:30px;color:#555;font-size:14px;'>"
            		+ "If you have any questions, feel free to contact us."
            		+ "</p>"

            		+ "<p style='margin-top:20px;color:#555;'>"
            		+ "Best Regards,<br>"
            		+ "<b>SmartMatrix Digital Services</b>"
            		+ "</p>"

            		+ "</div>"
            		+ "</div>"
            		+ "</div>";
            helper.setText(emailBody, true);

         // ✅ ADD LOGO HERE (AFTER setText)
            ClassPathResource logo = new ClassPathResource("images/mainlogo.png");
            helper.addInline("mainLogo", logo, "image/png");

            helper.addAttachment(file.getOriginalFilename(), file);

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
    
 // Inside QuotationService.java

    public void sendStatusUpdateNotification(Quotation quotation) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            // Your company email
            helper.setTo("your-company-email@gmail.com"); 
            helper.setSubject("ALERT: Quotation " + quotation.getStatus() + " - " + quotation.getProject());

            // Create a feedback section if the status is Rejected
            String feedbackHtml = "";
            if ("Rejected".equals(quotation.getStatus()) && quotation.getRejectionReason() != null) {
                feedbackHtml = 
                    "<div style='margin-top:20px; padding:15px; background-color:#fff1f2; border-left:5px solid #be123c; border-radius:4px;'>" +
                    "<h4 style='color:#be123c; margin:0 0 10px 0;'>Client Feedback / Rejection Reason:</h4>" +
                    "<p style='color:#475569; font-style:italic; margin:0;'>\"" + quotation.getRejectionReason() + "\"</p>" +
                    "</div>";
            }

            String emailBody = 
                "<div style='font-family:Arial,sans-serif; padding:20px; border:1px solid #eee;'>" +
                "<h2 style='color:#2563eb;'>Quotation Status Update</h2>" +
                "<p>The client <b>" + quotation.getClient() + "</b> has responded to <b>Quotation #" + quotation.getQuotationNumber() + "</b>.</p>" +
                "<p><b>New Status:</b> <span style='padding:4px 8px; background:#fef3c7; border-radius:4px; font-weight:bold;'>" + quotation.getStatus() + "</span></p>" +
                "<p><b>Project:</b> " + quotation.getProject() + "</p>" +
                feedbackHtml + // This inserts the comment if it exists
                "<br/><p>Please check the Admin Dashboard for more details.</p>" +
                "</div>";

            helper.setText(emailBody, true);
            mailSender.send(message);
            
        } catch (Exception e) {
            System.err.println("Failed to send internal notification: " + e.getMessage());
        }
    }
    
}