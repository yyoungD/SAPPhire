package com.sapphire.domain.user.controller;

import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.user.dto.OAuthLinkRequest;
import com.sapphire.domain.user.service.UserService;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import com.sapphire.global.security.oauth.OAuthLinkStateStore;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;
    private final OAuthLinkStateStore oAuthLinkStateStore;

    public UserController(UserService userService, OAuthLinkStateStore oAuthLinkStateStore) {
        this.userService = userService;
        this.oAuthLinkStateStore = oAuthLinkStateStore;
    }

    @PostMapping("/me/oauth-link")
    public ResponseEntity<ApiResponse<LoginResponse.UserInfo>> linkOAuthAccount(
            Authentication authentication,
            @Valid @RequestBody OAuthLinkRequest request
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        return ResponseEntity.ok(ApiResponse.success(userService.linkOAuthAccount(userDetails.getId(), request)));
    }

    @PostMapping("/me/oauth-link/prepare")
    public ResponseEntity<ApiResponse<Map<String, String>>> prepareOAuthLink(
            Authentication authentication
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        String linkState = oAuthLinkStateStore.createState(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "authorizationUrl",
                "/oauth2/authorization/google?linkState=" + linkState
        )));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<LoginResponse.UserInfo>> updateMe(
            Authentication authentication,
            @RequestParam("name") String name,
            @RequestParam("phone") String phone,
            @RequestParam(value = "language", required = false) String language,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestParam(value = "removeProfileImage", required = false) String removeProfileImage
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        boolean shouldRemoveProfileImage = Boolean.parseBoolean(removeProfileImage);
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateMe(userDetails.getId(), name, phone, language, profileImage, shouldRemoveProfileImage)
        ));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> withdraw(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        userService.withdraw(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
