package com.quotation.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.quotation.service.EmployeeAuthService;

@RestController
@RequestMapping("/api/employee/auth")
@CrossOrigin
public class EmployeeAuthController {

    private final EmployeeAuthService employeeAuthService;

    public EmployeeAuthController(EmployeeAuthService employeeAuthService) {
        this.employeeAuthService = employeeAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String token = employeeAuthService.login(
                body.get("employeeId"),
                body.get("password")
        );

        if (token != null) {
            return ResponseEntity.ok(Map.of("token", token));
        }

        return ResponseEntity.status(401)
                .body(Map.of("message", "Invalid employee credentials"));
    }
}
