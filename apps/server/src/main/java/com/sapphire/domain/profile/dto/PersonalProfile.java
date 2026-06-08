package com.sapphire.domain.profile.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PersonalProfile {
    private Long id;
    private Long userId;
    private String professionalTitle;
    private String desiredSalary;
    private String workType;
    private String location;
    private Integer careerYears;
    private String sapSkills;
    private String coreCompetencies;
    private String summary;
    private Boolean isPublic;
    private Boolean isOfferAvailable;
}
