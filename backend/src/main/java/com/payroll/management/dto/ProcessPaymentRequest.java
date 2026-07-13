package com.payroll.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentRequest {
    private Long payrollId;
    private Long employeeId;
    private String paymentMethod; // "UPI", "PhonePe", "Card"
    private String paymentStatus; // "Success", "Failed"
    private String paymentDetails; // e.g. UPI ID, Card Number, Phone Number
}
