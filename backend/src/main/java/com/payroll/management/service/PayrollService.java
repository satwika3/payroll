package com.payroll.management.service;

import com.payroll.management.entity.Employee;
import com.payroll.management.entity.Payroll;
import com.payroll.management.repository.EmployeeRepository;
import com.payroll.management.repository.PayrollRepository;
import com.payroll.management.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    public Payroll getPayrollById(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with id: " + id));
    }

    public List<Payroll> getPayrollByEmployeeId(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId);
    }

    public Payroll generatePayroll(Long employeeId, String payPeriod, Double hra, Double allowances, Double bonus, Double deductions) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));

        double basic = employee.getBasicSalary();
        double gross = basic + (hra != null ? hra : 0.0) + (allowances != null ? allowances : 0.0) + (bonus != null ? bonus : 0.0);
        double net = gross - (deductions != null ? deductions : 0.0);

        Payroll payroll = payrollRepository.findByEmployeeIdAndPayPeriod(employeeId, payPeriod)
                .orElse(null);

        if (payroll == null) {
            payroll = Payroll.builder()
                    .employee(employee)
                    .payPeriod(payPeriod)
                    .basicSalary(basic)
                    .hra(hra != null ? hra : 0.0)
                    .allowances(allowances != null ? allowances : 0.0)
                    .bonus(bonus != null ? bonus : 0.0)
                    .deductions(deductions != null ? deductions : 0.0)
                    .grossSalary(gross)
                    .netSalary(net)
                    .paymentStatus("Pending")
                    .build();
        } else {
            payroll.setBasicSalary(basic);
            payroll.setHra(hra != null ? hra : 0.0);
            payroll.setAllowances(allowances != null ? allowances : 0.0);
            payroll.setBonus(bonus != null ? bonus : 0.0);
            payroll.setDeductions(deductions != null ? deductions : 0.0);
            payroll.setGrossSalary(gross);
            payroll.setNetSalary(net);
        }

        return payrollRepository.save(payroll);
    }
}
