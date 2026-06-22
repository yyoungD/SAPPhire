package com.sapphire.domain.job.controller;

import com.sapphire.domain.job.dto.AdminJobPostResponse;
import com.sapphire.domain.job.service.JobPostService;
import com.sapphire.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/jobs")
public class AdminJobPostController {
    private final JobPostService jobPostService;

    public AdminJobPostController(JobPostService jobPostService) {
        this.jobPostService = jobPostService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminJobPostResponse>>> findJobs() {
        return ResponseEntity.ok(ApiResponse.success(jobPostService.findAdminJobs()));
    }
}
