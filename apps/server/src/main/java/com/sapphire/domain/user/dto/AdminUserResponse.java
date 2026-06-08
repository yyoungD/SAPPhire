package com.sapphire.domain.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AdminUserResponse {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String role;
    private String oauthProvider;
    private Long profileImageFileId;
    private String profileImageUrl;
    private String status;
    private String language;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
