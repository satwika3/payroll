package com.payroll.management.controller;

import com.payroll.management.entity.User;
import com.payroll.management.repository.UserRepository;
import com.payroll.management.dto.LoginRequest;
import com.payroll.management.dto.LoginResponse;
import com.payroll.management.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.payroll.management.repository.AdminRepository adminRepository;

    @Autowired
    private com.payroll.management.repository.EmployeeRepository employeeRepository;

    @Autowired
    private com.payroll.management.repository.DepartmentRepository departmentRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            User user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
            Long employeeId = user.getEmployee() != null ? user.getEmployee().getId() : null;

            return ResponseEntity.ok(new LoginResponse(jwt, user.getUsername(), user.getRole(), employeeId));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody com.payroll.management.dto.SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        String role = signupRequest.getRole();
        if (role == null || (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_EMPLOYEE"))) {
            return ResponseEntity.badRequest().body("Invalid role specified");
        }

        User user = User.builder()
                .username(signupRequest.getUsername())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role(role)
                .build();

        if (role.equals("ROLE_ADMIN")) {
            com.payroll.management.entity.Admin admin = com.payroll.management.entity.Admin.builder()
                    .name(signupRequest.getName() != null ? signupRequest.getName() : "Administrator")
                    .email(signupRequest.getUsername())
                    .phone(signupRequest.getPhone())
                    .build();
            admin = adminRepository.save(admin);
            user.setAdmin(admin);
        } else {
            com.payroll.management.entity.Department department = null;
            if (signupRequest.getDepartmentId() != null) {
                department = departmentRepository.findById(signupRequest.getDepartmentId()).orElse(null);
            }
            if (department == null) {
                return ResponseEntity.badRequest().body("Valid department must be specified for employees");
            }

            com.payroll.management.entity.Employee employee = com.payroll.management.entity.Employee.builder()
                    .firstName(signupRequest.getFirstName() != null ? signupRequest.getFirstName() : "Employee")
                    .lastName(signupRequest.getLastName() != null ? signupRequest.getLastName() : "")
                    .email(signupRequest.getUsername())
                    .phone(signupRequest.getPhone())
                    .jobTitle(signupRequest.getJobTitle() != null ? signupRequest.getJobTitle() : "Staff")
                    .basicSalary(signupRequest.getBasicSalary() != null ? signupRequest.getBasicSalary() : 30000.0)
                    .hireDate(java.time.LocalDate.now())
                    .department(department)
                    .status("Active")
                    .build();
            employee = employeeRepository.save(employee);
            user.setEmployee(employee);
        }

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/departments")
    public ResponseEntity<?> getPublicDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }
}
