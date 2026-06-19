package com.sapphire.domain.user.controller;

import com.sapphire.domain.user.dto.AdminCompanyDetailResponse;
import com.sapphire.domain.user.dto.AdminCompanyResponse;
import com.sapphire.domain.user.dto.AdminUserMemoRequest;
import com.sapphire.domain.user.service.UserService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/companies")
public class AdminCompanyController {
    private final UserService userService;

    public AdminCompanyController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminCompanyResponse>>> findCompanies() {
        return ResponseEntity.ok(ApiResponse.success(userService.findAdminCompanies()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminCompanyDetailResponse>> findCompany(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.findAdminCompanyDetail(id)));
    }

    @PostMapping("/{id}/memos")
    public ResponseEntity<ApiResponse<AdminCompanyDetailResponse>> createMemo(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody AdminUserMemoRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.createAdminCompanyMemo(id, userDetails.getId(), request.content())
        ));
    }
}
