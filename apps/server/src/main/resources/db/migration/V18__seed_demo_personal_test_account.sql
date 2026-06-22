-- Demo personal account for SAP-centered local testing.
-- Login: testuser@test.com / aa123456789!

WITH upsert_user AS (
    INSERT INTO users (
        email,
        password_hash,
        name,
        phone,
        role,
        status,
        language
    )
    VALUES (
        'testuser@test.com',
        '$2a$10$1EBki1UOtdS3P6uioKBHjewnIdkKVjuhzK58YIsfbKCy.tnsfJKC2',
        '김민준',
        '010-1234-5678',
        'PERSONAL',
        'ACTIVE',
        'KO'
    )
    ON CONFLICT (email) DO UPDATE
    SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        language = EXCLUDED.language,
        updated_at = NOW(),
        deleted_at = NULL
    RETURNING id
),
demo_user AS (
    SELECT id FROM upsert_user
    UNION ALL
    SELECT id FROM users WHERE email = 'testuser@test.com'
    LIMIT 1
)
INSERT INTO personal_profiles (
    user_id,
    professional_title,
    desired_salary,
    work_type,
    location,
    career_years,
    sap_skills,
    core_competencies,
    summary,
    is_public,
    is_offer_available,
    ai_verified,
    rating
)
SELECT
    id,
    'SAP FI/CO 주니어 컨설턴트',
    '3,600만원 / 협의',
    '정규직',
    '서울, 경기, 원격 가능',
    1,
    'SAP FI, SAP CO, SAP S/4HANA, SAP MM, SAP SD, ABAP, SAP Fiori',
    'SAP FI/CO 기본 프로세스 이해, 전표 처리 및 결산 흐름 학습, 원가센터/손익센터 개념 이해, MM/SD와 FI 연동 프로세스 이해, S/4HANA 환경의 재무 데이터 구조 학습, ABAP 기본 문법 이해, Fiori 화면 사용 경험, 사용자 요구사항 정리 및 테스트 케이스 작성',
    'SAP FI/CO 모듈을 중심으로 재무회계와 관리회계 기본 프로세스를 학습했으며, 전표 입력, 매입/매출 흐름, 결산, 원가센터, 손익센터 등 핵심 업무 개념을 이해하고 있습니다. 교육 프로젝트에서는 S/4HANA 환경에서 FI와 MM/SD 모듈 간 연동 흐름을 분석하고, 사용자 시나리오 기반 테스트 케이스를 작성했습니다. 또한 ABAP 기본 문법과 Fiori 화면 구조를 학습하여 SAP 프로젝트에서 업무 분석, 테스트, 사용자 지원 역할을 수행할 수 있습니다.',
    TRUE,
    TRUE,
    TRUE,
    4.3
FROM demo_user
ON CONFLICT (user_id) DO UPDATE
SET
    professional_title = EXCLUDED.professional_title,
    desired_salary = EXCLUDED.desired_salary,
    work_type = EXCLUDED.work_type,
    location = EXCLUDED.location,
    career_years = EXCLUDED.career_years,
    sap_skills = EXCLUDED.sap_skills,
    core_competencies = EXCLUDED.core_competencies,
    summary = EXCLUDED.summary,
    is_public = EXCLUDED.is_public,
    is_offer_available = EXCLUDED.is_offer_available,
    ai_verified = EXCLUDED.ai_verified,
    rating = EXCLUDED.rating,
    updated_at = NOW();

UPDATE resumes
SET is_primary = FALSE,
    updated_at = NOW()
WHERE personal_profile_id = (
    SELECT pp.id
    FROM personal_profiles pp
    JOIN users u ON u.id = pp.user_id
    WHERE u.email = 'testuser@test.com'
)
AND deleted_at IS NULL;

INSERT INTO resumes (
    id,
    personal_profile_id,
    title,
    summary,
    visibility,
    is_primary
)
SELECT
    910001,
    pp.id,
    'SAP FI/CO 주니어 컨설턴트 이력서',
    'SAP ERP 컨설턴트 주니어 지원용 이력서입니다. SAP FI/CO 기본 프로세스와 S/4HANA 환경에 대한 이해를 바탕으로 재무회계, 관리회계, 전표 처리, 원가센터, 손익센터 개념을 학습했습니다. SAP MM/SD와의 통합 흐름, ABAP 기본 문법, Fiori 화면 구조를 함께 익히며 SAP 프로젝트에서 업무 프로세스 분석과 시스템 설정을 지원할 수 있는 인재입니다.',
    'PUBLIC',
    TRUE
FROM personal_profiles pp
JOIN users u ON u.id = pp.user_id
WHERE u.email = 'testuser@test.com'
ON CONFLICT (id) DO UPDATE
SET
    personal_profile_id = EXCLUDED.personal_profile_id,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    visibility = EXCLUDED.visibility,
    is_primary = EXCLUDED.is_primary,
    updated_at = NOW(),
    deleted_at = NULL;

