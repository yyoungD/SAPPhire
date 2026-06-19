package com.sapphire.domain.resume.service;

import com.sapphire.domain.resume.dto.ResumeAnalysis;
import com.sapphire.domain.resume.dto.AdminResumeResponse;
import com.sapphire.domain.resume.dto.CompanyResumeDetail;
import com.sapphire.domain.resume.dto.CompanyResumeDetailRow;
import com.sapphire.domain.resume.dto.CompanyResumeListItem;
import com.sapphire.domain.resume.dto.CompanyResumeListRow;
import com.sapphire.domain.resume.dto.ResumeCreateParam;
import com.sapphire.domain.resume.dto.ResumeCreateRequest;
import com.sapphire.domain.resume.dto.ResumeDetail;
import com.sapphire.domain.resume.dto.ResumeDetailRow;
import com.sapphire.domain.resume.dto.ResumeExperienceItem;
import com.sapphire.domain.resume.dto.ResumeExperienceRow;
import com.sapphire.domain.resume.dto.ResumeEvaluationItemParam;
import com.sapphire.domain.resume.dto.ResumeEvaluationParam;
import com.sapphire.domain.resume.dto.ResumeListItem;
import com.sapphire.domain.resume.dto.ResumeListRow;
import com.sapphire.domain.resume.dto.ResumeSkillCreateRequest;
import com.sapphire.domain.resume.dto.ResumeSkillItem;
import com.sapphire.domain.resume.dto.ResumeSkillRow;
import com.sapphire.domain.resume.dto.ResumeUpdateRequest;
import com.sapphire.domain.resume.mapper.ResumeMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResumeServiceImpl implements ResumeService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy. MM. dd");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM");

    private final ResumeMapper resumeMapper;

    public ResumeServiceImpl(ResumeMapper resumeMapper) {
        this.resumeMapper = resumeMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminResumeResponse> findAdminResumes() {
        return resumeMapper.findAdminResumes();
    }

    @Override
    public List<ResumeListItem> findMyResumes(Long userId) {
        return resumeMapper.findMyResumes(userId)
                .stream()
                .map(this::toListItem)
                .toList();
    }

    @Override
    public List<CompanyResumeListItem> findPublicResumes(String role, String keyword) {
        if (!"COMPANY".equals(role)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "기업 회원만 공개 이력서를 조회할 수 있습니다.");
        }

        String normalizedKeyword = keyword == null || keyword.isBlank() ? null : keyword.trim();
        return resumeMapper.findPublicResumes(normalizedKeyword)
                .stream()
                .map(this::toCompanyListItem)
                .toList();
    }

    @Override
    public CompanyResumeDetail findPublicResume(String role, Long resumeId) {
        if (!"COMPANY".equals(role)) {
            throw new CustomException(ErrorCode.ACCESS_DENIED, "기업 회원만 공개 이력서를 조회할 수 있습니다.");
        }

        CompanyResumeDetailRow row = resumeMapper.findPublicResumeDetail(resumeId);
        if (row == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "공개 이력서를 찾을 수 없습니다.");
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

        return new CompanyResumeDetail(
                row.getId(),
                row.getTitle(),
                row.getSummary(),
                row.getApplicantName(),
                row.getApplicantUserId(),
                row.getApplicantEmail(),
                row.getApplicantPhone(),
                row.getApplicantProfileImageUrl(),
                row.getProfessionalTitle(),
                row.getProfileSummary(),
                row.getLocation(),
                row.getCareerYears(),
                row.getDesiredSalary(),
                row.getWorkType(),
                row.getCoreCompetencies(),
                row.getVisibility(),
                formatVisibility(row.getVisibility()),
                row.getCreatedAt() == null ? null : row.getCreatedAt().format(DATE_FORMATTER),
                row.getUpdatedAt() == null ? null : row.getUpdatedAt().format(DATE_FORMATTER),
                score,
                row.getResumeFileId(),
                row.getOriginalFileName(),
                row.getPortfolioUrl(),
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
    @Transactional
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

        List<ResumeSkillCreateRequest> skills = normalizeSkills(request.skills());
        if (!skills.isEmpty()) {
            resumeMapper.insertSkills(param.getId(), skills);
        }

        return findMyResumes(userId)
                .stream()
                .filter(resume -> resume.id().equals(param.getId()))
                .findFirst()
                .orElseThrow(() -> new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "생성된 이력서를 불러오지 못했습니다."));
    }

    @Override
    @Transactional
    public ResumeDetail updateResume(Long userId, Long resumeId, ResumeUpdateRequest request) {
        Long personalProfileId = resumeMapper.findResumePersonalProfileId(userId, resumeId);
        if (personalProfileId == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "수정할 이력서를 찾을 수 없습니다.");
        }

        if (request.isPrimary()) {
            resumeMapper.clearPrimary(personalProfileId);
        }

        int updatedCount = resumeMapper.update(userId, resumeId, request, normalizeVisibility(request.visibility()));
        if (updatedCount == 0) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "이력서 수정에 실패했습니다.");
        }

        resumeMapper.deleteSkills(resumeId);
        List<ResumeSkillCreateRequest> skills = normalizeSkills(request.skills());
        if (!skills.isEmpty()) {
            resumeMapper.insertSkills(resumeId, skills);
        }

        return findMyResume(userId, resumeId);
    }

    @Override
    @Transactional
    public ResumeDetail evaluateResume(Long userId, Long resumeId) {
        ResumeDetailRow row = resumeMapper.findMyResumeDetail(userId, resumeId);
        Long personalProfileId = resumeMapper.findResumePersonalProfileId(userId, resumeId);
        if (row == null || personalProfileId == null) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "진단할 이력서를 찾을 수 없습니다.");
        }

        List<ResumeSkillItem> skills = resumeMapper.findResumeSkills(resumeId)
                .stream()
                .map(this::toSkillItem)
                .toList();
        List<ResumeExperienceItem> experiences = resumeMapper.findResumeExperiences(resumeId)
                .stream()
                .map(this::toExperienceItem)
                .toList();

        int moduleScore = calculateSkillScore(skills);
        int integrationScore = calculateIntegrationScore(skills, experiences);
        int projectScore = calculateProjectScore(row.getSummary(), experiences);
        int overallScore = Math.round(moduleScore * 0.45f + integrationScore * 0.25f + projectScore * 0.30f);

        List<String> suggestions = buildSuggestions(row.getSummary(), skills, experiences, moduleScore, integrationScore, projectScore);
        String summary = buildEvaluationSummary(skills, experiences, moduleScore, projectScore);

        ResumeEvaluationParam evaluation = new ResumeEvaluationParam();
        evaluation.setPersonalProfileId(personalProfileId);
        evaluation.setResumeId(resumeId);
        evaluation.setOverallScore(BigDecimal.valueOf(overallScore));
        evaluation.setSummary(summary);
        evaluation.setModelName("SAPPHIRE_RULE_V1");
        resumeMapper.insertEvaluation(evaluation);

        List<ResumeEvaluationItemParam> items = new ArrayList<>();
        items.add(new ResumeEvaluationItemParam("MODULE_PROFICIENCY", BigDecimal.valueOf(moduleScore), suggestions.get(0)));
        items.add(new ResumeEvaluationItemParam("INTEGRATION_KNOWLEDGE", BigDecimal.valueOf(integrationScore), suggestions.get(1)));
        items.add(new ResumeEvaluationItemParam("PROJECT_SPECIFICITY", BigDecimal.valueOf(projectScore), suggestions.get(2)));
        resumeMapper.insertEvaluationItems(evaluation.getId(), items);

        return findMyResume(userId, resumeId);
    }

    private int calculateSkillScore(List<ResumeSkillItem> skills) {
        if (skills.isEmpty()) return 0;
        double average = skills.stream().mapToInt(ResumeSkillItem::score).average().orElse(0);
        int breadthBonus = Math.min(12, Math.max(0, skills.size() - 1) * 3);
        int experienceBonus = Math.min(10, skills.stream().mapToInt(ResumeSkillItem::yearsOfExperience).sum() / 2);
        return clamp((int) Math.round(average + breadthBonus + experienceBonus));
    }

    private int calculateIntegrationScore(List<ResumeSkillItem> skills, List<ResumeExperienceItem> experiences) {
        if (skills.isEmpty()) return 0;
        long skillTypes = skills.stream().map(ResumeSkillItem::skillType).filter(value -> value != null && !value.isBlank()).distinct().count();
        int score = 25 + Math.min(35, skills.size() * 7) + Math.min(20, (int) skillTypes * 8);
        if (experiences.stream().anyMatch(experience -> !experience.descriptions().isEmpty())) score += 12;
        return clamp(score);
    }

    private int calculateProjectScore(String summary, List<ResumeExperienceItem> experiences) {
        int score = summary == null ? 0 : Math.min(25, summary.trim().length() / 4);
        for (ResumeExperienceItem experience : experiences) {
            score += 10;
            if (hasText(experience.companyName())) score += 3;
            if (hasText(experience.projectName())) score += 4;
            if (hasText(experience.role()) || hasText(experience.position())) score += 4;
            if (!experience.descriptions().isEmpty()) score += Math.min(8, experience.descriptions().size() * 3);
        }
        return clamp(score);
    }

    private List<String> buildSuggestions(
            String summary,
            List<ResumeSkillItem> skills,
            List<ResumeExperienceItem> experiences,
            int moduleScore,
            int integrationScore,
            int projectScore
    ) {
        String skillSuggestion = skills.isEmpty()
                ? "SAP 모듈과 숙련도, 경력 연차를 등록해 핵심 역량을 보여 주세요."
                : moduleScore < 70
                ? "주력 SAP 스킬의 숙련도와 실제 사용 연차를 더 구체적으로 보강해 주세요."
                : "주력 SAP 역량이 잘 드러납니다. 관련 자격이나 대표 성과를 추가하면 더 강해집니다.";
        String integrationSuggestion = integrationScore < 70
                ? "모듈 간 연계, 인터페이스, 데이터 전환 경험을 프로젝트 설명에 추가해 주세요."
                : "여러 역량의 연계 경험이 확인됩니다. 통합 범위와 본인의 책임을 수치로 표현해 주세요.";
        String projectSuggestion = experiences.isEmpty()
                ? "프로젝트 경력을 등록하고 고객사, 기간, 역할, 주요 산출물을 작성해 주세요."
                : projectScore < 70 || !hasText(summary)
                ? "프로젝트별 문제, 수행 내용, 결과를 수치와 함께 구체적으로 작성해 주세요."
                : "프로젝트 정보가 구체적입니다. 비용 절감이나 일정 단축 같은 성과 지표를 추가해 주세요.";
        return List.of(skillSuggestion, integrationSuggestion, projectSuggestion);
    }

    private String buildEvaluationSummary(List<ResumeSkillItem> skills, List<ResumeExperienceItem> experiences, int moduleScore, int projectScore) {
        if (skills.isEmpty() && experiences.isEmpty()) {
            return "등록된 SAP 역량과 프로젝트 경력이 부족해 기본 정보 중심으로 진단했습니다.";
        }
        String strongestSkill = skills.stream()
                .max((left, right) -> Integer.compare(left.score(), right.score()))
                .map(ResumeSkillItem::name)
                .orElse("SAP 역량");
        if (moduleScore >= 75 && projectScore >= 70) {
            return strongestSkill + " 역량과 프로젝트 경험이 구체적으로 연결된 경쟁력 있는 이력서입니다.";
        }
        if (moduleScore >= 65) {
            return strongestSkill + " 역량은 확인되며, 프로젝트 성과와 통합 경험을 보강하면 전문성이 더 선명해집니다.";
        }
        return "보유 역량의 숙련도와 프로젝트 수행 내용을 구체화하면 이력서 진단 점수를 높일 수 있습니다.";
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private int clamp(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private List<ResumeSkillCreateRequest> normalizeSkills(List<ResumeSkillCreateRequest> skills) {
        if (skills == null || skills.isEmpty()) {
            return List.of();
        }

        Map<Long, ResumeSkillCreateRequest> uniqueSkills = new LinkedHashMap<>();
        for (ResumeSkillCreateRequest skill : skills) {
            if (skill == null || skill.sapSkillId() == null) {
                continue;
            }
            uniqueSkills.put(skill.sapSkillId(), new ResumeSkillCreateRequest(
                    skill.sapSkillId(),
                    normalizeProficiency(skill.proficiencyLevel()),
                    skill.yearsOfExperience() == null ? 0 : Math.max(0, Math.min(50, skill.yearsOfExperience())),
                    skill.isPrimary()
            ));
        }
        return uniqueSkills.values().stream().toList();
    }

    private String normalizeProficiency(String level) {
        if ("EXPERT".equals(level) || "ADVANCED".equals(level) || "INTERMEDIATE".equals(level) || "BEGINNER".equals(level)) {
            return level;
        }
        return "INTERMEDIATE";
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

    private CompanyResumeListItem toCompanyListItem(CompanyResumeListRow row) {
        return new CompanyResumeListItem(
                row.getId(),
                row.getTitle(),
                row.getSummary(),
                row.getApplicantName(),
                row.getApplicantProfileImageUrl(),
                row.getLocation(),
                row.getCareerYears(),
                row.getVisibility(),
                formatVisibility(row.getVisibility()),
                row.getUpdatedAt() == null ? null : row.getUpdatedAt().format(DATE_FORMATTER),
                toPercent(row.getAiScore()),
                parseCsv(row.getTagsCsv())
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
