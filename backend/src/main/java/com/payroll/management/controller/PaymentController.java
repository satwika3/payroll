package com.payroll.management.controller;

import com.payroll.management.entity.Payment;
import com.payroll.management.service.PaymentService;
import com.payroll.management.dto.PaymentOrderRequest;
import com.payroll.management.dto.PaymentVerificationRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payment>> getPaymentsByEmployeeId(@PathVariable Long employeeId) {
        return ResponseEntity.ok(paymentService.getPaymentsByEmployeeId(employeeId));
    }

    @PostMapping("/order")
    public ResponseEntity<String> createOrder(@RequestBody PaymentOrderRequest request) {
        try {
            String orderJson = paymentService.createRazorpayOrder(request.getPayrollId());
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(orderJson);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body("{\"message\":\"" + ex.getMessage() + "\"}");
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        boolean isVerified = paymentService.verifyPayment(request);
        if (isVerified) {
            return ResponseEntity.ok("{\"message\":\"Payment verified and recorded successfully.\"}");
        } else {
            return ResponseEntity.status(400).body("{\"message\":\"Payment signature verification failed.\"}");
        }
    }

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody com.payroll.management.dto.ProcessPaymentRequest request) {
        try {
            Payment payment = paymentService.processPayment(request);
            return ResponseEntity.ok(payment);
        } catch (Exception ex) {
            return ResponseEntity.status(400).body("{\"message\":\"" + ex.getMessage() + "\"}");
        }
    }
}
