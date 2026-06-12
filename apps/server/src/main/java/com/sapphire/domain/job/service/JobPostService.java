package com.sapphire.domain.job.service;

import com.sapphire.domain.job.dto.JobCreateRequest;
import com.sapphire.domain.job.dto.JobCreateResponse;
import com.sapphire.domain.job.dto.CompanyJobListItem;
import com.sapphire.domain.job.dto.JobDetail;
import com.sapphire.domain.job.dto.JobListItem;

import java.util.List;

public interface JobPostService {
    JobCreateResponse createJob(Long userId, JobCreateRequest request);

    JobCreateResponse updateJob(Long userId, Long id, JobCreateRequest request);

    JobCreateResponse updateJobStatus(Long userId, Long id, String status);

    void deleteJob(Long userId, Long id);

    List<JobListItem> findOpenJobs(Integer limit);

    List<CompanyJobListItem> findCompanyJobs(Long userId);

    JobDetail findCompanyJob(Long userId, Long id);

    JobDetail findOpenJob(Long id);
}
