package com.sapphire.domain.resume.service;

import com.sapphire.domain.resume.dto.ResumeAnalysis;
import com.sapphire.domain.resume.dto.ResumeCreateParam;
import com.sapphire.domain.resume.dto.ResumeCreateRequest;
import com.sapphire.domain.resume.dto.ResumeDetail;
import com.sapphire.domain.resume.dto.ResumeDetailRow;
import com.sapphire.domain.resume.dto.ResumeExperienceItem;
import com.sapphire.domain.resume.dto.ResumeExperienceRow;
import com.sapphire.domain.resume.dto.ResumeListItem;
import com.sapphire.domain.resume.dto.ResumeListRow;
import com.sapphire.domain.resume.dto.ResumeSkillItem;
import com.sapphire.domain.resume.dto.ResumeSkillRow;
import com.sapphire.domain.resume.mapper.ResumeMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
public class ResumeServiceImpl implements ResumeService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy. MM. dd");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM");

    private final ResumeMapper resumeMapper;

    public ResumeServiceImpl(ResumeMapper resumeMapper) {
        this.resumeMapper = resumeMapper;
    }

    @Override
    public List<ResumeListItem> findMyResumes(Long userId) {
        return resumeMapper.findMyResumes(userId)
                .stream()
                .map(this::toListItem)
                .toList();
    }

    @Override
    public ResumeDetail findMyResume(Long userId, Long resumeId) {
        ResumeDetailRow row = resumeMapper.findMyResumeDetail(userId, resumeId);
        if (row == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "이력서를 찾을 수 없습니다.");
        }

        List<ResumeSkillItem> skills = resumeMapper.findResumeSkills(resumeId)
                .stream()
                .map(this::toSkillItem)
                .toList();
        List<ResumeExperienceItem> experiences = resumeMapper.findResumeExperiences(resumeId)
                .stream()
                .map(this::toExperienceItem)
                .toList();

        int score = toPercent(row.getAiScore());
        int moduleScore = row.getModuleScore() == null ? score : toPercent(row.getModuleScore());
        int integrationScore = row.getIntegrationScore() == null ? Math.max(0, score - 8) : toPercent(row.getIntegrationScore());

        return new ResumeDetail(
                row.getId(),
                row.getTitle(),
                row.getSummary(),
                row.getVisibility(),
                formatVisibility(row.getVisibility()),
                Boolean.TRUE.equals(row.getIsPrimary()),
                row.getCreatedAt() == null ? null : row.getCreatedAt().format(DATE_FORMATTER),
                row.getUpdatedAt() == null ? null : row.getUpdatedAt().format(DATE_FORMATTER),
                score,
                row.getOriginalFileName(),
                skills.stream().map(ResumeSkillItem::name).distinct().toList(),
                skills,
                experiences,
                new ResumeAnalysis(
                        moduleScore,
                        integrationScore,
                        defaultText(row.getAiSummary(), "AI 진단 데이터가 아직 없습니다."),
                        parseSuggestions(row.getSuggestionComments())
                )
        );
    }

    @Override
    public ResumeListItem createResume(Long userId, ResumeCreateRequest request) {
        Long personalProfileId = resumeMapper.findPersonalProfileIdByUserId(userId);
        if (personalProfileId == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "개인 프로필을 찾을 수 없습니다.");
        }

        if (request.isPrimary()) {
            resumeMapper.clearPrimary(personalProfileId);
        }

        ResumeCreateParam param = new ResumeCreateParam();
        param.setPersonalProfileId(personalProfileId);
        param.setTitle(request.title());
        param.setSummary(request.summary());
        param.setVisibility(normalizeVisibility(request.visibility()));
        param.setPrimary(request.isPrimary());
        param.setResumeFileId(request.resumeFileId());
        resumeMapper.insert(param);

        return findMyResumes(userId)
                .stream()
                .filter(resume -> resume.id().equals(param.getId()))
                .findFirst()
                .orElseThrow(() -> new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "생성된 이력서를 불러오지 못했습니다."));
    }

    private ResumeListItem toListItem(ResumeListRow row) {
        int score = toPercent(row.getAiScore());
        int moduleScore = row.getModuleScore() == null ? score : toPercent(row.getModuleScore());
        int integrationScore = row.getIntegrationScore() == null ? Math.max(0, score - 8) : toPercent(row.getIntegrationScore());

        return new ResumeListItem(
                row.getId(),
                row.getTitle(),
                row.getSummary(),
                row.getVisibility(),
                formatVisibility(row.getVisibility()),
                Boolean.TRUE.equals(row.getIsPrimary()),
                row.getUpdatedAt() == null ? null : row.getUpdatedAt().format(DATE_FORMATTER),
                score,
                parseCsv(row.getTagsCsv()),
                new ResumeAnalysis(
                        moduleScore,
                        integrationScore,
                        defaultText(row.getAiSummary(), "AI 진단 데이터가 아직 없습니다."),
                        parseSuggestions(row.getSuggestionComments())
                )
        );
    }

    private ResumeSkillItem toSkillItem(ResumeSkillRow row) {
        String level = row.getProficiencyLevel();
        return new ResumeSkillItem(
                row.getId(),
                row.getName(),
                row.getCode(),
                row.getSkillType(),
                level,
                formatProficiency(level),
                row.getYearsOfExperience() == null ? 0 : row.getYearsOfExperience(),
                Boolean.TRUE.equals(row.getPrimary()),
                scoreForLevel(level)
        );
    }

    private ResumeExperienceItem toExperienceItem(ResumeExperienceRow row) {
        return new ResumeExperienceItem(
                row.getId(),
                row.getCompanyName(),
                row.getProjectName(),
                row.getPosition(),
                row.getRole(),
                formatPeriod(row.getStartDate(), row.getEndDate(), Boolean.TRUE.equals(row.getCurrent())),
                row.getIndustry(),
                splitLines(row.getDescription())
        );
    }

    private int toPercent(BigDecimal value) {
        if (value == null) {
            return 0;
        }
        return Math.max(0, Math.min(100, value.setScale(0, java.math.RoundingMode.HALF_UP).intValue()));
    }

    private String formatVisibility(String visibility) {
        if ("PUBLIC".equals(visibility)) {
            return "공개";
        }
        if ("COMPANY_ONLY".equals(visibility)) {
            return "기업 공개";
        }
        return "비공개";
    }

    private String normalizeVisibility(String visibility) {
        if ("PUBLIC".equals(visibility) || "COMPANY_ONLY".equals(visibility) || "PRIVATE".equals(visibility)) {
            return visibility;
        }
        return "PRIVATE";
    }

    private String formatProficiency(String level) {
        if ("EXPERT".equals(level)) return "전문가";
        if ("ADVANCED".equals(level)) return "상급";
        if ("INTERMEDIATE".equals(level)) return "중급";
        if ("BEGINNER".equals(level)) return "초급";
        return "미입력";
    }

    private int scoreForLevel(String level) {
        if ("EXPERT".equals(level)) return 92;
        if ("ADVANCED".equals(level)) return 78;
        if ("INTERMEDIATE".equals(level)) return 58;
        if ("BEGINNER".equals(level)) return 35;
        return 20;
    }

    private String formatPeriod(LocalDate startDate, LocalDate endDate, boolean current) {
        String start = startDate == null ? "시작일 미입력" : startDate.format(MONTH_FORMATTER);
        String end = current ? "현재" : endDate == null ? "종료일 미입력" : endDate.format(MONTH_FORMATTER);
        return start + " - " + end;
    }

    private List<String> parseCsv(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
    }

    private List<String> splitLines(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }
        return Arrays.stream(text.split("\\r?\\n"))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toList();
    }

    private List<String> parseSuggestions(String suggestions) {
        if (suggestions == null || suggestions.isBlank()) {
            return List.of("AI 진단을 실행하면 개선 제안이 표시됩니다.");
        }
        return Arrays.stream(suggestions.split("\\|\\|"))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .distinct()
                .limit(3)
                .toList();
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
