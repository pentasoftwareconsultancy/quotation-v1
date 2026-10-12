package com.quotation.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.quotation.dto.LoginRequest;
import com.quotation.model.Admin;
import com.quotation.repository.AdminRepository;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AdminRepository adminRepository;

    public AuthController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // 🔐 ADMIN LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Admin admin = adminRepository
                .findByUsername(request.getUsername())
                .orElse(null);

        if (admin == null || 
            !admin.getPassword().equals(request.getPassword())) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("message", "Invalid admin credentials"));
        }

        // (later you can add JWT here)
        return ResponseEntity.ok(
                Map.of("token", "dummy-admin-token")
        );
    }
}
