package com.payroll.management.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDetailResponse {
    private Long id;
    private String name;
    private String description;
    private int totalEmployees;
    private List<EmployeeSummary> employees;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String jobTitle;
        private Double basicSalary;
        private List<AttendanceSummary> attendances;
        private List<PaymentSummary> payments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceSummary {
        private Long id;
        private String date;
        private String status;
        private String checkIn;
        private String checkOut;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentSummary {
        private Long id;
        private String paymentDate;
        private Double amount;
        private String paymentMethod;
        private String status;
        private String transactionId;
    }
}
