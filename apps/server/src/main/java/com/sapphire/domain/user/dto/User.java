package com.sapphire.domain.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class User {
    private Long id;
    private String email;
    private String passwordHash;
    private String name;
    private String phone;
    private String role;
    private String oauthProvider;
    private String oauthId;
    private Long profileImageFileId;
    private String status;
    private String language;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
