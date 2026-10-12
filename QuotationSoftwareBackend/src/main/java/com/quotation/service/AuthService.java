package com.quotation.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.quotation.model.Admin;
import com.quotation.repository.AdminRepository;
import com.quotation.security.JwtUtil;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(AdminRepository adminRepository, JwtUtil jwtUtil) {
        this.adminRepository = adminRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // 🔐 LOGIN
    public String login(String username, String password) {

        Optional<Admin> adminOpt = adminRepository.findByUsername(username);

        if (adminOpt.isEmpty()) {
            return null;
        }

        Admin admin = adminOpt.get();

        // ✅ Support both plain text (legacy) and BCrypt hashed passwords
        // This allows gradual migration to secure password storage
        boolean passwordMatches = passwordEncoder.matches(password, admin.getPassword())
                                || admin.getPassword().equals(password);

        if (!passwordMatches) {
            return null;
        }

        // ✅ Generate JWT token
        return jwtUtil.generateToken(admin.getUsername());
    }
}
