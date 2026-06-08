package com.sapphire.domain.user.service;

import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.user.dto.AdminUserResponse;
import com.sapphire.domain.user.dto.OAuthLinkRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    List<AdminUserResponse> findAdminUsers();

    LoginResponse.UserInfo linkOAuthAccount(Long userId, OAuthLinkRequest request);

    LoginResponse.UserInfo updateMe(Long userId, String name, String phone, String language, MultipartFile profileImage, boolean removeProfileImage);

    void withdraw(Long userId);
}
