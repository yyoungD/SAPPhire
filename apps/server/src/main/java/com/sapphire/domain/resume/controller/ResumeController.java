package com.sapphire.domain.resume.controller;

import com.sapphire.domain.resume.dto.ResumeCreateRequest;
import com.sapphire.domain.resume.dto.ResumeDetail;
import com.sapphire.domain.resume.dto.ResumeListItem;
import com.sapphire.domain.resume.dto.ResumeUpdateRequest;
import com.sapphire.domain.resume.service.ResumeService;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
public class ResumeController {
    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeListItem>>> findMyResumes(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.findMyResumes(userDetails.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeDetail>> findMyResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.findMyResume(userDetails.getId(), id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResumeListItem>> createResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ResumeCreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.createResume(userDetails.getId(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeDetail>> updateResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ResumeUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.updateResume(userDetails.getId(), id, request)));
    }

    @PostMapping("/{id}/analysis")
    public ResponseEntity<ApiResponse<ResumeDetail>> evaluateResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(resumeService.evaluateResume(userDetails.getId(), id)));
    }
}
