package com.quotation.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.quotation.dto.OtpChallengeResponse;
import com.quotation.model.Employee;
import com.quotation.model.OtpChallenge;
import com.quotation.repository.EmployeeRepository;
import com.quotation.repository.OtpChallengeRepository;

@Service
public class EmailOtpService {

    private static final Duration OTP_LIFETIME = Duration.ofMinutes(5);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(30);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int MAX_RESENDS = 3;
    private static final String PENDING = "PENDING";

    private final OtpChallengeRepository challengeRepository;
    private final EmployeeRepository employeeRepository;
    private final MongoTemplate mongoTemplate;
    private final JavaMailSender mailSender;
    private final String mailFrom;
    private final SecureRandom secureRandom = new SecureRandom();
    private final BCryptPasswordEncoder otpEncoder = new BCryptPasswordEncoder();

    public EmailOtpService(
            OtpChallengeRepository challengeRepository,
            EmployeeRepository employeeRepository,
            MongoTemplate mongoTemplate,
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String mailFrom) {
        this.challengeRepository = challengeRepository;
        this.employeeRepository = employeeRepository;
        this.mongoTemplate = mongoTemplate;
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
    }

    public OtpChallengeResponse startChallenge(Employee employee) {
        if (employee.getEmail() == null || employee.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "This account is not configured for email verification. Contact your administrator.");
        }

        Instant now = Instant.now();
        mongoTemplate.updateMulti(
                Query.query(Criteria.where("employeeId").is(employee.getEmpId())
                        .and("status").is(PENDING)),
                Update.update("status", "REPLACED"),
                OtpChallenge.class);

        String challengeId = generateChallengeId();
        String otp = generateOtp();
        OtpChallenge challenge = new OtpChallenge();
        challenge.setChallengeIdHash(hash(challengeId));
        challenge.setEmployeeId(employee.getEmpId());
        challenge.setOtpHash(otpEncoder.encode(otp));
        challenge.setCreatedAt(now);
        challenge.setExpiresAt(now.plus(OTP_LIFETIME));
        challenge.setLastSentAt(now);
        challenge.setStatus(PENDING);
        challengeRepository.save(challenge);

