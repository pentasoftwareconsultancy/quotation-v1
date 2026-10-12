package com.quotation.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.quotation.service.PasswordResetService;
import com.quotation.dto.ForgotPasswordRequest;
import com.quotation.dto.ResetPasswordRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            if (request.getEmailOrEmpId() == null || request.getEmailOrEmpId().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email or Employee ID is required"));
            }

            passwordResetService.initiatePasswordReset(request.getEmailOrEmpId());

            return ResponseEntity.ok(Map.of(
                    "message", "If the account exists, a password reset link has been sent to the email address."
            ));
        } catch (Exception e) {
            System.err.println("Error in forgot password: " + e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "message", "If the account exists, a password reset link has been sent to the email address."
            ));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            if (request.getToken() == null || request.getToken().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Reset token is required"));
            }

            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "New password is required"));
            }

            String passwordError = validatePasswordPolicy(request.getNewPassword());
            if (passwordError != null) {
                return ResponseEntity.badRequest().body(Map.of("message", passwordError));
            }

            if (!passwordResetService.validateResetToken(request.getToken())) {
                return ResponseEntity.status(400)
                        .body(Map.of("message", "Invalid or expired reset token"));
            }

            boolean success = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());

            if (success) {
                return ResponseEntity.ok(Map.of(
                        "message", "Password reset successful. Please log in with your new password."
                ));
            }

            return ResponseEntity.status(400)
                    .body(Map.of("message", "Failed to reset password. Token may be invalid or expired."));
        } catch (Exception e) {
            System.err.println("Error in reset password: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Error resetting password"));
        }
    }

    private String validatePasswordPolicy(String password) {
        if (password.length() < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!password.matches(".*[A-Z].*")) {
            return "Password must include at least one uppercase letter";
        }
        if (!password.matches(".*[a-z].*")) {
            return "Password must include at least one lowercase letter";
        }
        if (!password.matches(".*\\d.*")) {
            return "Password must include at least one number";
        }
        if (!password.matches(".*[^a-zA-Z0-9].*")) {
            return "Password must include at least one special character";
        }
        return null;
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            boolean isValid = passwordResetService.validateResetToken(token);
            if (isValid) {
                return ResponseEntity.ok(Map.of("valid", true));
            }

            return ResponseEntity.status(400)
                    .body(Map.of("valid", false, "message", "Invalid or expired reset token"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("valid", false, "message", "Error validating token"));
        }
    }
}
