package com.quotation.controller;

import java.util.Map;
import java.time.Duration;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.quotation.dto.EmployeeLoginRequest;
import com.quotation.dto.OtpChallengeRequest;
import com.quotation.dto.OtpChallengeResponse;
import com.quotation.dto.OtpVerificationRequest;
import com.quotation.service.AuthRateLimiter;
import com.quotation.service.EmployeeAuthService;

@RestController
@RequestMapping("/api/employee/auth")
public class EmployeeAuthController {

    private final EmployeeAuthService employeeAuthService;
    private final AuthRateLimiter rateLimiter;

    public EmployeeAuthController(EmployeeAuthService employeeAuthService, AuthRateLimiter rateLimiter) {
        this.employeeAuthService = employeeAuthService;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/login")
    public ResponseEntity<OtpChallengeResponse> login(
            @Valid @RequestBody EmployeeLoginRequest request,
            HttpServletRequest httpRequest) {
        Duration loginWindow = Duration.ofMinutes(15);
        rateLimiter.check("employee-login-ip", httpRequest.getRemoteAddr(), 10, loginWindow);
        rateLimiter.check(
                "employee-login-account",
                request.getEmployeeId().trim().toLowerCase(java.util.Locale.ROOT),
                10,
                loginWindow);
        return ResponseEntity.ok(employeeAuthService.login(request.getEmployeeId(), request.getPassword()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @Valid @RequestBody OtpVerificationRequest request,
            HttpServletRequest httpRequest) {
        rateLimiter.check("otp-verify", httpRequest.getRemoteAddr(), 20, Duration.ofMinutes(15));
        String token = employeeAuthService.verifyOtp(request.getChallengeId(), request.getOtp());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(
            @Valid @RequestBody OtpChallengeRequest request,
            HttpServletRequest httpRequest) {
        rateLimiter.check("otp-resend", httpRequest.getRemoteAddr(), 10, Duration.ofHours(1));
        employeeAuthService.resendOtp(request.getChallengeId());
        return ResponseEntity.ok(Map.of("message", "A replacement verification code has been sent."));
    }
}
