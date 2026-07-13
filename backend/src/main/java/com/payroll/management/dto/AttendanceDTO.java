package com.payroll.management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long employeeId;
    private LocalDate date;
    private String status; // "PRESENT", "ABSENT", "LEAVE", "HALF_DAY"
    private LocalTime checkIn;
    private LocalTime checkOut;
}
