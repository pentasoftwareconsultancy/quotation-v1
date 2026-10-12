package com.quotation.controller;

import java.util.Map;
import java.util.HashMap;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.quotation.model.Employee;
import com.quotation.repository.EmployeeRepository;

@RestController
@RequestMapping("/api/employee/profile")
@CrossOrigin
public class EmployeeProfileController {

    private final EmployeeRepository employeeRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public EmployeeProfileController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // ✅ GET PROFILE
    @GetMapping("/{empId}")
    public Employee getEmployeeProfile(@PathVariable String empId) {
        return employeeRepository
                .findByEmpId(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    // ✅ UPDATE PROFILE PHOTO (ADD THIS)
    @PutMapping("/photo/{empId}")
    public Employee updateProfilePhoto(
            @PathVariable String empId,
            @RequestBody Map<String, String> body) {

        Employee emp = employeeRepository
                .findByEmpId(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        emp.setPhoto(body.get("photo"));
        return employeeRepository.save(emp);
    }

    // ✅ UPDATE BASIC PROFILE INFO
@PutMapping("/update/{empId}")
public Employee updateEmployeeProfile(
        @PathVariable String empId,
        @RequestBody Employee updatedData) {

    Employee emp = employeeRepository
            .findByEmpId(empId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    emp.setName(updatedData.getName());
    emp.setEmail(updatedData.getEmail());
    emp.setPhone(updatedData.getPhone());

    return employeeRepository.save(emp);
}

    // ✅ CHANGE PASSWORD (Secure - requires current password verification)
    @PostMapping("/change-password/{empId}")
    public ResponseEntity<?> changePassword(
            @PathVariable String empId,
            @RequestBody Map<String, String> body) {
        
        try {
            Employee emp = employeeRepository
                    .findByEmpId(empId)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
            
            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");
            
            // Validate inputs
            if (currentPassword == null || currentPassword.isEmpty() || 
                newPassword == null || newPassword.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Current password and new password are required");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Verify current password (supports both plain text and BCrypt for legacy compatibility)
            boolean passwordMatches = passwordEncoder.matches(currentPassword, emp.getPassword())
                                    || emp.getPassword().equals(currentPassword);
            
            if (!passwordMatches) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Current password is incorrect");
                return ResponseEntity.status(401).body(error);
            }
            
            // Hash and set new password
            String hashedNewPassword = passwordEncoder.encode(newPassword);
            emp.setPassword(hashedNewPassword);
            employeeRepository.save(emp);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error changing password: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

}

