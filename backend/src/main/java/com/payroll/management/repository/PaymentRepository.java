package com.payroll.management.repository;

import com.payroll.management.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByEmployeeId(Long employeeId);
    List<Payment> findByPayrollId(Long payrollId);
}
