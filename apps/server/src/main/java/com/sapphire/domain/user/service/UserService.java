package com.sapphire.domain.user.service;

import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.user.dto.AdminUserResponse;
import com.sapphire.domain.user.dto.OAuthLinkRequest;

import java.util.List;

public interface UserService {
    List<AdminUserResponse> findAdminUsers();

    LoginResponse.UserInfo linkOAuthAccount(Long userId, OAuthLinkRequest request);

    void withdraw(Long userId);
}
