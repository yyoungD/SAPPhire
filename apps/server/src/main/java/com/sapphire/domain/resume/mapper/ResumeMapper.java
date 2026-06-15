package com.sapphire.domain.resume.mapper;

import com.sapphire.domain.resume.dto.ResumeCreateParam;
import com.sapphire.domain.resume.dto.ResumeDetailRow;
import com.sapphire.domain.resume.dto.ResumeExperienceRow;
import com.sapphire.domain.resume.dto.ResumeEvaluationItemParam;
import com.sapphire.domain.resume.dto.ResumeEvaluationParam;
import com.sapphire.domain.resume.dto.ResumeListRow;
import com.sapphire.domain.resume.dto.ResumeSkillCreateRequest;
import com.sapphire.domain.resume.dto.ResumeSkillRow;
import com.sapphire.domain.resume.dto.ResumeUpdateRequest;
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

    Long findResumePersonalProfileId(@Param("userId") Long userId, @Param("resumeId") Long resumeId);

    void clearPrimary(@Param("personalProfileId") Long personalProfileId);

    void insert(ResumeCreateParam param);

    void insertSkills(@Param("resumeId") Long resumeId, @Param("skills") List<ResumeSkillCreateRequest> skills);

    int update(
            @Param("userId") Long userId,
            @Param("resumeId") Long resumeId,
            @Param("request") ResumeUpdateRequest request,
            @Param("visibility") String visibility
    );

    void deleteSkills(@Param("resumeId") Long resumeId);

    void insertEvaluation(ResumeEvaluationParam param);

    void insertEvaluationItems(
            @Param("evaluationId") Long evaluationId,
            @Param("items") List<ResumeEvaluationItemParam> items
    );
}
