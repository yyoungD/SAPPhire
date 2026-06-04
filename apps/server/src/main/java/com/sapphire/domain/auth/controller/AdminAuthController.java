package com.sapphire.domain.auth.controller;

import com.sapphire.domain.auth.dto.AdminLoginRequest;
import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.auth.service.AuthService;
import com.sapphire.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {
    private final AuthService authService;

    public AdminAuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.adminLogin(request)));
    }
}
