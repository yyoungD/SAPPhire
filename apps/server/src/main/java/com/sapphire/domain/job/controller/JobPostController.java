package com.sapphire.domain.job.controller;

import com.sapphire.domain.job.dto.JobCreateRequest;
import com.sapphire.domain.job.dto.JobCreateResponse;
import com.sapphire.domain.job.dto.CompanyJobListItem;
import com.sapphire.domain.job.dto.JobListItem;
import com.sapphire.domain.job.dto.JobDetail;
import com.sapphire.domain.job.service.JobPostService;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @PostMapping
    public ResponseEntity<ApiResponse<JobCreateResponse>> createJob(
            Authentication authentication,
            @Valid @RequestBody JobCreateRequest request
    ) {
        CustomUserDetails userDetails = requireUser(authentication);
        if (!"COMPANY".equals(userDetails.getRole())) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }
        return ResponseEntity.ok(ApiResponse.success(jobPostService.createJob(userDetails.getId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobListItem>>> findOpenJobs(
            @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(jobPostService.findOpenJobs(limit)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<CompanyJobListItem>>> findMyCompanyJobs(
            Authentication authentication
    ) {
        CustomUserDetails userDetails = requireCompany(authentication);
        return ResponseEntity.ok(ApiResponse.success(jobPostService.findCompanyJobs(userDetails.getId())));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<ApiResponse<JobDetail>> findMyCompanyJob(
            Authentication authentication,
            @PathVariable Long id
    ) {
        CustomUserDetails userDetails = requireCompany(authentication);
        return ResponseEntity.ok(ApiResponse.success(jobPostService.findCompanyJob(userDetails.getId(), id)));
    }

    @PutMapping("/me/{id}")
    public ResponseEntity<ApiResponse<JobCreateResponse>> updateMyCompanyJob(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody JobCreateRequest request
    ) {
        CustomUserDetails userDetails = requireCompany(authentication);
        return ResponseEntity.ok(ApiResponse.success(jobPostService.updateJob(userDetails.getId(), id, request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDetail>> findOpenJob(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(jobPostService.findOpenJob(id)));
    }

    private CustomUserDetails requireUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        return userDetails;
    }

    private CustomUserDetails requireCompany(Authentication authentication) {
        CustomUserDetails userDetails = requireUser(authentication);
        if (!"COMPANY".equals(userDetails.getRole())) {
            throw new CustomException(ErrorCode.ACCESS_DENIED);
        }
        return userDetails;
    }
}
