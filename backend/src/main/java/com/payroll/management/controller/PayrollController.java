package com.payroll.management.controller;

import com.payroll.management.entity.Payroll;
import com.payroll.management.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    @GetMapping
    public ResponseEntity<List<Payroll>> getAllPayrolls() {
        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Payroll>> getPayrollByEmployeeId(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollService.getPayrollByEmployeeId(employeeId));
    }

    @PostMapping("/generate")
    public ResponseEntity<Payroll> generatePayroll(
            @RequestParam("employeeId") Long employeeId,
            @RequestParam("payPeriod") String payPeriod,
            @RequestParam(value = "hra", required = false) Double hra,
            @RequestParam(value = "allowances", required = false) Double allowances,
            @RequestParam(value = "bonus", required = false) Double bonus,
            @RequestParam(value = "deductions", required = false) Double deductions) {
        return ResponseEntity.ok(payrollService.generatePayroll(employeeId, payPeriod, hra, allowances, bonus, deductions));
    }
}
