package com.quotation.service;

import com.quotation.model.Notification;

import com.quotation.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.util.List;

@Service
@Transactional
public class NotificationService {
    @Autowired
    private NotificationRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createNotification(String msg, String recipient, String type) {
        Notification notification = new Notification(msg, recipient, type);
        repository.save(notification);
        System.out.println("Notification successfully committed to DB: " + msg);
    }

    public List<Notification> getNotifications(String recipientId) {
        return repository.findByRecipientIdOrderByTimestampDesc(recipientId);
    }
    
    public void markAllAsRead(String recipientId) {
        List<Notification> list = repository.findByRecipientIdOrderByTimestampDesc(recipientId);
        list.forEach(n -> n.setRead(true));
        repository.saveAll(list);
    }
    
    
    public void deleteNotification(String id) {
        // repository.deleteById(id) looks for the @Id field in your Model
        repository.deleteById(id);
    }


    // DELETE ALL FOR EMPLOYEE
    public void deleteAllForRecipient(String recipientId) {
        repository.deleteByRecipientId(recipientId);
    }
    
 // Inside NotificationService.java

 // Update this to use recipientId to match your repository
 public boolean existsByKeyAndUser(String key, String recipientId) {
     return repository.existsByReminderKeyAndRecipientId(key, recipientId);
 }

 public void createNotificationWithKey(String message, String recipientId, String type, String key) {
	    // 1. CRITICAL: Stop if this key already exists for this user
	    if (existsByKeyAndUser(key, recipientId)) {
	        // Log this only if you want to see that the "shield" is working
	        // System.out.println("Skipping duplicate reminder: " + key);
	        return; 
	    }

	    Notification n = new Notification();
	    n.setMessage(message);
	    n.setRecipientId(recipientId);
	    n.setType(type);
	    n.setReminderKey(key); 
	    n.setTimestamp(java.time.LocalDateTime.now());
	    n.setRead(false);
	    
	    repository.save(n);
	    System.out.println("DEBUG: Created NEW Reminder: " + key);
	}
 
}