package com.sapphire.domain.consent.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ConsentTerm {
    private Long id;
    private String code;
    private String title;
    private String content;
    private Boolean required;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
