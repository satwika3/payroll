package com.payroll.management.service;

import com.payroll.management.entity.*;
import com.payroll.management.repository.*;
import com.payroll.management.exception.ResourceNotFoundException;
import com.payroll.management.dto.EmployeeDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
    }

    public List<Employee> searchEmployees(String query) {
        if (query == null || query.trim().isEmpty()) {
            return employeeRepository.findAll();
        }
        return employeeRepository.searchEmployees(query);
    }

    @Transactional
    public Employee createEmployee(EmployeeDTO employeeDTO) {
        if (userRepository.existsByUsername(employeeDTO.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + employeeDTO.getEmail());
        }

        Department department = departmentRepository.findById(employeeDTO.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + employeeDTO.getDepartmentId()));

        Employee employee = Employee.builder()
                .firstName(employeeDTO.getFirstName())
                .lastName(employeeDTO.getLastName())
                .email(employeeDTO.getEmail())
                .phone(employeeDTO.getPhone())
                .hireDate(employeeDTO.getHireDate())
                .jobTitle(employeeDTO.getJobTitle())
                .basicSalary(employeeDTO.getBasicSalary())
                .department(department)
                .status(employeeDTO.getStatus() != null ? employeeDTO.getStatus() : "Active")
                .build();

        Employee savedEmployee = employeeRepository.save(employee);

        // Auto-create a User profile for employee
        User user = User.builder()
                .username(savedEmployee.getEmail())
                .password(passwordEncoder.encode("employee123")) // Default password
                .role("ROLE_EMPLOYEE")
                .employee(savedEmployee)
                .build();
        userRepository.save(user);

        return savedEmployee;
    }

    @Transactional
    public Employee updateEmployee(Long id, EmployeeDTO employeeDTO) {
        Employee employee = getEmployeeById(id);

        if (!employee.getEmail().equalsIgnoreCase(employeeDTO.getEmail()) && 
            userRepository.existsByUsername(employeeDTO.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + employeeDTO.getEmail());
        }

        Department department = departmentRepository.findById(employeeDTO.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + employeeDTO.getDepartmentId()));

        // If email changes, update the User entity username as well
        if (!employee.getEmail().equalsIgnoreCase(employeeDTO.getEmail())) {
            User user = userRepository.findByUsername(employee.getEmail()).orElse(null);
            if (user != null) {
                user.setUsername(employeeDTO.getEmail());
                userRepository.save(user);
            }
        }

        employee.setFirstName(employeeDTO.getFirstName());
        employee.setLastName(employeeDTO.getLastName());
        employee.setEmail(employeeDTO.getEmail());
        employee.setPhone(employeeDTO.getPhone());
        employee.setHireDate(employeeDTO.getHireDate());
        employee.setJobTitle(employeeDTO.getJobTitle());
        employee.setBasicSalary(employeeDTO.getBasicSalary());
        employee.setDepartment(department);
        employee.setStatus(employeeDTO.getStatus());

        return employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        
        // Remove associated User profile if exists
        User user = userRepository.findByUsername(employee.getEmail()).orElse(null);
        if (user != null) {
            userRepository.delete(user);
        }

        employeeRepository.delete(employee);
    }
}
