package com.sapphire.domain.sapskill.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SapSkillResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String skillType;
}
