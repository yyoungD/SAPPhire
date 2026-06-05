package com.sapphire.domain.resume.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResumeSkillRow {
    private Long id;
    private String code;
    private String name;
    private String skillType;
    private String proficiencyLevel;
    private Integer yearsOfExperience;
    private Boolean primary;
}
