package com.payroll.management.service;

import com.payroll.management.entity.Attendance;
import com.payroll.management.entity.Employee;
import com.payroll.management.repository.AttendanceRepository;
import com.payroll.management.repository.EmployeeRepository;
import com.payroll.management.exception.ResourceNotFoundException;
import com.payroll.management.dto.AttendanceDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public List<Attendance> getAttendanceByEmployeeId(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    public Attendance recordAttendance(AttendanceDTO attendanceDTO) {
        Employee employee = employeeRepository.findById(attendanceDTO.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + attendanceDTO.getEmployeeId()));

        // If attendance already exists for this employee on this date, update it
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), attendanceDTO.getDate())
                .orElse(null);

        if (attendance == null) {
            attendance = Attendance.builder()
                    .employee(employee)
                    .date(attendanceDTO.getDate())
                    .status(attendanceDTO.getStatus())
                    .checkIn(attendanceDTO.getCheckIn())
                    .checkOut(attendanceDTO.getCheckOut())
                    .build();
        } else {
            attendance.setStatus(attendanceDTO.getStatus());
            attendance.setCheckIn(attendanceDTO.getCheckIn());
            attendance.setCheckOut(attendanceDTO.getCheckOut());
        }

        return attendanceRepository.save(attendance);
    }
}
