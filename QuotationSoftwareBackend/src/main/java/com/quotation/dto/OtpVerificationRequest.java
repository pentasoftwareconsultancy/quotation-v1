package com.quotation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class OtpVerificationRequest {

    @NotBlank
    private String challengeId;

    @NotBlank
    @Pattern(regexp = "\\d{6}")
    private String otp;

    public String getChallengeId() { return challengeId; }
    public String getOtp() { return otp; }
    public void setChallengeId(String challengeId) { this.challengeId = challengeId; }
    public void setOtp(String otp) { this.otp = otp; }
}
