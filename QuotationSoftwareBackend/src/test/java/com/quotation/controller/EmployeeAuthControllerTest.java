package com.quotation.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.quotation.dto.EmployeeLoginRequest;
import com.quotation.dto.OtpChallengeResponse;
import com.quotation.dto.OtpVerificationRequest;
import com.quotation.service.AuthRateLimiter;
import com.quotation.service.EmployeeAuthService;

@ExtendWith(MockitoExtension.class)
class EmployeeAuthControllerTest {

    @Mock
    private EmployeeAuthService employeeAuthService;
    @Mock
    private AuthRateLimiter rateLimiter;
    @Mock
    private HttpServletRequest httpRequest;

    private EmployeeAuthController controller;

    @BeforeEach
    void setUp() {
        controller = new EmployeeAuthController(employeeAuthService, rateLimiter);
        when(httpRequest.getRemoteAddr()).thenReturn("127.0.0.1");
    }

    @Test
    void employeeLoginReturnsOtpChallengeInsteadOfFinalToken() {
        EmployeeLoginRequest request = new EmployeeLoginRequest();
        request.setEmployeeId("EMP503");
        request.setPassword("test-password");
        OtpChallengeResponse challenge =
                new OtpChallengeResponse("test-challenge", "Code sent", "e***e@example.test", 300, 30);
        when(employeeAuthService.login("EMP503", "test-password")).thenReturn(challenge);

        var response = controller.login(request, httpRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(challenge, response.getBody());
        verify(rateLimiter).check(
                "employee-login-ip",
                "127.0.0.1",
                10,
                java.time.Duration.ofMinutes(15));
        verify(rateLimiter).check(
                "employee-login-account",
                "emp503",
                10,
                java.time.Duration.ofMinutes(15));
    }

    @Test
    void otpVerificationReturnsFinalTokenOnlyAfterServiceVerification() {
        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setChallengeId("test-challenge");
        request.setOtp("123456");
        when(employeeAuthService.verifyOtp("test-challenge", "123456")).thenReturn("test-token");

        var response = controller.verifyOtp(request, httpRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Map.of("token", "test-token"), response.getBody());
        verify(employeeAuthService).verifyOtp("test-challenge", "123456");
    }
}
