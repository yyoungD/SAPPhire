package com.sapphire.domain.profile.controller;

import com.sapphire.domain.profile.dto.PersonalProfile;
import com.sapphire.domain.profile.service.PersonalProfileService;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/personal-profiles")
public class PersonalProfileController {
    private final PersonalProfileService personalProfileService;

    public PersonalProfileController(PersonalProfileService personalProfileService) {
        this.personalProfileService = personalProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PersonalProfile>> findMe(Authentication authentication) {
        CustomUserDetails userDetails = requireUser(authentication);
        return ResponseEntity.ok(ApiResponse.success(personalProfileService.findMe(userDetails.getId())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<PersonalProfile>> updateMe(Authentication authentication, @RequestBody PersonalProfile profile) {
        CustomUserDetails userDetails = requireUser(authentication);
        return ResponseEntity.ok(ApiResponse.success(personalProfileService.updateMe(userDetails.getId(), profile)));
    }

    private CustomUserDetails requireUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        return userDetails;
    }
}
