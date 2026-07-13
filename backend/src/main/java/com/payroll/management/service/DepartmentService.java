package com.payroll.management.service;

import com.payroll.management.entity.Department;
import com.payroll.management.repository.DepartmentRepository;
import com.payroll.management.exception.ResourceNotFoundException;
import com.payroll.management.dto.DepartmentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    public Department createDepartment(DepartmentDTO departmentDTO) {
        if (departmentRepository.findByName(departmentDTO.getName()).isPresent()) {
            throw new IllegalArgumentException("Department name already exists: " + departmentDTO.getName());
        }
        Department department = Department.builder()
                .name(departmentDTO.getName())
                .description(departmentDTO.getDescription())
                .build();
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, DepartmentDTO departmentDTO) {
        Department department = getDepartmentById(id);
        
        departmentRepository.findByName(departmentDTO.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Department name already exists: " + departmentDTO.getName());
            }
        });

        department.setName(departmentDTO.getName());
        department.setDescription(departmentDTO.getDescription());
        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        Department department = getDepartmentById(id);
        departmentRepository.delete(department);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public com.payroll.management.dto.DepartmentDetailResponse getDepartmentDetails(Long id) {
        Department dept = getDepartmentById(id);
        
        List<com.payroll.management.dto.DepartmentDetailResponse.EmployeeSummary> employeeSummaries = 
            new java.util.ArrayList<>();
            
        if (dept.getEmployees() != null) {
            for (com.payroll.management.entity.Employee emp : dept.getEmployees()) {
                List<com.payroll.management.dto.DepartmentDetailResponse.AttendanceSummary> attSummaries = 
                    new java.util.ArrayList<>();
                if (emp.getAttendances() != null) {
                    for (com.payroll.management.entity.Attendance att : emp.getAttendances()) {
                        attSummaries.add(com.payroll.management.dto.DepartmentDetailResponse.AttendanceSummary.builder()
                            .id(att.getId())
                            .date(att.getDate().toString())
                            .status(att.getStatus())
                            .checkIn(att.getCheckIn() != null ? att.getCheckIn().toString() : null)
                            .checkOut(att.getCheckOut() != null ? att.getCheckOut().toString() : null)
                            .build());
                    }
                }

                List<com.payroll.management.dto.DepartmentDetailResponse.PaymentSummary> paySummaries = 
                    new java.util.ArrayList<>();
                if (emp.getPayments() != null) {
                    for (com.payroll.management.entity.Payment p : emp.getPayments()) {
                        paySummaries.add(com.payroll.management.dto.DepartmentDetailResponse.PaymentSummary.builder()
                            .id(p.getId())
                            .paymentDate(p.getPaymentDate() != null ? p.getPaymentDate().toString() : null)
                            .amount(p.getAmount())
                            .paymentMethod(p.getPaymentMethod())
                            .status(p.getStatus())
                            .transactionId(p.getTransactionId())
                            .build());
                    }
                }

                employeeSummaries.add(com.payroll.management.dto.DepartmentDetailResponse.EmployeeSummary.builder()
                    .id(emp.getId())
                    .firstName(emp.getFirstName())
                    .lastName(emp.getLastName())
                    .email(emp.getEmail())
                    .jobTitle(emp.getJobTitle())
                    .basicSalary(emp.getBasicSalary())
                    .attendances(attSummaries)
                    .payments(paySummaries)
                    .build());
            }
        }

        return com.payroll.management.dto.DepartmentDetailResponse.builder()
            .id(dept.getId())
            .name(dept.getName())
            .description(dept.getDescription())
            .totalEmployees(employeeSummaries.size())
            .employees(employeeSummaries)
            .build();
    }
}
