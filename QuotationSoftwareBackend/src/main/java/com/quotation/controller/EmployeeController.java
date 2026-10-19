package com.quotation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.quotation.model.Employee;
import com.quotation.repository.EmployeeRepository;
import com.quotation.service.PasswordResetService;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/admin/employees")
@CrossOrigin
public class EmployeeController {

    private final EmployeeRepository repo;
    private final PasswordResetService passwordResetService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public EmployeeController(EmployeeRepository repo, PasswordResetService passwordResetService) {
        this.repo = repo;
        this.passwordResetService = passwordResetService;
    }

    // CREATE
    @PostMapping
    public Employee addEmployee(@RequestBody Employee emp) {
        if (emp.getPassword() == null || emp.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee password is required.");
        }
        emp.setPassword(passwordEncoder.encode(emp.getPassword()));
        return repo.save(emp);
    }

    // READ
    @GetMapping
    public List<Employee> getAllEmployees() {
        return repo.findAll();
    }

    // UPDATE
    @PutMapping("/{id}")
    public Employee updateEmployee(
            @PathVariable String id,
            @RequestBody Employee emp) {

        Employee existing = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));
        existing.setName(emp.getName());
        existing.setEmail(emp.getEmail());
        existing.setPhone(emp.getPhone());
        existing.setEmpId(emp.getEmpId());
        existing.setJoinDate(emp.getJoinDate());
        existing.setStatus(emp.getStatus());
        existing.setDepartment(emp.getDepartment());
        existing.setPhoto(emp.getPhoto());
        return repo.save(existing);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteEmployee(@PathVariable String id) {
        repo.deleteById(id);
    }
    
 // Add this inside EmployeeController.java

    @GetMapping("/id/{empId}")
    public ResponseEntity<Employee> getEmployeeByEmpId(@PathVariable String empId) {
        return repo.findByEmpId(empId)
                   .map(employee -> ResponseEntity.ok(employee))
                   .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/password-history")
    public ResponseEntity<?> getPasswordHistoryByEmployeeId(@PathVariable String id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(passwordResetService.getPasswordChangeHistory(id));
    }
}
