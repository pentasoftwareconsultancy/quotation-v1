package com.quotation.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.quotation.dto.UpdateAdminRequest;
import com.quotation.model.Admin;
import com.quotation.repository.AdminRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminRepository adminRepository;

    public AdminController(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // ✅ GET ADMIN PROFILE
    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getAdminProfile(@PathVariable String username) {

        Optional<Admin> adminOpt = adminRepository.findByUsername(username);

        if (adminOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Admin not found"));
        }

        return ResponseEntity.ok(
                Map.of("username", adminOpt.get().getUsername())
        );
    }

    // ✅ UPDATE ADMIN CREDENTIALS
    @PutMapping("/update-credentials/{username}")
    public ResponseEntity<?> updateCredentials(
            @PathVariable String username,
            @RequestBody UpdateAdminRequest req
    ) {

        Admin admin = adminRepository.findByUsername(username)
                .orElse(null);

        if (admin == null) {
            return ResponseEntity.status(404).body("Admin not found");
        }

        if (!admin.getPassword().equals(req.getCurrentPassword())) {
            return ResponseEntity
                    .status(401)
                    .body("Current password is incorrect");
        }

        admin.setUsername(req.getUsername());
        admin.setPassword(req.getNewPassword());

        adminRepository.save(admin);

        return ResponseEntity.ok("Credentials updated successfully");
    }
}
