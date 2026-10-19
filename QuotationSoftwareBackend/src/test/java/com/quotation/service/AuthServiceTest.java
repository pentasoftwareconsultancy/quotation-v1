package com.quotation.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.quotation.model.Admin;
import com.quotation.repository.AdminRepository;
import com.quotation.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AdminRepository adminRepository;
    @Mock
    private JwtUtil jwtUtil;

    private AuthService service;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        service = new AuthService(adminRepository, jwtUtil);
    }

    @Test
    void validAdminPasswordStillReturnsJwt() {
        Admin admin = new Admin();
        admin.setUsername("admin-user");
        admin.setPassword(passwordEncoder.encode("admin-password"));
        when(adminRepository.findByUsername("admin-user")).thenReturn(Optional.of(admin));
        when(jwtUtil.generateToken("admin-user")).thenReturn("admin-jwt");

        assertEquals("admin-jwt", service.login("admin-user", "admin-password"));
    }

    @Test
    void legacyAdminPasswordRemainsAccepted() {
        Admin admin = new Admin();
        admin.setUsername("legacy-admin");
        admin.setPassword("legacy-password");
        when(adminRepository.findByUsername("legacy-admin")).thenReturn(Optional.of(admin));
        when(jwtUtil.generateToken("legacy-admin")).thenReturn("legacy-admin-jwt");

        assertEquals("legacy-admin-jwt", service.login("legacy-admin", "legacy-password"));
    }
}
