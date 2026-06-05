package com.sapphire.domain.resume.service;

import com.sapphire.domain.resume.dto.ResumeCreateRequest;
import com.sapphire.domain.resume.dto.ResumeDetail;
import com.sapphire.domain.resume.dto.ResumeListItem;

import java.util.List;

public interface ResumeService {
    List<ResumeListItem> findMyResumes(Long userId);

    ResumeDetail findMyResume(Long userId, Long resumeId);

    ResumeListItem createResume(Long userId, ResumeCreateRequest request);
}
