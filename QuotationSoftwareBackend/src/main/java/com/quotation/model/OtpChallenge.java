package com.quotation.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "otp_challenges")
public class OtpChallenge {

    @Id
    private String id;

    @Indexed(name = "otp_challenge_hash_unique", unique = true)
    private String challengeIdHash;

    private String employeeId;
    private String otpHash;
    private Instant createdAt;

    @Indexed(name = "otp_challenge_expiry_ttl", expireAfter = "1d")
    private Instant expiresAt;
    private Instant lastSentAt;
    private Instant verifiedAt;
    private int failedAttempts;
    private int resendCount;
    private String status;

    public OtpChallenge() {}

    public String getId() { return id; }
    public String getChallengeIdHash() { return challengeIdHash; }
    public String getEmployeeId() { return employeeId; }
    public String getOtpHash() { return otpHash; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getLastSentAt() { return lastSentAt; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public int getFailedAttempts() { return failedAttempts; }
    public int getResendCount() { return resendCount; }
    public String getStatus() { return status; }

    public void setId(String id) { this.id = id; }
    public void setChallengeIdHash(String challengeIdHash) { this.challengeIdHash = challengeIdHash; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public void setLastSentAt(Instant lastSentAt) { this.lastSentAt = lastSentAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }
    public void setFailedAttempts(int failedAttempts) { this.failedAttempts = failedAttempts; }
    public void setResendCount(int resendCount) { this.resendCount = resendCount; }
    public void setStatus(String status) { this.status = status; }
}
