package com.quotation.controller;

import com.quotation.model.Notification;
import org.springframework.http.ResponseEntity;
import com.quotation.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173") // Allow React to connect
public class NotificationController {
    @Autowired
    private NotificationService service;

    @GetMapping("/admin")
    public ResponseEntity<List<Notification>> getAdminNotifications() {
        // FIX: Changed 'notificationService' to 'service'
        List<Notification> adminNotes = service.getNotifications("ADMIN"); 
        return ResponseEntity.ok(adminNotes);
    }

    @GetMapping("/employee/{empId}")
    public List<Notification> getEmployeeNotifications(@PathVariable String empId) {
        return service.getNotifications(empId);
    }

    @PostMapping("/mark-read/{recipientId}")
    public void markRead(@PathVariable String recipientId) {
        service.markAllAsRead(recipientId);
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        service.deleteNotification(id);
        return ResponseEntity.ok().build(); // Return 200 OK so the frontend knows it worked
    }

    // DELETE ALL: /api/notifications/delete-all/EMP001
    @DeleteMapping("/delete-all/{recipientId}")
    public void deleteAll(@PathVariable String recipientId) {
        service.deleteAllForRecipient(recipientId);
    }
}