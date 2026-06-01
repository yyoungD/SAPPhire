package com.sapphire.domain.consent.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserConsent {
    private Long id;
    private Long userId;
    private Long termId;
    private Boolean agreed;
    private LocalDateTime agreedAt;
    private LocalDateTime createdAt;
}
