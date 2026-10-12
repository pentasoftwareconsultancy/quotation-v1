package com.quotation.controller;

import com.quotation.model.Invoice;
import com.quotation.service.InvoiceService;
import com.quotation.service.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private NotificationService notificationService;

    // ✅ CREATE INVOICE (Now using Service)
    @PostMapping("/create")
    public ResponseEntity<?> createInvoice(@RequestBody Invoice invoice) {
        try {
            Invoice savedInvoice = invoiceService.createInvoice(invoice);
            return ResponseEntity.ok(savedInvoice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ✅ GET BY EMPLOYEE
    @GetMapping("/employee/id/{empId}")
    public ResponseEntity<List<Invoice>> getInvoicesByEmployee(@PathVariable String empId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByEmployee(empId));
    }

    // ✅ GET ALL (for CSV 🔥)
    @GetMapping("/all-invoices")
    public List<Invoice> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    // ✅ GET BY QUOTATION
    @GetMapping("/by-quotation/{quotationId}")
    public ResponseEntity<List<Invoice>> getInvoicesByQuotation(@PathVariable String quotationId) {
        return ResponseEntity.ok(invoiceService.getInvoicesByQuotation(quotationId));
    }

    // ✅ PAYMENT SUMMARY
    @PostMapping("/payment-summaries")
    public ResponseEntity<?> getPaymentSummaries(@RequestBody List<String> quotationIds) {
        return ResponseEntity.ok(invoiceService.getPaymentSummaries(quotationIds));
    }

    // ✅ UPDATE STATUS
    @PutMapping("/update-status/{id}")
    public ResponseEntity<?> updateInvoiceStatus(@PathVariable String id,
                                                 @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(
                    invoiceService.updateInvoiceStatus(id, body.get("status"))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ DELETE
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteInvoice(@PathVariable String id) {
        try {
            invoiceService.deleteInvoice(id.trim());
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}