        try {
            sendOtp(employee.getEmail(), otp);
        } catch (RuntimeException exception) {
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("challengeIdHash").is(challenge.getChallengeIdHash())
                            .and("status").is(PENDING)),
                    Update.update("status", "DELIVERY_FAILED"),
                    OtpChallenge.class);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Unable to send a verification code right now. Please try again later.");
        }

        return new OtpChallengeResponse(
                challengeId,
                "A verification code has been sent to your registered email address.",
                maskEmail(employee.getEmail()),
                OTP_LIFETIME.toSeconds(),
                RESEND_COOLDOWN.toSeconds());
    }

    private String maskEmail(String email) {
        int atIndex = email.lastIndexOf('@');
        if (atIndex <= 0 || atIndex == email.length() - 1) {
            return "your registered email address";
        }

        String localPart = email.substring(0, atIndex);
        String maskedLocalPart = localPart.length() <= 2
                ? localPart.charAt(0) + "***"
                : localPart.charAt(0) + "***" + localPart.charAt(localPart.length() - 1);
        return maskedLocalPart + email.substring(atIndex);
    }

    public void resend(String challengeId) {
        String challengeIdHash = hashChallengeId(challengeId);
        Instant now = Instant.now();
        String otp = generateOtp();
        String otpHash = otpEncoder.encode(otp);

        Query resendQuery = Query.query(Criteria.where("challengeIdHash").is(challengeIdHash)
                .and("status").is(PENDING)
                .and("expiresAt").gt(now)
                .and("lastSentAt").lte(now.minus(RESEND_COOLDOWN))
                .and("resendCount").lt(MAX_RESENDS));

        OtpChallenge challenge = mongoTemplate.findAndModify(
                resendQuery,
                new Update()
                        .set("otpHash", otpHash)
                        .set("expiresAt", now.plus(OTP_LIFETIME))
                        .set("lastSentAt", now)
                        .inc("resendCount", 1),
                FindAndModifyOptions.options().returnNew(true),
                OtpChallenge.class);

        if (challenge == null) {
            rejectUnavailableResend(challengeIdHash, now);
            return;
        }

        Employee employee = employeeRepository.findByEmpId(challenge.getEmployeeId())
                .orElseThrow(() -> unavailableChallenge(HttpStatus.GONE,
                        "This verification challenge is no longer available. Please sign in again."));
        try {
            sendOtp(employee.getEmail(), otp);
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Unable to send a replacement code right now. Please try again later.");
        }
    }

    public String verify(String challengeId, String otp) {
        String challengeIdHash = hashChallengeId(challengeId);
        OtpChallenge challenge = loadChallenge(challengeIdHash);
        Instant now = Instant.now();
        checkChallengeState(challenge, now);

        if (!otpEncoder.matches(otp, challenge.getOtpHash())) {
            Query failedAttemptQuery = Query.query(Criteria.where("challengeIdHash").is(challengeIdHash)
                    .and("status").is(PENDING)
                    .and("expiresAt").gt(now)
                    .and("failedAttempts").lt(MAX_FAILED_ATTEMPTS));
            OtpChallenge updated = mongoTemplate.findAndModify(
                    failedAttemptQuery,
                    new Update().inc("failedAttempts", 1),
                    FindAndModifyOptions.options().returnNew(true),
                    OtpChallenge.class);

            if (updated == null) {
                checkChallengeState(loadChallenge(challengeIdHash), Instant.now());
                throw unavailableChallenge(HttpStatus.LOCKED,
                        "This verification challenge is locked. Please sign in again.");
            }

            if (updated.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
                mongoTemplate.updateFirst(
                        Query.query(Criteria.where("challengeIdHash").is(challengeIdHash)
                                .and("status").is(PENDING)
                                .and("failedAttempts").gte(MAX_FAILED_ATTEMPTS)),
                        Update.update("status", "LOCKED"),
                        OtpChallenge.class);
                throw unavailableChallenge(HttpStatus.LOCKED,
                        "This verification challenge is locked. Please sign in again.");
            }
            throw unavailableChallenge(HttpStatus.BAD_REQUEST, "The verification code is incorrect.");
        }

        Query consumeQuery = Query.query(Criteria.where("challengeIdHash").is(challengeIdHash)
                .and("status").is(PENDING)
                .and("expiresAt").gt(now)
                .and("failedAttempts").lt(MAX_FAILED_ATTEMPTS)
                .and("otpHash").is(challenge.getOtpHash()));
        OtpChallenge consumed = mongoTemplate.findAndModify(
                consumeQuery,
                new Update()
                        .set("status", "VERIFIED")
                        .set("verifiedAt", now)
                        .unset("otpHash"),
                FindAndModifyOptions.options().returnNew(true),
                OtpChallenge.class);

        if (consumed == null) {
            checkChallengeState(loadChallenge(challengeIdHash), Instant.now());
            throw unavailableChallenge(HttpStatus.CONFLICT,
                    "This verification code has already been used or replaced. Request a new code.");
        }
        return consumed.getEmployeeId();
    }

    private void rejectUnavailableResend(String challengeIdHash, Instant now) {
        OtpChallenge challenge = loadChallenge(challengeIdHash);
        checkChallengeState(challenge, now);
        if (challenge.getResendCount() >= MAX_RESENDS
                || (challenge.getLastSentAt() != null
                    && challenge.getLastSentAt().isAfter(now.minus(RESEND_COOLDOWN)))) {
            throw unavailableChallenge(HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait before requesting another verification code.");
        }
        throw unavailableChallenge(HttpStatus.CONFLICT,
                "A replacement code could not be requested. Please sign in again.");
    }

    private OtpChallenge loadChallenge(String challengeIdHash) {
        return challengeRepository.findByChallengeIdHash(challengeIdHash)
                .orElseThrow(() -> unavailableChallenge(HttpStatus.GONE,
                        "This verification challenge is no longer available. Please sign in again."));
    }

    private void checkChallengeState(OtpChallenge challenge, Instant now) {
        if (!PENDING.equals(challenge.getStatus())) {
            HttpStatus status = "LOCKED".equals(challenge.getStatus())
                    ? HttpStatus.LOCKED : HttpStatus.CONFLICT;
            throw unavailableChallenge(status, "This verification challenge is no longer active.");
        }
        if (challenge.getExpiresAt() == null || !challenge.getExpiresAt().isAfter(now)) {
            mongoTemplate.updateFirst(
                    Query.query(Criteria.where("challengeIdHash").is(challenge.getChallengeIdHash())
                            .and("status").is(PENDING)),
                    Update.update("status", "EXPIRED"),
                    OtpChallenge.class);
            throw unavailableChallenge(HttpStatus.GONE,
                    "This verification code has expired. Please sign in again.");
        }
        if (challenge.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
            throw unavailableChallenge(HttpStatus.LOCKED,
                    "This verification challenge is locked. Please sign in again.");
        }
    }

    private void sendOtp(String email, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (mailFrom != null && !mailFrom.isBlank()) {
            message.setFrom(mailFrom);
        }
        message.setTo(email);
        message.setSubject("Your Quotation Generator verification code");
        message.setText("Your sign-in verification code is " + otp
                + ". It expires in 5 minutes. If you did not request this code, you can ignore this message.");
        mailSender.send(message);
    }

    private String generateOtp() {
        return String.format(Locale.ROOT, "%06d", secureRandom.nextInt(1_000_000));
    }

    private String generateChallengeId() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashChallengeId(String challengeId) {
        if (challengeId == null || challengeId.length() > 128) {
            throw unavailableChallenge(HttpStatus.GONE,
                    "This verification challenge is no longer available. Please sign in again.");
        }
        return hash(challengeId);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private ResponseStatusException unavailableChallenge(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }
}
