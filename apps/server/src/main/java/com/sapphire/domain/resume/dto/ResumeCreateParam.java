package com.sapphire.domain.resume.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResumeCreateParam {
    private Long id;
    private Long personalProfileId;
    private String title;
    private String summary;
    private String visibility;
    private Boolean primary;
    private Long resumeFileId;
}
