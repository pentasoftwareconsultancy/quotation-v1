package com.quotation.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.quotation.model.Employee;
import com.quotation.repository.EmployeeRepository;
import com.quotation.service.PasswordResetService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class EmployeeControllerTest {

    private final EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
    private final EmployeeController controller =
            new EmployeeController(employeeRepository, mock(PasswordResetService.class));
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void newEmployeePasswordIsHashedBeforePersistence() {
        Employee employee = new Employee();
        employee.setPassword("initial-secret");
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Employee savedEmployee = controller.addEmployee(employee);

        assertTrue(passwordEncoder.matches("initial-secret", savedEmployee.getPassword()));
        verify(employeeRepository).save(employee);
    }

    @Test
    void profileEditPreservesStoredPassword() {
        Employee existing = new Employee();
        existing.setId("mongo-id");
        existing.setPassword("existing-password-hash");
        when(employeeRepository.findById("mongo-id")).thenReturn(Optional.of(existing));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Employee changes = new Employee();
        changes.setName("Updated Name");
        changes.setPassword(null);
        Employee updated = controller.updateEmployee("mongo-id", changes);

        assertEquals("Updated Name", updated.getName());
        assertEquals("existing-password-hash", updated.getPassword());
        verify(employeeRepository).save(eq(existing));
    }
}
