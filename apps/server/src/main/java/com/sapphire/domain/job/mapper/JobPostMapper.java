package com.sapphire.domain.job.mapper;

import com.sapphire.domain.job.dto.JobCreateParam;
import com.sapphire.domain.job.dto.CompanyJobPostRow;
import com.sapphire.domain.job.dto.JobAttachmentResponse;
import com.sapphire.domain.job.dto.JobPostRow;
import com.sapphire.domain.job.dto.JobDetailRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface JobPostMapper {
    List<JobPostRow> findOpenJobs(@Param("limit") int limit);

    List<CompanyJobPostRow> findCompanyJobs(@Param("companyProfileId") Long companyProfileId);

    JobDetailRow findOpenJobById(@Param("id") Long id);

    JobDetailRow findCompanyJobById(@Param("companyProfileId") Long companyProfileId, @Param("id") Long id);

    Long findCompanyProfileIdByUserId(@Param("userId") Long userId);

    void insertJob(JobCreateParam param);

    void insertJobTag(@Param("jobPostId") Long jobPostId, @Param("tagName") String tagName);

    void insertJobSapSkill(@Param("jobPostId") Long jobPostId, @Param("sapSkillId") Long sapSkillId);

    void insertJobAttachments(
            @Param("jobPostId") Long jobPostId,
            @Param("userId") Long userId,
            @Param("fileIds") List<Long> fileIds
    );

    List<JobAttachmentResponse> findJobAttachments(@Param("jobPostId") Long jobPostId);
}