DELETE FROM resume_experiences WHERE resume_id = 910001;

INSERT INTO resume_experiences (
    resume_id,
    company_name,
    project_name,
    position,
    role,
    project_type,
    industry,
    start_date,
    end_date,
    is_current,
    description
)
VALUES (
    910001,
    'SAP 교육 프로젝트',
    'S/4HANA FI/CO 통합 프로세스 실습',
    'SAP FI/CO 교육생',
    '재무회계/관리회계 프로세스 분석 및 테스트 케이스 작성',
    '교육 프로젝트',
    'ERP',
    DATE '2025-03-01',
    DATE '2025-08-31',
    FALSE,
    'S/4HANA 환경에서 FI 전표 처리, 매입/매출 흐름, 결산 프로세스, 원가센터와 손익센터 개념을 실습했습니다. MM/SD 모듈과 FI 연동 흐름을 확인하고 사용자 시나리오 기반 테스트 케이스를 작성했습니다.'
);

INSERT INTO resume_sap_skills (
    resume_id,
    sap_skill_id,
    proficiency_level,
    years_of_experience,
    is_primary
)
SELECT
    910001,
    ss.id,
    CASE
        WHEN ss.code IN ('FI', 'CO') THEN 'INTERMEDIATE'
        ELSE 'BEGINNER'
    END,
    CASE
        WHEN ss.code IN ('FI', 'CO', 'S4HANA') THEN 1
        ELSE 0
    END,
    ss.code IN ('FI', 'CO')
FROM sap_skills ss
WHERE ss.code IN ('FI', 'CO', 'S4HANA', 'MM', 'SD', 'ABAP', 'FIORI')
ON CONFLICT (resume_id, sap_skill_id) DO UPDATE
SET
    proficiency_level = EXCLUDED.proficiency_level,
    years_of_experience = EXCLUDED.years_of_experience,
    is_primary = EXCLUDED.is_primary;

DELETE FROM ai_evaluation_items
WHERE ai_evaluation_id IN (
    SELECT id FROM ai_evaluations WHERE resume_id = 910001
);

DELETE FROM ai_evaluations WHERE resume_id = 910001;

WITH demo_profile AS (
    SELECT pp.id AS personal_profile_id
    FROM personal_profiles pp
    JOIN users u ON u.id = pp.user_id
    WHERE u.email = 'testuser@test.com'
),
inserted_evaluation AS (
    INSERT INTO ai_evaluations (
        personal_profile_id,
        resume_id,
        overall_score,
        summary,
        model_name
    )
    SELECT
        personal_profile_id,
        910001,
        86.00,
        'SAP FI/CO 핵심 모듈과 S/4HANA, MM/SD 연동 흐름이 명확해 주니어 FI/CO 컨설턴트 포지션에 적합합니다. 실무 프로젝트 경험은 제한적이지만 교육 프로젝트 기반의 프로세스 이해와 테스트 역량이 강점입니다.',
        'seeded-demo-evaluator'
    FROM demo_profile
    RETURNING id
)
INSERT INTO ai_evaluation_items (
    ai_evaluation_id,
    category,
    score,
    comment
)
SELECT
    id,
    category,
    score,
    comment
FROM inserted_evaluation
CROSS JOIN (
    VALUES
        ('module_fit', 90.00, 'FI/CO를 중심으로 S/4HANA, MM, SD 연동 키워드가 포함되어 SAP 모듈 적합도가 높습니다.'),
        ('fico_process', 88.00, '전표 처리, 결산, 원가센터, 손익센터 등 FI/CO 기본 업무 흐름을 설명할 수 있습니다.'),
        ('technical_support', 78.00, 'ABAP 기초와 Fiori 사용 경험이 있어 개발자와의 협업 및 테스트 지원이 가능합니다.'),
        ('growth_potential', 86.00, '주니어 포지션 기준으로 학습 범위와 지원 직무의 방향성이 잘 맞습니다.')
) AS items(category, score, comment);

INSERT INTO user_consents (
    user_id,
    term_id,
    agreed,
    agreed_at
)
SELECT
    u.id,
    ct.id,
    TRUE,
    NOW()
FROM users u
CROSS JOIN consent_terms ct
WHERE u.email = 'testuser@test.com'
  AND ct.required = TRUE
ON CONFLICT (user_id, term_id) DO UPDATE
SET
    agreed = TRUE,
    agreed_at = NOW();

SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    GREATEST((SELECT MAX(id) FROM users), 1)
);

SELECT setval(
    pg_get_serial_sequence('resumes', 'id'),
    GREATEST((SELECT MAX(id) FROM resumes), 1)
);
