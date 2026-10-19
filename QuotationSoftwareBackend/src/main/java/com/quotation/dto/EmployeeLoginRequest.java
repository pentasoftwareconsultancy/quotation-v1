package com.quotation.dto;

import jakarta.validation.constraints.NotBlank;

public class EmployeeLoginRequest {

    @NotBlank
    private String employeeId;

    @NotBlank
    private String password;

    public String getEmployeeId() { return employeeId; }
    public String getPassword() { return password; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public void setPassword(String password) { this.password = password; }
}
