package com.sapphire.domain.job.controller;

import com.sapphire.domain.job.dto.JobListItem;
import com.sapphire.domain.job.dto.JobDetail;
import com.sapphire.domain.job.service.JobPostService;
import com.sapphire.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobPostController {
    private final JobPostService jobPostService;

    public JobPostController(JobPostService jobPostService) {
        this.jobPostService = jobPostService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobListItem>>> findOpenJobs(
            @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobPostService.findOpenJobs(limit)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDetail>> findOpenJob(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(jobPostService.findOpenJob(id)));
    }
}
