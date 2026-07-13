package com.payroll.management.service;

import com.payroll.management.entity.*;
import com.payroll.management.repository.*;
import com.payroll.management.dto.ReportsSummaryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportsService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public ReportsSummaryResponse getReportsSummary() {
        List<Employee> employees = employeeRepository.findAll();
        List<Payroll> payrolls = payrollRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();
        List<Department> departments = departmentRepository.findAll();

        // 1. Average Basic Wage
        double avgBasicWage = 0.0;
        if (!employees.isEmpty()) {
            avgBasicWage = employees.stream()
                    .mapToDouble(Employee::getBasicSalary)
                    .average()
                    .orElse(0.0);
        }

        // 2. Total distributed payroll amount (Paid Net Salaries)
        double totalDistributedPayroll = payrolls.stream()
                .filter(p -> "Paid".equalsIgnoreCase(p.getPaymentStatus()))
                .mapToDouble(Payroll::getNetSalary)
                .sum();

        // 3. Employee reports (with latest payroll details + total paid + total deductions)
        List<ReportsSummaryResponse.EmployeeReportRow> employeeReports = new ArrayList<>();
        for (Employee emp : employees) {
            List<Payroll> empPayrolls = payrolls.stream()
                    .filter(p -> p.getEmployee().getId().equals(emp.getId()))
                    .collect(Collectors.toList());

            double totalPaid = empPayrolls.stream()
                    .filter(p -> "Paid".equalsIgnoreCase(p.getPaymentStatus()))
                    .mapToDouble(Payroll::getNetSalary)
                    .sum();

            double totalDeducts = empPayrolls.stream()
                    .mapToDouble(Payroll::getDeductions)
                    .sum();

            // Use latest payroll if available, otherwise mock row
            Payroll latestPayroll = empPayrolls.stream()
                    .max(Comparator.comparing(Payroll::getPayPeriod))
                    .orElse(null);

            double basic = latestPayroll != null ? latestPayroll.getBasicSalary() : emp.getBasicSalary();
            double gross = latestPayroll != null ? latestPayroll.getGrossSalary() : basic;
            double deductions = latestPayroll != null ? latestPayroll.getDeductions() : 0.0;
            double net = latestPayroll != null ? latestPayroll.getNetSalary() : basic;
            String status = latestPayroll != null ? latestPayroll.getPaymentStatus() : "N/A";

            employeeReports.add(ReportsSummaryResponse.EmployeeReportRow.builder()
                    .employeeName(emp.getFirstName() + " " + emp.getLastName())
                    .basicSalary(basic)
                    .grossSalary(gross)
                    .deductions(deductions)
                    .netSalary(net)
                    .paymentStatus(status)
                    .totalPaidSalary(totalPaid)
                    .totalDeductions(totalDeducts)
                    .build());
        }

        // 4. Headcount reports
        List<ReportsSummaryResponse.HeadcountReportRow> headcountReports = employees.stream()
                .map(emp -> ReportsSummaryResponse.HeadcountReportRow.builder()
                        .employeeId(emp.getId())
                        .name(emp.getFirstName() + " " + emp.getLastName())
                        .email(emp.getEmail())
                        .phone(emp.getPhone())
                        .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : "None")
                        .jobTitle(emp.getJobTitle())
                        .status(emp.getStatus())
                        .hireDate(emp.getHireDate().toString())
                        .build())
                .collect(Collectors.toList());

        // 5. Department salary reports
        List<ReportsSummaryResponse.DepartmentSalaryRow> departmentSalaryReports = new ArrayList<>();
        for (Department dept : departments) {
            List<Employee> deptEmployees = employees.stream()
                    .filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(dept.getId()))
                    .collect(Collectors.toList());

            int count = deptEmployees.size();
            double totalCost = deptEmployees.stream().mapToDouble(Employee::getBasicSalary).sum();
            double avgCost = count > 0 ? totalCost / count : 0.0;

            departmentSalaryReports.add(ReportsSummaryResponse.DepartmentSalaryRow.builder()
                    .departmentName(dept.getName())
                    .employeeCount(count)
                    .totalSalaryCost(totalCost)
                    .averageSalaryCost(avgCost)
                    .build());
        }

        return ReportsSummaryResponse.builder()
                .averageBasicWage(avgBasicWage)
                .totalDistributedPayrollAmount(totalDistributedPayroll)
                .employeeReports(employeeReports)
                .headcountReports(headcountReports)
                .departmentSalaryReports(departmentSalaryReports)
                .build();
    }
}
