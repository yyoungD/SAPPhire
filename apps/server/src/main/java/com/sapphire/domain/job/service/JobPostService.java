package com.sapphire.domain.job.service;

import com.sapphire.domain.job.dto.JobCreateRequest;
import com.sapphire.domain.job.dto.JobCreateResponse;
import com.sapphire.domain.job.dto.AdminJobPostResponse;
import com.sapphire.domain.job.dto.CompanyJobListItem;
import com.sapphire.domain.job.dto.CompanyJobSummary;
import com.sapphire.domain.job.dto.JobDetail;
import com.sapphire.domain.job.dto.JobListItem;

import java.util.List;

public interface JobPostService {
    List<AdminJobPostResponse> findAdminJobs();

    JobCreateResponse createJob(Long userId, JobCreateRequest request);

    JobCreateResponse updateJob(Long userId, Long id, JobCreateRequest request);

    JobCreateResponse updateJobStatus(Long userId, Long id, String status);

    void deleteJob(Long userId, Long id);

    List<JobListItem> findOpenJobs(Integer limit);

    List<JobListItem> findBookmarkedJobs(Long userId);

    boolean isBookmarked(Long userId, Long jobPostId);

    void bookmarkJob(Long userId, Long jobPostId);

    void removeBookmark(Long userId, Long jobPostId);

    List<CompanyJobListItem> findCompanyJobs(Long userId);

    CompanyJobSummary findCompanyJobSummary(Long userId);

    JobDetail findCompanyJob(Long userId, Long id);

    JobDetail findOpenJob(Long id);
}
