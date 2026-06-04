package com.sapphire.domain.resume.mapper;

import com.sapphire.domain.resume.dto.ResumeCreateParam;
import com.sapphire.domain.resume.dto.ResumeDetailRow;
import com.sapphire.domain.resume.dto.ResumeExperienceRow;
import com.sapphire.domain.resume.dto.ResumeListRow;
import com.sapphire.domain.resume.dto.ResumeSkillRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ResumeMapper {
    List<ResumeListRow> findMyResumes(@Param("userId") Long userId);

    ResumeDetailRow findMyResumeDetail(@Param("userId") Long userId, @Param("resumeId") Long resumeId);

    List<ResumeSkillRow> findResumeSkills(@Param("resumeId") Long resumeId);

    List<ResumeExperienceRow> findResumeExperiences(@Param("resumeId") Long resumeId);

    Long findPersonalProfileIdByUserId(@Param("userId") Long userId);

    void clearPrimary(@Param("personalProfileId") Long personalProfileId);

    void insert(ResumeCreateParam param);
}
