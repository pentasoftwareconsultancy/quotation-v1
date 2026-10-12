package com.quotation.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "employees")
public class Employee {

    @Id
    private String id;

    private String empId;
    private String name;
    private String email;
    private String phone;
    private String joinDate;
    private String password;
    private String status;
    private String department;
    private String photo;

    public Employee() {}

    // ===== GETTERS =====
    public String getId() { return id; }
    public String getEmpId() { return empId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getJoinDate() { return joinDate; }
    public String getPassword() { return password; }
    public String getStatus() { return status; }
    public String getDepartment() { return department; }

    // ===== SETTERS =====
    public void setId(String id) { this.id = id; }
    public void setEmpId(String empId) { this.empId = empId; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setJoinDate(String joinDate) { this.joinDate = joinDate; }
    public void setPassword(String password) { this.password = password; }
    public void setStatus(String status) { this.status = status; }
    public void setDepartment(String department) { this.department = department; }

	public String getPhoto() {
		return photo;
	}

	public void setPhoto(String photo) {
		this.photo = photo;
	}
}
