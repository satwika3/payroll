package com.payroll.management.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportsSummaryResponse {
    private Double averageBasicWage;
    private Double totalDistributedPayrollAmount;
    
    private List<EmployeeReportRow> employeeReports;
    private List<HeadcountReportRow> headcountReports;
    private List<DepartmentSalaryRow> departmentSalaryReports;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeReportRow {
        private String employeeName;
        private Double basicSalary;
        private Double grossSalary;
        private Double deductions;
        private Double netSalary;
        private String paymentStatus;
        private Double totalPaidSalary;
        private Double totalDeductions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeadcountReportRow {
        private Long employeeId;
        private String name;
        private String email;
        private String phone;
        private String departmentName;
        private String jobTitle;
        private String status;
        private String hireDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentSalaryRow {
        private String departmentName;
        private int employeeCount;
        private Double totalSalaryCost;
        private Double averageSalaryCost;
    }
}
