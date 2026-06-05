package com.sapphire.domain.user.service;

import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.user.dto.OAuthLinkRequest;

public interface UserService {
    LoginResponse.UserInfo linkOAuthAccount(Long userId, OAuthLinkRequest request);

    void withdraw(Long userId);
}
