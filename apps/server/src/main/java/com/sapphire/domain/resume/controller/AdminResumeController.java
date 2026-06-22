package com.sapphire.domain.resume.controller;

import com.sapphire.domain.resume.dto.AdminResumeResponse;
import com.sapphire.domain.resume.service.ResumeService;
import com.sapphire.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/resumes")
public class AdminResumeController {
    private final ResumeService resumeService;

    public AdminResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminResumeResponse>>> findResumes() {
        return ResponseEntity.ok(ApiResponse.success(resumeService.findAdminResumes()));
    }
}
