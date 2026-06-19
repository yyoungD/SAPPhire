package com.sapphire.domain.user.service;

import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.user.dto.AdminCompanyDetailResponse;
import com.sapphire.domain.user.dto.AdminCompanyResponse;
import com.sapphire.domain.user.dto.AdminUserDetailResponse;
import com.sapphire.domain.user.dto.AdminUserResponse;
import com.sapphire.domain.user.dto.OAuthLinkRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    List<AdminUserResponse> findAdminUsers();

    AdminUserDetailResponse findAdminUserDetail(Long id);

    AdminUserDetailResponse createAdminUserMemo(Long id, Long adminUserId, String content);

    List<AdminCompanyResponse> findAdminCompanies();

    AdminCompanyDetailResponse findAdminCompanyDetail(Long id);

    AdminCompanyDetailResponse createAdminCompanyMemo(Long id, Long adminUserId, String content);

    LoginResponse.UserInfo linkOAuthAccount(Long userId, OAuthLinkRequest request);

    LoginResponse.UserInfo updateMe(Long userId, String name, String phone, String language, MultipartFile profileImage, boolean removeProfileImage);

    void withdraw(Long userId);
}
