package com.sapphire.domain.user.service;

import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.auth.mapper.RefreshTokenMapper;
import com.sapphire.domain.file.dto.FileRecord;
import com.sapphire.domain.user.dto.AdminUserResponse;
import com.sapphire.domain.user.dto.OAuthLinkRequest;
import com.sapphire.domain.user.dto.User;
import com.sapphire.domain.user.mapper.UserMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final ProfileImageStorageService profileImageStorageService;

    public UserServiceImpl(
            UserMapper userMapper,
            RefreshTokenMapper refreshTokenMapper,
            ProfileImageStorageService profileImageStorageService
    ) {
        this.userMapper = userMapper;
        this.refreshTokenMapper = refreshTokenMapper;
        this.profileImageStorageService = profileImageStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> findAdminUsers() {
        return userMapper.findAdminUsers();
    }

    @Override
    @Transactional
    public LoginResponse.UserInfo linkOAuthAccount(Long userId, OAuthLinkRequest request) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        String provider = request.provider().trim().toUpperCase();
        String oauthId = request.oauthId().trim();
        String email = request.email().trim().toLowerCase();

        if (!email.equals(user.getEmail())) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "OAuth email must match the current account email.");
        }

        User linkedUser = userMapper.findByOAuth(provider, oauthId);
        if (linkedUser != null && !linkedUser.getId().equals(userId)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "This social account is already linked to another account.");
        }

        if (!isBlank(user.getOauthProvider()) || !isBlank(user.getOauthId())) {
            boolean sameOAuthAccount = provider.equals(user.getOauthProvider()) && oauthId.equals(user.getOauthId());
            if (!sameOAuthAccount) {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "A different social account is already linked.");
            }
        }

        user.setOauthProvider(provider);
        user.setOauthId(oauthId);
        FileRecord profileImage = profileImageStorageService.storeRemoteImage(userId, request.profileImageUrl());
        if (profileImage != null) {
            user.setProfileImageFileId(profileImage.getId());
            user.setProfileImageUrl(profileImage.getFileUrl());
        }
        user.setLanguage(blankToNull(normalizedLanguage(request.language()), user.getLanguage()));
        userMapper.updateOAuthInfo(user);

        return toUserInfo(userMapper.findById(userId));
    }

    @Override
    @Transactional
    public LoginResponse.UserInfo updateMe(Long userId, String name, String phone, String language, MultipartFile profileImage, boolean removeProfileImage) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        user.setName(requiredText(name, "Please enter your name."));
        user.setPhone(requiredText(phone, "Please enter your phone number."));
        user.setLanguage(blankToNull(normalizedLanguage(language), user.getLanguage()));

        if (profileImage != null && !profileImage.isEmpty()) {
            FileRecord storedProfileImage = profileImageStorageService.storeUpload(userId, profileImage);
            user.setProfileImageFileId(storedProfileImage.getId());
            user.setProfileImageUrl(storedProfileImage.getFileUrl());
        } else if (removeProfileImage) {
            user.setProfileImageFileId(null);
            user.setProfileImageUrl(null);
        }

        userMapper.updateProfile(user);
        return toUserInfo(userMapper.findById(userId));
    }

    @Override
    @Transactional
    public void withdraw(Long userId) {
        int updatedCount = userMapper.withdrawById(userId);
        if (updatedCount == 0) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }
        refreshTokenMapper.deleteByUserId(userId);
    }

    private LoginResponse.UserInfo toUserInfo(User user) {
        return new LoginResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                user.getRole(),
                user.getProfileImageUrl(),
                user.getLanguage(),
                user.getOauthProvider()
        );
    }

    private String normalizedLanguage(String language) {
        if (language == null || language.isBlank()) {
            return null;
        }
        return language.trim().toUpperCase().replace('-', '_');
    }

    private String blankToNull(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String requiredText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, message);
        }
        return value.trim();
    }
}
