package com.sapphire.domain.job.mapper;

import com.sapphire.domain.job.dto.JobCreateParam;
import com.sapphire.domain.job.dto.AdminJobPostResponse;
import com.sapphire.domain.job.dto.CompanyJobPostRow;
import com.sapphire.domain.job.dto.JobAttachmentResponse;
import com.sapphire.domain.job.dto.JobPostRow;
import com.sapphire.domain.job.dto.JobDetailRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface JobPostMapper {
    List<AdminJobPostResponse> findAdminJobs();

    List<JobPostRow> findOpenJobs(@Param("limit") int limit);

    List<JobPostRow> findBookmarkedJobs(@Param("userId") Long userId);

    boolean existsOpenJob(@Param("id") Long id);

    boolean existsJobBookmark(@Param("userId") Long userId, @Param("jobPostId") Long jobPostId);

    void insertJobBookmark(@Param("userId") Long userId, @Param("jobPostId") Long jobPostId);

    int deleteJobBookmark(@Param("userId") Long userId, @Param("jobPostId") Long jobPostId);

    List<CompanyJobPostRow> findCompanyJobs(@Param("companyProfileId") Long companyProfileId);

    JobDetailRow findOpenJobById(@Param("id") Long id);

    JobDetailRow findCompanyJobById(@Param("companyProfileId") Long companyProfileId, @Param("id") Long id);

    Long findCompanyProfileIdByUserId(@Param("userId") Long userId);

    void insertJob(JobCreateParam param);

    int updateJob(@Param("companyProfileId") Long companyProfileId, @Param("param") JobCreateParam param);

    int updateJobStatus(@Param("companyProfileId") Long companyProfileId, @Param("id") Long id, @Param("status") String status);

    int deleteJob(@Param("companyProfileId") Long companyProfileId, @Param("id") Long id);

    void insertJobTag(@Param("jobPostId") Long jobPostId, @Param("tagName") String tagName);

    void deleteJobTags(@Param("jobPostId") Long jobPostId);

    void insertJobSapSkill(@Param("jobPostId") Long jobPostId, @Param("sapSkillId") Long sapSkillId);

    void deleteJobSapSkills(@Param("jobPostId") Long jobPostId);

    void insertJobAttachments(
            @Param("jobPostId") Long jobPostId,
            @Param("userId") Long userId,
            @Param("fileIds") List<Long> fileIds
    );

    void deleteJobAttachments(@Param("jobPostId") Long jobPostId);

    List<JobAttachmentResponse> findJobAttachments(@Param("jobPostId") Long jobPostId);
}
