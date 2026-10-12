package com.quotation.repository;

import com.quotation.model.Notification;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    // Fetch notifications for a specific person, latest first
    List<Notification> findByRecipientIdOrderByTimestampDesc(String recipientId);
    
    boolean existsByReminderKeyAndRecipientId(String reminderKey, String recipientId);
    
    @Transactional
    void deleteByRecipientId(String recipientId);
}