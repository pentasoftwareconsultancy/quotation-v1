package com.quotation.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    private String id;
    private String employeeId;
    private String employeeEmail;
    private String token;
    private LocalDateTime expiryTime;
    private boolean used;
    private LocalDateTime usedAt;
    private LocalDateTime createdAt;

    public PasswordResetToken() {
    }

    public PasswordResetToken(String employeeId, String employeeEmail, String token, LocalDateTime expiryTime) {
        this.employeeId = employeeId;
        this.employeeEmail = employeeEmail;
        this.token = token;
        this.expiryTime = expiryTime;
        this.used = false;
        this.createdAt = LocalDateTime.now();
    }

    // ===== GETTERS =====
    public String getId() {
        return id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeEmail() {
        return employeeEmail;
    }

    public String getToken() {
        return token;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public boolean isUsed() {
        return used;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ===== SETTERS =====
    public void setId(String id) {
        this.id = id;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public void setEmployeeEmail(String employeeEmail) {
        this.employeeEmail = employeeEmail;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
