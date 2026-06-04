package com.sapphire.domain.job.service;

import com.sapphire.domain.job.dto.JobDetail;
import com.sapphire.domain.job.dto.JobListItem;

import java.util.List;

public interface JobPostService {
    List<JobListItem> findOpenJobs(Integer limit);

    JobDetail findOpenJob(Long id);
}
