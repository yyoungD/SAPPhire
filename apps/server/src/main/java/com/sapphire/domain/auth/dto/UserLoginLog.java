package com.sapphire.domain.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLoginLog {
    private Long userId;
    private String email;
    private boolean success;
    private String failureReason;
    private String ipAddress;
    private String userAgent;
}
