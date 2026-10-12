package com.quotation.dto;

public class ForgotPasswordRequest {
    private String emailOrEmpId;

    public ForgotPasswordRequest() {
    }

    public ForgotPasswordRequest(String emailOrEmpId) {
        this.emailOrEmpId = emailOrEmpId;
    }

    public String getEmailOrEmpId() {
        return emailOrEmpId;
    }

    public void setEmailOrEmpId(String emailOrEmpId) {
        this.emailOrEmpId = emailOrEmpId;
    }
}
