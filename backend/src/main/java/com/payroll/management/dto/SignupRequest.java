package com.payroll.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    private String username;
    private String password;
    private String role; // "ROLE_ADMIN" or "ROLE_EMPLOYEE"
    
    // Admin specific details
    private String name;
    
    // Employee specific details
    private String firstName;
    private String lastName;
    private String phone;
    private Long departmentId;
    private String jobTitle;
    private Double basicSalary;
}
