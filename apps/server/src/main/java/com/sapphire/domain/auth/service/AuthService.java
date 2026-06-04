package com.sapphire.domain.auth.service;

import com.sapphire.domain.auth.dto.LoginRequest;
import com.sapphire.domain.auth.dto.LoginResponse;
import com.sapphire.domain.auth.dto.OAuthSignupRequest;
import com.sapphire.domain.auth.dto.ReissueRequest;
import com.sapphire.domain.auth.dto.ReissueResponse;
import com.sapphire.domain.auth.dto.SignupRequest;
import com.sapphire.domain.auth.dto.SignupResponse;

public interface AuthService {
    SignupResponse signup(SignupRequest request);

    LoginResponse login(LoginRequest request);

    LoginResponse oauthSignup(OAuthSignupRequest request);

    void logout(Long userId);

    ReissueResponse reissue(ReissueRequest request);
}
