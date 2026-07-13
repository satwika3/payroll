package com.payroll.management.config;

import com.payroll.management.entity.*;
import com.payroll.management.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // If departments exist, skip seeding rest
        if (departmentRepository.count() > 0) {
            return;
        }

        // Seed Departments
        Department hr = Department.builder().name("Human Resources").description("Manages employee lifecycle and relations").build();
        Department eng = Department.builder().name("Engineering").description("Software engineering and tech operations").build();
        Department fin = Department.builder().name("Finance").description("Manages accounting, audit, and budgeting").build();
        Department sales = Department.builder().name("Sales").description("Handles business development and customer acquisitions").build();
        
        departmentRepository.saveAll(Arrays.asList(hr, eng, fin, sales));

        // Seed Employees (Indian Names)
        Employee Gowthami = Employee.builder()
                .firstName("Gowthami")
                .lastName("Kavuru")
                .email("gowthami@payroll.com")
                .phone("9876543210")
                .hireDate(LocalDate.now().minusYears(2))
                .jobTitle("Senior Java Developer")
                .basicSalary(25000.0) // Matches reports example basic wage
                .department(eng)
                .status("Active")
                .build();

        Employee Priya = Employee.builder()
                .firstName("Priya")
                .lastName("Sharma")
                .email("priya@payroll.com")
                .phone("9876543211")
                .hireDate(LocalDate.now().minusYears(1))
                .jobTitle("HR Manager")
                .basicSalary(55000.0)
                .department(hr)
                .status("Active")
                .build();

        Employee Rahul = Employee.builder()
                .firstName("Rahul")
                .lastName("Verma")
                .email("rahul@payroll.com")
                .phone("9876543212")
                .hireDate(LocalDate.now().minusMonths(6))
                .jobTitle("QA Engineer")
                .basicSalary(45000.0)
                .department(eng)
                .status("Active")
                .build();

        Employee SaiKumar = Employee.builder()
                .firstName("Sai Kumar")
                .lastName("Goud")
                .email("sai.kumar@payroll.com")
                .phone("9876543213")
                .hireDate(LocalDate.now().minusYears(3))
                .jobTitle("Tech Lead")
                .basicSalary(90000.0)
                .department(eng)
                .status("Active")
                .build();

        Employee Anjali = Employee.builder()
                .firstName("Anjali")
                .lastName("Patel")
                .email("anjali@payroll.com")
                .phone("9876543214")
                .hireDate(LocalDate.now().minusMonths(9))
                .jobTitle("Finance Specialist")
                .basicSalary(60000.0)
                .department(fin)
                .status("Active")
                .build();

        Employee Kiran = Employee.builder()
                .firstName("Kiran")
                .lastName("Rao")
                .email("kiran@payroll.com")
                .phone("9876543215")
                .hireDate(LocalDate.now().minusMonths(3))
                .jobTitle("Sales Lead")
                .basicSalary(50000.0)
                .department(sales)
                .status("Active")
                .build();

        Employee Deepika = Employee.builder()
                .firstName("Deepika")
                .lastName("Padukone")
                .email("deepika@payroll.com")
                .phone("9876543216")
                .hireDate(LocalDate.now().minusMonths(12))
                .jobTitle("Recruiter")
                .basicSalary(40000.0)
                .department(hr)
                .status("Active")
                .build();

        List<Employee> allEmployees = Arrays.asList(Gowthami, Priya, Rahul, SaiKumar, Anjali, Kiran, Deepika);
        employeeRepository.saveAll(allEmployees);

        // Create logins for these employees (using encrypted passwords)
        for (Employee emp : allEmployees) {
            User empUser = User.builder()
                    .username(emp.getEmail())
                    .password(passwordEncoder.encode("employee123"))
                    .role("ROLE_EMPLOYEE")
                    .employee(emp)
                    .build();
            userRepository.save(empUser);
        }

        // Seed Attendance (last 5 days)
        LocalDate today = LocalDate.now();
        for (Employee emp : allEmployees) {
            for (int i = 5; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                // skip weekend
                if (date.getDayOfWeek().getValue() >= 6) continue;
                
                String status = "PRESENT";
                LocalTime checkIn = LocalTime.of(9, 0);
                LocalTime checkOut = LocalTime.of(18, 0);

                // Add some variations
                if (emp.getFirstName().equals("Priya") && i == 2) {
                    status = "LEAVE";
                    checkIn = null;
                    checkOut = null;
                } else if (emp.getFirstName().equals("Rahul") && i == 4) {
                    status = "ABSENT";
                    checkIn = null;
                    checkOut = null;
                }

                Attendance attendance = Attendance.builder()
                        .employee(emp)
                        .date(date)
                        .status(status)
                        .checkIn(checkIn)
                        .checkOut(checkOut)
                        .build();
                attendanceRepository.save(attendance);
            }
        }

        // Seed Payroll & Payments History
        // Month: June 2026
        String payPeriod = "2026-06";
        for (Employee emp : allEmployees) {
            double basic = emp.getBasicSalary();
            // Let's match Reports example specifically for Gowthami:
            // Basic Salary: 25000, Paid Salary: 28000, Deductions: 2000, Net Salary: 26000
            double allowances = 3000.0;
            double bonus = 2000.0;
            double deductions = 2000.0;
            double hra = basic * 0.4;
            
            if (!emp.getFirstName().equals("Gowthami")) {
                hra = basic * 0.4;
                allowances = 5000.0;
                bonus = 3000.0;
                deductions = 4000.0;
            }
            
            double gross = basic + allowances + bonus;
            double net = gross - deductions;

            Payroll payroll = Payroll.builder()
                    .employee(emp)
                    .payPeriod(payPeriod)
                    .basicSalary(basic)
                    .hra(hra)
                    .allowances(allowances)
                    .bonus(bonus)
                    .deductions(deductions)
                    .grossSalary(gross)
                    .netSalary(net)
                    .paymentStatus("Paid")
                    .build();
            payrollRepository.save(payroll);

            Payment payment = Payment.builder()
                    .employee(emp)
                    .payroll(payroll)
                    .paymentDate(LocalDateTime.now().minusDays(2))
                    .amount(net)
                    .paymentMethod("UPI")
                    .transactionId("pay_MOCK_" + emp.getId() + "_202606")
                    .status("Success")
                    .build();
            paymentRepository.save(payment);
        }
        
        // Seed Pending Payroll for July 2026
        String nextPeriod = "2026-07";
        for (Employee emp : allEmployees) {
            double basic = emp.getBasicSalary();
            double allowances = 4500.0;
            double bonus = 0.0;
            double deductions = 4000.0;
            double hra = basic * 0.4;
            
            if (emp.getFirstName().equals("Gowthami")) {
                allowances = 3000.0;
                bonus = 2000.0;
                deductions = 2000.0;
            }
            
            double gross = basic + allowances + bonus;
            double net = gross - deductions;

            Payroll payroll = Payroll.builder()
                    .employee(emp)
                    .payPeriod(nextPeriod)
                    .basicSalary(basic)
                    .hra(hra)
                    .allowances(allowances)
                    .bonus(bonus)
                    .deductions(deductions)
                    .grossSalary(gross)
                    .netSalary(net)
                    .paymentStatus("Pending")
                    .build();
            payrollRepository.save(payroll);
        }
    }
}
