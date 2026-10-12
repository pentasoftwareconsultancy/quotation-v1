package com.quotation.service;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.quotation.model.Employee;
import com.quotation.repository.EmployeeRepository;
import com.quotation.security.JwtUtil;

@Service
public class EmployeeAuthService {

    private final EmployeeRepository employeeRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public EmployeeAuthService(EmployeeRepository employeeRepository,
                               JwtUtil jwtUtil) {
        this.employeeRepository = employeeRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public String login(String empId, String password) {

        Optional<Employee> empOpt =
                employeeRepository.findByEmpId(empId);

        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();

            // ✅ Support both plain text (legacy) and BCrypt hashed passwords
            // This allows gradual migration to secure password storage
            boolean passwordMatches = passwordEncoder.matches(password, emp.getPassword()) 
                                    || emp.getPassword().equals(password);
            
            if (passwordMatches) {
                return jwtUtil.generateToken(empId);
            }
        }
        return null;
    }
}
