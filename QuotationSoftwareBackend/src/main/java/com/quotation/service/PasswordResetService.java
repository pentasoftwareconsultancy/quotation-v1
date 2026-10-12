package com.quotation.service;

import com.quotation.model.Employee;
import com.quotation.model.PasswordResetToken;
import com.quotation.repository.EmployeeRepository;
import com.quotation.repository.PasswordResetTokenRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private static final int TOKEN_EXPIRY_MINUTES = 15;

    /**
     * Initiate forgot password flow
     * Generates a reset token and sends email
     * Returns generic response to prevent user enumeration
     */
    public void initiatePasswordReset(String emailOrEmpId) {
        try {
            String normalizedInput = emailOrEmpId == null ? "" : emailOrEmpId.trim();

            // Find employee by email or empId
            Optional<Employee> employeeOpt = employeeRepository.findByEmailIgnoreCase(normalizedInput);
            if (employeeOpt.isEmpty()) {
                employeeOpt = employeeRepository.findByEmpId(normalizedInput);
            }

            if (employeeOpt.isPresent()) {
                Employee employee = employeeOpt.get();
                
                // Generate secure token
                String token = UUID.randomUUID().toString();
                LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);

                // Create and save token
                PasswordResetToken resetToken = new PasswordResetToken(
                        employee.getId(),
                        employee.getEmail(),
                        token,
                        expiryTime
                );
                
                // Delete any existing unused tokens for this employee email
                List<PasswordResetToken> activeTokens =
                    passwordResetTokenRepository.findByEmployeeEmailAndUsedFalse(employee.getEmail());
                if (!activeTokens.isEmpty()) {
                    passwordResetTokenRepository.deleteAll(activeTokens);
                }
                
                passwordResetTokenRepository.save(resetToken);

                // Send reset email
                sendResetEmail(employee, token);
            } else {
                log.info("Password reset requested but no employee matched input: {}", normalizedInput);
            }
        } catch (Exception e) {
            log.error("Error in initiatePasswordReset", e);
        }
    }

    /**
     * Reset password using valid reset token
     */
    public boolean resetPassword(String token, String newPassword) {
        try {
            Optional<PasswordResetToken> resetTokenOpt = passwordResetTokenRepository.findByToken(token);

            if (resetTokenOpt.isEmpty()) {
                return false;
            }

            PasswordResetToken resetToken = resetTokenOpt.get();

            // Verify token has not expired
            if (LocalDateTime.now().isAfter(resetToken.getExpiryTime())) {
                return false;
            }

            // Verify token has not been used
            if (resetToken.isUsed()) {
                return false;
            }

            // Find employee and update password
            Optional<Employee> employeeOpt = employeeRepository.findById(resetToken.getEmployeeId());
            if (employeeOpt.isEmpty()) {
                return false;
            }

            Employee employee = employeeOpt.get();
            String hashedPassword = passwordEncoder.encode(newPassword);
            employee.setPassword(hashedPassword);
            employeeRepository.save(employee);

            // Mark token as used
            resetToken.setUsed(true);
            resetToken.setUsedAt(LocalDateTime.now());
            passwordResetTokenRepository.save(resetToken);

            return true;
        } catch (Exception e) {
            System.err.println("Error in resetPassword: " + e.getMessage());
            return false;
        }
    }

        public List<Map<String, String>> getPasswordChangeHistory(String employeeId) {
        return passwordResetTokenRepository
            .findByEmployeeIdAndUsedTrueOrderByUsedAtDesc(employeeId)
            .stream()
            .map(token -> Map.of(
                "changedAt", token.getUsedAt() != null ? token.getUsedAt().toString() : token.getCreatedAt().toString(),
                "requestedAt", token.getCreatedAt() != null ? token.getCreatedAt().toString() : "",
                "method", "EMAIL_RESET"
            ))
            .toList();
        }

    /**
     * Validate reset token
     */
    public boolean validateResetToken(String token) {
        try {
            Optional<PasswordResetToken> resetTokenOpt = passwordResetTokenRepository.findByToken(token);

            if (resetTokenOpt.isEmpty()) {
                return false;
            }

            PasswordResetToken resetToken = resetTokenOpt.get();

            // Verify token has not expired
            if (LocalDateTime.now().isAfter(resetToken.getExpiryTime())) {
                return false;
            }

            // Verify token has not been used
            if (resetToken.isUsed()) {
                return false;
            }

            return true;
        } catch (Exception e) {
            System.err.println("Error in validateResetToken: " + e.getMessage());
            return false;
        }
    }

    /**
     * Send password reset email
     */
    private void sendResetEmail(Employee employee, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(employee.getEmail());
            helper.setSubject("Password Reset Request - SmartMatrix");

            String resetUrl = "http://localhost:5173/reset-password?token=" + token;

            String emailBody = "<div style='margin:0;padding:32px 16px;background-color:#eef2ff;font-family:Arial,Helvetica,sans-serif;color:#1f2937;'>"
                    + "<table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='max-width:680px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 12px 30px rgba(15,23,42,0.12);'>"
                    + "<tr>"
                    + "<td style='padding:32px 36px;'>"
                    + "<p style='margin:0 0 12px 0;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#f97316;font-weight:700;'>Password Reset</p>"
                    + "<h2 style='margin:0 0 14px 0;font-size:28px;line-height:1.2;color:#111827;'>Reset Your Password</h2>"
                    + "<p style='margin:0 0 18px 0;font-size:15px;line-height:1.7;color:#4b5563;'>Hello <strong>" + employee.getName() + "</strong>,</p>"
                    + "<p style='margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#4b5563;'>We received a request to reset the password for your SmartMatrix account. Click the button below to create a new password.</p>"
                    + "<div style='text-align:center;margin:32px 0;'>"
                    + "<a href='" + resetUrl + "' style='display:inline-block;background:#ea580c;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:999px;font-size:15px;font-weight:700;'>Reset Password</a>"
                    + "</div>"
                    + "<p style='margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#6b7280;'>This password reset link will expire in " + TOKEN_EXPIRY_MINUTES + " minutes.</p>"
                    + "<p style='margin:0 0 24px 0;font-size:13px;line-height:1.6;color:#6b7280;'>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>"
                    + "<hr style='border:none;border-top:1px solid #e5e7eb;margin:24px 0;'>"
                    + "<p style='margin:0;font-size:12px;line-height:1.5;color:#9ca3af;'>SmartMatrix Team<br/>Digital Services & Solutions</p>"
                    + "</td>"
                    + "</tr>"
                    + "</table>"
                    + "</div>";

            helper.setText(emailBody, true);
            mailSender.send(message);
            log.info("Password reset email sent successfully to {}", employee.getEmail());
        } catch (Exception e) {
            log.error("Failed to send reset email to {}", employee.getEmail(), e);
        }
    }
}
