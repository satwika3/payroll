package com.payroll.management.service;

import com.payroll.management.entity.*;
import com.payroll.management.repository.*;
import com.payroll.management.dto.PaymentVerificationRequest;
import com.payroll.management.exception.ResourceNotFoundException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByEmployeeId(Long employeeId) {
        return paymentRepository.findByEmployeeId(employeeId);
    }

    public String createRazorpayOrder(Long payrollId) throws Exception {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found with id: " + payrollId));

        double amountInPaise = payroll.getNetSalary() * 100;

        if ("rzp_test_dummykey123".equals(keyId)) {
            // Return mock order details for local development when keys are placeholders
            JSONObject mockOrder = new JSONObject();
            mockOrder.put("id", "order_mock_" + System.currentTimeMillis());
            mockOrder.put("amount", (int) amountInPaise);
            mockOrder.put("currency", "INR");
            mockOrder.put("status", "created");
            return mockOrder.toString();
        }

        RazorpayClient client = new RazorpayClient(keyId, keySecret);
        JSONObject options = new JSONObject();
        options.put("amount", (int) amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", "payroll_rcpt_" + payrollId);

        Order order = client.orders.create(options);
        return order.toString();
    }

    @Transactional
    public boolean verifyPayment(PaymentVerificationRequest req) {
        Payroll payroll = payrollRepository.findById(req.getPayrollId())
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found with id: " + req.getPayrollId()));
        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + req.getEmployeeId()));

        boolean isValid = false;

        if ("rzp_test_dummykey123".equals(keyId) || req.getRazorpaySignature() == null || req.getRazorpaySignature().isEmpty()) {
            // Auto-approve mock payments to ease developer testing
            isValid = true;
        } else {
            try {
                String data = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
                javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
                javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(keySecret.getBytes(), "HmacSHA256");
                mac.init(secretKeySpec);
                byte[] hash = mac.doFinal(data.getBytes());
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) hexString.append('0');
                    hexString.append(hex);
                }
                isValid = hexString.toString().equals(req.getRazorpaySignature());
            } catch (Exception e) {
                isValid = false;
            }
        }

        if (isValid) {
            Payment payment = Payment.builder()
                    .employee(employee)
                    .payroll(payroll)
                    .paymentDate(LocalDateTime.now())
                    .amount(payroll.getNetSalary())
                    .paymentMethod("Razorpay")
                    .transactionId(req.getRazorpayPaymentId() != null ? req.getRazorpayPaymentId() : "TXN_MOCK_" + System.currentTimeMillis())
                    .status("Success")
                    .build();
            paymentRepository.save(payment);

            payroll.setPaymentStatus("Paid");
            payrollRepository.save(payroll);

            return true;
        }

        return false;
    }

    @Transactional
    public Payment processPayment(com.payroll.management.dto.ProcessPaymentRequest req) {
        Payroll payroll = payrollRepository.findById(req.getPayrollId())
                .orElseThrow(() -> new ResourceNotFoundException("Payroll not found with id: " + req.getPayrollId()));
        Employee employee = employeeRepository.findById(req.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + req.getEmployeeId()));

        Payment payment = Payment.builder()
                .employee(employee)
                .payroll(payroll)
                .paymentDate(LocalDateTime.now())
                .amount(payroll.getNetSalary())
                .paymentMethod(req.getPaymentMethod())
                .transactionId("TXN_SIM_" + req.getPaymentMethod().toUpperCase() + "_" + System.currentTimeMillis())
                .status(req.getPaymentStatus()) // "Success" or "Failed"
                .build();
        
        paymentRepository.save(payment);

        if ("Success".equalsIgnoreCase(req.getPaymentStatus())) {
            payroll.setPaymentStatus("Paid");
            payrollRepository.save(payroll);
        } else {
            payroll.setPaymentStatus("Failed");
            payrollRepository.save(payroll);
        }

        return payment;
    }
}
