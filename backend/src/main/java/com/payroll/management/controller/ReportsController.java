package com.payroll.management.controller;

import com.payroll.management.dto.ReportsSummaryResponse;
import com.payroll.management.service.ReportsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    @Autowired
    private ReportsService reportsService;

    @GetMapping("/summary")
    public ResponseEntity<ReportsSummaryResponse> getReportsSummary() {
        return ResponseEntity.ok(reportsService.getReportsSummary());
    }
}
