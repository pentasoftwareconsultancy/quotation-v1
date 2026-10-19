package com.quotation.service;

import java.util.Optional;
import java.util.Locale;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.quotation.dto.OtpChallengeResponse;
import com.quotation.model.Employee;
import com.quotation.repository.EmployeeRepository;
import com.quotation.security.JwtUtil;

@Service
public class EmployeeAuthService {

    private static final Set<String> INACTIVE_STATUSES =
            Set.of("inactive", "disabled", "suspended", "terminated");

    private final EmployeeRepository employeeRepository;
    private final JwtUtil jwtUtil;
    private final EmailOtpService emailOtpService;
    private final BCryptPasswordEncoder passwordEncoder;

    public EmployeeAuthService(EmployeeRepository employeeRepository,
                               JwtUtil jwtUtil,
                               EmailOtpService emailOtpService) {
        this.employeeRepository = employeeRepository;
        this.jwtUtil = jwtUtil;
        this.emailOtpService = emailOtpService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public OtpChallengeResponse login(String empId, String password) {
        if (empId == null || empId.isBlank() || password == null || password.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Employee ID and password are required.");
        }

        Optional<Employee> empOpt =
                employeeRepository.findByEmpId(empId.trim());

        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();

            String storedPassword = emp.getPassword();
            boolean encodedPassword = isBcryptHash(storedPassword);
            boolean passwordMatches = storedPassword != null
                    && (encodedPassword
                            ? passwordEncoder.matches(password, storedPassword)
                            : storedPassword.equals(password));

            if (passwordMatches) {
                String status = emp.getStatus();
                if (status != null && INACTIVE_STATUSES.contains(status.trim().toLowerCase(Locale.ROOT))) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                            "This employee account is inactive. Contact your administrator.");
                }

                if (!encodedPassword) {
                    emp.setPassword(passwordEncoder.encode(password));
                    employeeRepository.save(emp);
                }
                return emailOtpService.startChallenge(emp);
            }
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid employee credentials.");
    }

    private boolean isBcryptHash(String password) {
        return password != null
                && password.matches("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");
    }

    public String verifyOtp(String challengeId, String otp) {
        String employeeId = emailOtpService.verify(challengeId, otp);
        return jwtUtil.generateToken(employeeId);
    }

    public void resendOtp(String challengeId) {
        emailOtpService.resend(challengeId);
    }
}
