package com.sapphire.domain.profile.controller;

import com.sapphire.domain.profile.dto.CompanyProfile;
import com.sapphire.domain.profile.service.CompanyProfileService;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-profiles")
public class CompanyProfileController {
    private final CompanyProfileService companyProfileService;

    public CompanyProfileController(CompanyProfileService companyProfileService) {
        this.companyProfileService = companyProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CompanyProfile>> findMe(Authentication authentication) {
        CustomUserDetails userDetails = requireUser(authentication);
        return ResponseEntity.ok(ApiResponse.success(companyProfileService.findMe(userDetails.getId())));
    }

    private CustomUserDetails requireUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        return userDetails;
    }
}
