package com.sapphire.domain.profile.controller;

import com.sapphire.domain.profile.dto.CompanyProfile;
import com.sapphire.domain.profile.dto.CompanyProfileUpdateRequest;
import com.sapphire.domain.profile.service.CompanyProfileService;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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

    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CompanyProfile>> updateMe(
            Authentication authentication,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String businessNumber,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String companySize,
            @RequestParam(required = false) String websiteUrl,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String address,
            @RequestParam(value = "logoImage", required = false) MultipartFile logoImage,
            @RequestParam(defaultValue = "false") boolean removeLogo
    ) {
        CustomUserDetails userDetails = requireUser(authentication);
        CompanyProfileUpdateRequest request = new CompanyProfileUpdateRequest(
                companyName,
                businessNumber,
                industry,
                companySize,
                websiteUrl,
                null,
                description,
                address
        );
        return ResponseEntity.ok(ApiResponse.success(companyProfileService.updateMe(userDetails.getId(), request, logoImage, removeLogo)));
    }

    private CustomUserDetails requireUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        return userDetails;
    }
}
