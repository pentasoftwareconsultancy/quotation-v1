package com.quotation.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.quotation.dto.OtpChallengeResponse;
import com.quotation.model.Employee;
import com.quotation.repository.EmployeeRepository;
import com.quotation.security.JwtUtil;

@ExtendWith(MockitoExtension.class)
class EmployeeAuthServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private EmailOtpService emailOtpService;

    private EmployeeAuthService service;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        service = new EmployeeAuthService(employeeRepository, jwtUtil, emailOtpService);
    }

    @Test
    void validPasswordStartsOtpChallengeWithoutIssuingJwt() {
        Employee employee = new Employee();
        employee.setEmpId("E-17");
        employee.setPassword("legacy-password");
        when(employeeRepository.findByEmpId("E-17")).thenReturn(Optional.of(employee));
        OtpChallengeResponse challenge = new OtpChallengeResponse("challenge", "sent", "e***e@example.test", 300, 30);
        when(emailOtpService.startChallenge(employee)).thenReturn(challenge);

        assertEquals(challenge, service.login(" E-17 ", "legacy-password"));

        assertTrue(passwordEncoder.matches("legacy-password", employee.getPassword()));
        verify(employeeRepository).save(employee);
        verify(emailOtpService).startChallenge(employee);
        verify(jwtUtil, never()).generateToken("E-17");
    }

    @Test
    void validBcryptPasswordStartsOtpChallengeWithoutRewritingPassword() {
        Employee employee = new Employee();
        employee.setEmpId("E-17");
        employee.setStatus("Active");
        employee.setPassword(passwordEncoder.encode("correct-password"));
        when(employeeRepository.findByEmpId("E-17")).thenReturn(Optional.of(employee));
        OtpChallengeResponse challenge = new OtpChallengeResponse("challenge", "sent", "e***e@example.test", 300, 30);
        when(emailOtpService.startChallenge(employee)).thenReturn(challenge);

        assertEquals(challenge, service.login("E-17", "correct-password"));

        verify(employeeRepository, never()).save(employee);
        verify(emailOtpService).startChallenge(employee);
    }

    @Test
    void invalidPasswordDoesNotStartOtpChallenge() {
        Employee employee = new Employee();
        employee.setEmpId("E-17");
        employee.setPassword("correct-password");
        when(employeeRepository.findByEmpId("E-17")).thenReturn(Optional.of(employee));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.login("E-17", "wrong-password"));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        verify(emailOtpService, never()).startChallenge(employee);
        verify(jwtUtil, never()).generateToken("E-17");
    }

    @Test
    void inactiveEmployeeCannotStartOtpChallenge() {
        Employee employee = new Employee();
        employee.setEmpId("E-17");
        employee.setStatus(" Inactive ");
        employee.setPassword("legacy-password");
        when(employeeRepository.findByEmpId("E-17")).thenReturn(Optional.of(employee));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.login("E-17", "legacy-password"));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        verify(employeeRepository, never()).save(employee);
        verify(emailOtpService, never()).startChallenge(employee);
    }

    @Test
    void missingEmployeeUsesSameUnauthorizedResponseAsWrongPassword() {
        when(employeeRepository.findByEmpId("E-17")).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.login("E-17", "any-password"));

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        verify(emailOtpService, never()).startChallenge(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void blankCredentialsAreRejectedBeforeRepositoryLookup() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class, () -> service.login(" ", ""));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(employeeRepository, never()).findByEmpId(org.mockito.ArgumentMatchers.any());
    }
}
