package com.quotation.dto;

public class UpdateAdminRequest {

    private String username;
    private String currentPassword;
    private String newPassword;

    public String getUsername() {
        return username;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }
}
