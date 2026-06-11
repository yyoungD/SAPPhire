package com.sapphire.domain.application.mapper;

import com.sapphire.domain.application.dto.ApplicationCreateParam;
import com.sapphire.domain.application.dto.ApplicationDetailRow;
import com.sapphire.domain.application.dto.ApplicationListRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ApplicationMapper {
    boolean existsOpenJob(@Param("jobPostId") Long jobPostId);

    boolean existsMyResume(@Param("userId") Long userId, @Param("resumeId") Long resumeId);

    boolean existsActiveApplication(@Param("userId") Long userId, @Param("jobPostId") Long jobPostId);

    void insert(ApplicationCreateParam param);

    void insertStatusLog(@Param("applicationId") Long applicationId, @Param("userId") Long userId);

    void insertAttachments(
            @Param("applicationId") Long applicationId,
            @Param("userId") Long userId,
            @Param("fileIds") List<Long> fileIds
    );

    List<ApplicationListRow> findMyApplications(@Param("userId") Long userId);

    List<ApplicationListRow> findCompanyApplications(@Param("userId") Long userId, @Param("jobPostId") Long jobPostId);

    ApplicationDetailRow findMyApplicationDetail(@Param("userId") Long userId, @Param("id") Long id);

    ApplicationDetailRow findCompanyApplicationDetail(@Param("userId") Long userId, @Param("id") Long id);
}
