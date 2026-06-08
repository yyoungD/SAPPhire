package com.sapphire.domain.business.controller;

import com.sapphire.domain.business.dto.BusinessStatusRequest;
import com.sapphire.domain.business.dto.BusinessStatusResponse;
import com.sapphire.domain.business.service.BusinessVerificationService;
import com.sapphire.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/business-verifications")
public class BusinessVerificationController {
    private final BusinessVerificationService businessVerificationService;

    public BusinessVerificationController(BusinessVerificationService businessVerificationService) {
        this.businessVerificationService = businessVerificationService;
    }

    @PostMapping("/status")
    public ResponseEntity<ApiResponse<BusinessStatusResponse>> verifyStatus(
            @Valid @RequestBody BusinessStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(businessVerificationService.verifyStatus(request)));
    }
}
