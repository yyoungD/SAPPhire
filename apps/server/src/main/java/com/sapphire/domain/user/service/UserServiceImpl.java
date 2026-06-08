package com.sapphire.domain.user.service;

import com.sapphire.domain.auth.mapper.RefreshTokenMapper;
import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.user.dto.AdminUserResponse;
import com.sapphire.domain.user.dto.OAuthLinkRequest;
import com.sapphire.domain.user.dto.User;
import com.sapphire.domain.user.mapper.UserMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private static final long MAX_PROFILE_IMAGE_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_PROFILE_IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    private final UserMapper userMapper;
    private final RefreshTokenMapper refreshTokenMapper;
    private final Path profileImageRoot;

    public UserServiceImpl(
            UserMapper userMapper,
            RefreshTokenMapper refreshTokenMapper,
            @Value("${profile-image.upload-dir:../../profileImg}") String profileImageUploadDir
    ) {
        this.userMapper = userMapper;
        this.refreshTokenMapper = refreshTokenMapper;
        this.profileImageRoot = Path.of(profileImageUploadDir).toAbsolutePath().normalize();
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
        user.setProfileImageUrl(blankToNull(request.profileImageUrl(), user.getProfileImageUrl()));
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

        user.setName(requiredText(name, "이름을 입력해 주세요."));
        user.setPhone(requiredText(phone, "전화번호를 입력해 주세요."));
        user.setLanguage(blankToNull(normalizedLanguage(language), user.getLanguage()));

        if (profileImage != null && !profileImage.isEmpty()) {
            user.setProfileImageUrl(storeProfileImage(userId, profileImage));
        } else if (removeProfileImage) {
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

    private String storeProfileImage(Long userId, MultipartFile file) {
        validateProfileImage(file);

        String originalName = cleanOriginalName(file.getOriginalFilename());
        String extension = extensionOf(originalName);
        String storedName = UUID.randomUUID() + "." + extension;
        Path uploadDir = profileImageRoot.resolve(String.valueOf(userId)).normalize();
        Path target = uploadDir.resolve(storedName).normalize();

        if (!target.startsWith(profileImageRoot)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "잘못된 파일 경로입니다.");
        }

        try {
            Files.createDirectories(uploadDir);
            file.transferTo(target);
        } catch (IOException exception) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "프로필 사진 저장에 실패했습니다.");
        }

        return "/profileImg/" + userId + "/" + storedName;
    }

    private void validateProfileImage(MultipartFile file) {
        if (file.getSize() > MAX_PROFILE_IMAGE_SIZE) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "프로필 사진은 최대 5MB까지 업로드할 수 있습니다.");
        }

        String extension = extensionOf(cleanOriginalName(file.getOriginalFilename()));
        if (!ALLOWED_PROFILE_IMAGE_EXTENSIONS.contains(extension)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "JPG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "이미지 파일만 업로드할 수 있습니다.");
        }
    }

    private String requiredText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, message);
        }
        return value.trim();
    }

    private String cleanOriginalName(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            return "profile";
        }
        return Path.of(originalName).getFileName().toString();
    }

    private String extensionOf(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
