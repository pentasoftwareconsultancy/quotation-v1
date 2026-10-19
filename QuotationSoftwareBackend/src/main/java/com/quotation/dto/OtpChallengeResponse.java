package com.quotation.dto;

public record OtpChallengeResponse(
        String challengeId,
        String message,
        String maskedDestination,
        long expiresInSeconds,
        long resendAfterSeconds) {}
