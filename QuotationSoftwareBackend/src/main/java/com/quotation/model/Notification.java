package com.quotation.model;

import lombok.Data;


import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;


@Data
@Document(collection = "notifications")
public class Notification {
	
    @Id
    @JsonProperty("id")
    private String id;
    private String message;
    private String recipientId; // "ADMIN" or a specific Employee ID
    private String type;        // e.g., "APPROVAL", "REJECTION", "CREATION"
    private LocalDateTime timestamp;
    private boolean isRead = false;
    private String reminderKey;
    
    public Notification() {
    }

    public Notification(String message, String recipientId, String type) {
        this.setMessage(message);
        this.setRecipientId(recipientId);
        this.setType(type);
        this.setTimestamp(LocalDateTime.now());
    }
    
    
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getRecipientId() {
		return recipientId;
	}

	public void setRecipientId(String recipientId) {
		this.recipientId = recipientId;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public LocalDateTime getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}

	public boolean isRead() {
		return isRead;
	}

	public void setRead(boolean isRead) {
		this.isRead = isRead;
	}

	public String getReminderKey() {
		return reminderKey;
	}

	public void setReminderKey(String reminderKey) {
		this.reminderKey = reminderKey;
	}
}