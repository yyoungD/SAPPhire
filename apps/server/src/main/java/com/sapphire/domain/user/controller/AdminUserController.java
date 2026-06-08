package com.sapphire.domain.user.controller;

import com.sapphire.domain.user.dto.AdminUserResponse;
import com.sapphire.domain.user.service.UserService;
import com.sapphire.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {
    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> findUsers() {
        return ResponseEntity.ok(ApiResponse.success(userService.findAdminUsers()));
    }
}
