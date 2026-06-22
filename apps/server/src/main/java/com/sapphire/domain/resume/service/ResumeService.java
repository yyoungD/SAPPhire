package com.sapphire.domain.resume.service;

import com.sapphire.domain.resume.dto.CompanyResumeDetail;
import com.sapphire.domain.resume.dto.CompanyResumeListItem;
import com.sapphire.domain.resume.dto.AdminResumeResponse;
import com.sapphire.domain.resume.dto.ResumeCreateRequest;
import com.sapphire.domain.resume.dto.ResumeDetail;
import com.sapphire.domain.resume.dto.ResumeListItem;
import com.sapphire.domain.resume.dto.ResumeUpdateRequest;

import java.util.List;

public interface ResumeService {
    List<AdminResumeResponse> findAdminResumes();

    List<ResumeListItem> findMyResumes(Long userId);

    List<CompanyResumeListItem> findPublicResumes(String role, String keyword);

    CompanyResumeDetail findPublicResume(String role, Long resumeId);

    ResumeDetail findMyResume(Long userId, Long resumeId);

    ResumeListItem createResume(Long userId, ResumeCreateRequest request);

    ResumeDetail updateResume(Long userId, Long resumeId, ResumeUpdateRequest request);

    ResumeDetail evaluateResume(Long userId, Long resumeId);
}
