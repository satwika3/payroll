package com.payroll.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "employee")
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"payrolls", "payments", "attendances", "user"})
    private Employee employee;

    @Column(name = "pay_period", nullable = false)
    private String payPeriod; // "YYYY-MM"

    @Column(name = "basic_salary", nullable = false)
    private Double basicSalary;

    @Column(nullable = false)
    private Double hra;

    @Column(nullable = false)
    private Double allowances;

    @Column(nullable = false)
    private Double bonus;

    @Column(nullable = false)
    private Double deductions;

    @Column(name = "gross_salary", nullable = false)
    private Double grossSalary;

    @Column(name = "net_salary", nullable = false)
    private Double netSalary;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus; // "Pending", "Paid"
}
