package com.sapphire.domain.application.controller;

import com.sapphire.domain.application.dto.ApplicationCreateRequest;
import com.sapphire.domain.application.dto.ApplicationDetail;
import com.sapphire.domain.application.dto.ApplicationListItem;
import com.sapphire.domain.application.service.ApplicationService;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {
    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApplicationDetail>> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ApplicationCreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.create(userDetails.getId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApplicationListItem>>> findApplications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) Long jobPostId
    ) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.findApplications(userDetails.getId(), userDetails.getRole(), jobPostId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApplicationDetail>> findApplication(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.findApplication(userDetails.getId(), userDetails.getRole(), id)));
    }
}
