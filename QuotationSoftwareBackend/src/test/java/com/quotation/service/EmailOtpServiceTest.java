package com.quotation.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.bson.Document;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.quotation.dto.OtpChallengeResponse;
import com.quotation.model.Employee;
import com.quotation.model.OtpChallenge;
import com.quotation.repository.EmployeeRepository;
import com.quotation.repository.OtpChallengeRepository;

@ExtendWith(MockitoExtension.class)
class EmailOtpServiceTest {

    @Mock
    private OtpChallengeRepository challengeRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private MongoTemplate mongoTemplate;
    @Mock
    private JavaMailSender mailSender;

    private EmailOtpService service;
    private final BCryptPasswordEncoder otpEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        service = new EmailOtpService(
                challengeRepository, employeeRepository, mongoTemplate, mailSender, "no-reply@example.test");
    }

    @Test
    void startChallengeEmailsSixDigitCodeAndPersistsOnlyHash() throws Exception {
        Employee employee = employee("E-17");
        ArgumentCaptor<OtpChallenge> challengeCaptor = ArgumentCaptor.forClass(OtpChallenge.class);
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        OtpChallengeResponse response = service.startChallenge(employee);

        verify(challengeRepository).save(challengeCaptor.capture());
        verify(mailSender).send(messageCaptor.capture());
        OtpChallenge storedChallenge = challengeCaptor.getValue();
        Matcher codeMatcher = Pattern.compile("code is (\\d{6})\\.").matcher(messageCaptor.getValue().getText());
        assertTrue(codeMatcher.find());
        String code = codeMatcher.group(1);
        assertTrue(otpEncoder.matches(code, storedChallenge.getOtpHash()));
        assertNotEquals(code, storedChallenge.getOtpHash());
        assertNotEquals(response.challengeId(), storedChallenge.getChallengeIdHash());
        assertEquals("e***e@example.test", response.maskedDestination());
        assertEquals(300, response.expiresInSeconds());
        assertEquals("PENDING", storedChallenge.getStatus());
    }

    @Test
    void validOtpIsConsumedAndReturnsEmployeeId() throws Exception {
        String challengeId = "secure-random-challenge";
        OtpChallenge pending = challenge(challengeId, "193047", "PENDING", 0, Instant.now().plusSeconds(120));
        OtpChallenge consumed = challenge(challengeId, "193047", "VERIFIED", 0, Instant.now().plusSeconds(120));
        consumed.setEmployeeId("E-17");
        when(challengeRepository.findByChallengeIdHash(hash(challengeId))).thenReturn(Optional.of(pending));
        when(mongoTemplate.findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(OtpChallenge.class)))
                .thenReturn(consumed);

        assertEquals("E-17", service.verify(challengeId, "193047"));
    }

    @Test
    void incorrectOtpIncrementsAttemptCounterAndIsRejected() throws Exception {
        String challengeId = "challenge-for-wrong-code";
        OtpChallenge pending = challenge(challengeId, "193047", "PENDING", 0, Instant.now().plusSeconds(120));
        OtpChallenge updated = challenge(challengeId, "193047", "PENDING", 1, Instant.now().plusSeconds(120));
        when(challengeRepository.findByChallengeIdHash(hash(challengeId))).thenReturn(Optional.of(pending));
        when(mongoTemplate.findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(OtpChallenge.class)))
                .thenReturn(updated);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.verify(challengeId, "000000"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(mongoTemplate).findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(OtpChallenge.class));
    }

    @Test
    void fifthIncorrectOtpLocksChallenge() throws Exception {
        String challengeId = "challenge-to-lock";
        OtpChallenge pending = challenge(challengeId, "193047", "PENDING", 4, Instant.now().plusSeconds(120));
        OtpChallenge locked = challenge(challengeId, "193047", "PENDING", 5, Instant.now().plusSeconds(120));
        when(challengeRepository.findByChallengeIdHash(hash(challengeId))).thenReturn(Optional.of(pending));
        when(mongoTemplate.findAndModify(
                any(Query.class), any(Update.class), any(FindAndModifyOptions.class), eq(OtpChallenge.class)))
                .thenReturn(locked);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.verify(challengeId, "000000"));

        assertEquals(HttpStatus.LOCKED, exception.getStatusCode());
        verify(mongoTemplate).updateFirst(any(Query.class), any(Update.class), eq(OtpChallenge.class));
    }

    @Test
    void resendReplacesTheStoredOtpAndSendsTheReplacement() throws Exception {
        String challengeId = "resend-challenge";
        OtpChallenge rotated = challenge(challengeId, "111111", "PENDING", 1, Instant.now().plusSeconds(120));
        ArgumentCaptor<Update> updateCaptor = ArgumentCaptor.forClass(Update.class);
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        when(mongoTemplate.findAndModify(
                any(Query.class), updateCaptor.capture(), any(FindAndModifyOptions.class), eq(OtpChallenge.class)))
                .thenReturn(rotated);
        when(employeeRepository.findByEmpId("E-17")).thenReturn(Optional.of(employee("E-17")));

        service.resend(challengeId);

        verify(mailSender).send(messageCaptor.capture());
        Matcher codeMatcher = Pattern.compile("code is (\\d{6})\\.").matcher(messageCaptor.getValue().getText());
        assertTrue(codeMatcher.find());
        Document updates = updateCaptor.getValue().getUpdateObject();
        Document setUpdates = updates.get("$set", Document.class);
        String storedHash = setUpdates.getString("otpHash");
        assertTrue(otpEncoder.matches(codeMatcher.group(1), storedHash));
        assertFalse(setUpdates.containsKey("failedAttempts"));
    }

    @Test
    void expiredOtpIsRejected() throws Exception {
        String challengeId = "expired-challenge";
        OtpChallenge expired = challenge(challengeId, "193047", "PENDING", 0, Instant.now().minusSeconds(1));
        when(challengeRepository.findByChallengeIdHash(hash(challengeId))).thenReturn(Optional.of(expired));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.verify(challengeId, "193047"));

        assertEquals(HttpStatus.GONE, exception.getStatusCode());
        verify(mongoTemplate).updateFirst(any(Query.class), any(Update.class), eq(OtpChallenge.class));
    }

    @Test
    void verifiedOtpCannotBeReplayed() throws Exception {
        String challengeId = "used-challenge";
        OtpChallenge verified = challenge(challengeId, "193047", "VERIFIED", 0, Instant.now().plusSeconds(120));
        when(challengeRepository.findByChallengeIdHash(hash(challengeId))).thenReturn(Optional.of(verified));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.verify(challengeId, "193047"));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
    }

    private Employee employee(String employeeId) {
        Employee employee = new Employee();
        employee.setEmpId(employeeId);
        employee.setEmail("employee@example.test");
        return employee;
    }

    private OtpChallenge challenge(String challengeId, String code, String status, int attempts, Instant expiresAt)
            throws Exception {
        OtpChallenge challenge = new OtpChallenge();
        challenge.setChallengeIdHash(hash(challengeId));
        challenge.setEmployeeId("E-17");
        challenge.setOtpHash(otpEncoder.encode(code));
        challenge.setCreatedAt(Instant.now());
        challenge.setExpiresAt(expiresAt);
        challenge.setStatus(status);
        challenge.setFailedAttempts(attempts);
        return challenge;
    }

    private String hash(String value) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
    }
}
