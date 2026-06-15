-- Seed a shared company account for local/demo company-page testing.
-- Login: ansolution@company.com / password123

INSERT INTO users (
    id,
    email,
    password_hash,
    name,
    phone,
    role,
    status,
    language
)
VALUES (
    900031,
    'ansolution@company.com',
    '$2a$10$x2Y7wPUEYxo.H3WtiFlIh.df1EvoUqKm.MXIrPBihxZYYKp63vQAK',
    '염다영',
    '061-930-7071',
    'COMPANY',
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
    deleted_at = NULL;

INSERT INTO files (
    id,
    uploader_user_id,
    original_name,
    stored_name,
    file_path,
    file_url,
    content_type,
    file_size,
    file_category
)
VALUES (
    900031,
    900031,
    'ansolution-logo.png',
    'ansolution-logo.png',
    'apps/client/public/company-logos/ansolution-logo.png',
    '/company-logos/ansolution-logo.png',
    'image/png',
    3712,
    'COMPANY_LOGO'
)
ON CONFLICT (id) DO UPDATE
SET
    uploader_user_id = EXCLUDED.uploader_user_id,
    original_name = EXCLUDED.original_name,
    stored_name = EXCLUDED.stored_name,
    file_path = EXCLUDED.file_path,
    file_url = EXCLUDED.file_url,
    content_type = EXCLUDED.content_type,
    file_size = EXCLUDED.file_size,
    file_category = EXCLUDED.file_category;

INSERT INTO company_profiles (
    id,
    user_id,
    logo_file_id,
    company_name,
    business_number,
    industry,
    company_size,
    website_url,
    description,
    address,
    verification_status
)
VALUES (
    900023,
    900031,
    900031,
    '앤솔루션',
    '877-81-01349',
    'IT 서비스',
    '51-200',
    'https://www.ansol.co.kr/',
    '소프트웨어개발 및 공급, 컴퓨터시스템 구축 및 유지보수 빅데이터와 A.I를 활용한 데이터 시각화 솔루션 개발 및 공급',
    '전남 나주시',
    'APPROVED'
)
ON CONFLICT (user_id) DO UPDATE
SET
    logo_file_id = EXCLUDED.logo_file_id,
    company_name = EXCLUDED.company_name,
    business_number = EXCLUDED.business_number,
    industry = EXCLUDED.industry,
    company_size = EXCLUDED.company_size,
    website_url = EXCLUDED.website_url,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    verification_status = EXCLUDED.verification_status,
    updated_at = NOW();

DELETE FROM job_post_sap_skills WHERE job_post_id BETWEEN 900201 AND 900210;
DELETE FROM job_tags WHERE job_post_id BETWEEN 900201 AND 900210;
DELETE FROM job_posts WHERE id BETWEEN 900201 AND 900210;

WITH ansolution_jobs (
    id,
    title,
    description,
    responsibilities,
    qualifications,
    preferred_qualifications,
    employment_type,
    experience_level,
    min_career_years,
    max_career_years,
    location,
    work_type,
    salary_min,
    salary_max,
    salary_negotiable,
    deadline,
    status,
    view_count,
    created_offset_days,
    skill_codes,
    required_level,
    tags
) AS (
    VALUES
        (900201, 'SAP FI 컨설턴트 채용', '<p>앤솔루션의 재무 회계 프로젝트를 함께 수행할 SAP FI 컨설턴트를 찾습니다.</p>', '요구사항 분석, FI 설정, 결산 프로세스 개선, 사용자 테스트 지원', 'SAP FI 구축 또는 운영 경험과 재무 프로세스 이해가 필요합니다.', 'S/4HANA 전환 프로젝트 경험을 우대합니다.', 'FULL_TIME', 'SAP FI 컨설턴트', 3, 10, '광주, KR', 'REMOTE', 5000, 7000, FALSE, CURRENT_DATE + 21, 'OPEN', 37, 1, ARRAY['FI', 'S4HANA'], 'ADVANCED', ARRAY['SAP_FI', 'SAP_S/4HANA', 'REMOTE']),
        (900202, 'SAP MM 운영 컨설턴트', '<p>구매와 자재관리 영역의 SAP MM 운영 및 개선 과제를 담당합니다.</p>', '구매 프로세스 운영, MM 이슈 분석, 사용자 문의 대응, 개선 과제 도출', 'SAP MM 운영 경험과 구매/자재 업무 이해가 필요합니다.', 'Ariba 연동 경험을 우대합니다.', 'FULL_TIME', 'SAP MM 컨설턴트', 2, 8, '서울, KR', 'HYBRID', 4800, 6800, FALSE, CURRENT_DATE + 25, 'OPEN', 52, 2, ARRAY['MM', 'ARIBA'], 'INTERMEDIATE', ARRAY['SAP_MM', 'SAP_ARIBA', 'HYBRID']),
        (900203, 'SAP ABAP 개발자', '<p>ABAP 기반 개발과 OData 인터페이스 구현을 담당할 개발자를 채용합니다.</p>', 'ABAP 프로그램 개발, OData 서비스 구현, CDS View 개발, 성능 개선', 'ABAP 개발 경험과 SQL 이해가 필요합니다.', 'Fiori/UI5 연계 개발 경험을 우대합니다.', 'FULL_TIME', 'SAP ABAP 개발자', 3, 9, '광주, KR', 'HYBRID', 5200, 8000, FALSE, CURRENT_DATE + 28, 'OPEN', 44, 3, ARRAY['ABAP', 'ODATA', 'CDS_VIEW'], 'ADVANCED', ARRAY['ABAP', 'ODATA', 'CDS_VIEW']),
        (900204, 'SAP BASIS 시스템 운영 엔지니어', '<p>SAP 시스템 안정화와 운영 자동화를 함께 수행할 BASIS 엔지니어를 찾습니다.</p>', 'SAP 시스템 모니터링, 권한 관리, 배포 지원, 장애 대응', 'SAP BASIS 운영 경험과 Linux/DB 기본 이해가 필요합니다.', 'HANA DB 운영 경험을 우대합니다.', 'FULL_TIME', 'SAP BASIS 엔지니어', 3, 10, '서울, KR', 'ONSITE', 5600, 8500, FALSE, CURRENT_DATE + 30, 'OPEN', 61, 4, ARRAY['BASIS', 'S4HANA'], 'ADVANCED', ARRAY['SAP_BASIS', 'SAP_S/4HANA', 'ONSITE']),
        (900205, 'SAP SD 영업 프로세스 컨설턴트', '<p>영업, 주문, 출하 프로세스의 SAP SD 운영 개선을 담당합니다.</p>', 'SD 프로세스 분석, 주문/출하 설정, MM/FI 연계 검토, 운영 개선', 'SAP SD 운영 또는 구축 경험이 필요합니다.', '물류/정산 연계 경험을 우대합니다.', 'CONTRACT', 'SAP SD 컨설턴트', 2, 7, '대전, KR', 'HYBRID', NULL, NULL, TRUE, CURRENT_DATE + 18, 'DRAFT', 12, 5, ARRAY['SD', 'MM', 'FI'], 'INTERMEDIATE', ARRAY['SAP_SD', 'SAP_MM', 'CONTRACT']),
        (900206, 'SAP BTP/CPI 연동 개발자', '<p>BTP와 CPI 기반의 시스템 연동 개발을 수행합니다.</p>', 'CPI iFlow 개발, API 연동, 인터페이스 테스트, 운영 문서 작성', 'SAP CPI 또는 API 연동 개발 경험이 필요합니다.', 'BTP Extension 개발 경험을 우대합니다.', 'FULL_TIME', 'SAP BTP 개발자', 2, 8, '서울, KR', 'REMOTE', 5400, 8200, FALSE, CURRENT_DATE + 32, 'OPEN', 73, 6, ARRAY['BTP', 'CPI'], 'INTERMEDIATE', ARRAY['SAP_BTP', 'SAP_CPI', 'REMOTE']),
        (900207, 'SAP SuccessFactors EC 컨설턴트', '<p>인사 기준정보와 조직 관리 영역의 SuccessFactors 프로젝트를 담당합니다.</p>', 'EC 모듈 설정, 인사 기준정보 정비, 고객 요구사항 분석, 테스트 지원', 'SuccessFactors 또는 HCM 프로젝트 경험이 필요합니다.', '급여/근태 연계 경험을 우대합니다.', 'FULL_TIME', 'SAP SuccessFactors 컨설턴트', 2, 8, '서울, KR', 'HYBRID', 5200, 7800, FALSE, CURRENT_DATE + 35, 'OPEN', 29, 7, ARRAY['SUCCESSFACTORS', 'HCM'], 'INTERMEDIATE', ARRAY['SUCCESSFACTORS', 'SAP_HCM', 'HYBRID']),
        (900208, 'SAP EWM 물류 컨설턴트', '<p>창고관리와 물류 자동화 프로젝트를 함께할 EWM 컨설턴트를 찾습니다.</p>', 'EWM 프로세스 분석, 입출고 설정, 물류 테스트, 현업 교육 지원', 'SAP EWM 또는 WM 경험과 물류 업무 이해가 필요합니다.', '자동화 창고 프로젝트 경험을 우대합니다.', 'PROJECT', 'SAP EWM 컨설턴트', 3, 12, '부산, KR', 'ONSITE', NULL, NULL, TRUE, CURRENT_DATE + 14, 'CLOSED', 88, 8, ARRAY['EWM', 'WM'], 'ADVANCED', ARRAY['SAP_EWM', 'SAP_WM', 'PROJECT']),
        (900209, 'SAP Analytics Cloud 대시보드 개발자', '<p>SAC 기반 경영관리 대시보드와 리포트를 설계하고 구현합니다.</p>', 'SAC 모델링, 대시보드 작성, BW 데이터 연계, 지표 정의', 'SAC 또는 BI 대시보드 개발 경험이 필요합니다.', 'BW/4HANA 경험을 우대합니다.', 'FULL_TIME', 'SAP SAC 개발자', 2, 7, '광주, KR', 'REMOTE', 5000, 7600, FALSE, CURRENT_DATE + 40, 'OPEN', 46, 9, ARRAY['ANALYTICS_CLOUD', 'BW4HANA'], 'INTERMEDIATE', ARRAY['SAP_ANALYTICS_CLOUD', 'SAP_BW/4HANA', 'REMOTE']),
        (900210, 'SAP S/4HANA 전환 PM', '<p>S/4HANA 전환 프로젝트의 일정, 범위, 산출물을 관리할 PM을 모집합니다.</p>', '프로젝트 일정 관리, 이슈 관리, 모듈별 작업 조율, 고객 커뮤니케이션', 'SAP 프로젝트 리딩 경험과 전환 방법론 이해가 필요합니다.', '대기업 ERP 전환 프로젝트 경험을 우대합니다.', 'FULL_TIME', 'SAP S/4HANA PM', 7, 15, '서울, KR', 'HYBRID', 8000, 12000, FALSE, CURRENT_DATE + 45, 'DELETED', 95, 10, ARRAY['S4HANA', 'BASIS'], 'EXPERT', ARRAY['SAP_S/4HANA', 'PM', 'HYBRID'])
)
INSERT INTO job_posts (
    id,
    company_profile_id,
    title,
    description,
    responsibilities,
    qualifications,
    preferred_qualifications,
    employment_type,
    experience_level,
    min_career_years,
    max_career_years,
    location,
    work_type,
    salary_min,
    salary_max,
    salary_negotiable,
    deadline,
    status,
    view_count,
    created_at,
    updated_at
)
SELECT
    id,
    900023,
    title,
    description,
    responsibilities,
    qualifications,
    preferred_qualifications,
    employment_type,
    experience_level,
    min_career_years,
    max_career_years,
    location,
    work_type,
    salary_min,
    salary_max,
    salary_negotiable,
    deadline,
    status,
    view_count,
    NOW() - (created_offset_days || ' days')::INTERVAL,
    NOW()
FROM ansolution_jobs
ON CONFLICT (id) DO UPDATE
SET
    company_profile_id = EXCLUDED.company_profile_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    responsibilities = EXCLUDED.responsibilities,
    qualifications = EXCLUDED.qualifications,
    preferred_qualifications = EXCLUDED.preferred_qualifications,
    employment_type = EXCLUDED.employment_type,
    experience_level = EXCLUDED.experience_level,
    min_career_years = EXCLUDED.min_career_years,
    max_career_years = EXCLUDED.max_career_years,
    location = EXCLUDED.location,
    work_type = EXCLUDED.work_type,
    salary_min = EXCLUDED.salary_min,
    salary_max = EXCLUDED.salary_max,
    salary_negotiable = EXCLUDED.salary_negotiable,
    deadline = EXCLUDED.deadline,
    status = EXCLUDED.status,
    view_count = EXCLUDED.view_count,
    created_at = EXCLUDED.created_at,
    updated_at = NOW(),
    deleted_at = NULL;

WITH ansolution_job_tags (job_post_id, tags) AS (
    VALUES
        (900201, ARRAY['SAP_FI', 'SAP_S/4HANA', 'REMOTE']),
        (900202, ARRAY['SAP_MM', 'SAP_ARIBA', 'HYBRID']),
        (900203, ARRAY['ABAP', 'ODATA', 'CDS_VIEW']),
        (900204, ARRAY['SAP_BASIS', 'SAP_S/4HANA', 'ONSITE']),
        (900205, ARRAY['SAP_SD', 'SAP_MM', 'CONTRACT']),
        (900206, ARRAY['SAP_BTP', 'SAP_CPI', 'REMOTE']),
        (900207, ARRAY['SUCCESSFACTORS', 'SAP_HCM', 'HYBRID']),
        (900208, ARRAY['SAP_EWM', 'SAP_WM', 'PROJECT']),
        (900209, ARRAY['SAP_ANALYTICS_CLOUD', 'SAP_BW/4HANA', 'REMOTE']),
        (900210, ARRAY['SAP_S/4HANA', 'PM', 'HYBRID'])
)
INSERT INTO job_tags (job_post_id, tag_name)
SELECT job_post_id, tag_name
FROM ansolution_job_tags
CROSS JOIN LATERAL UNNEST(tags) AS tag_values(tag_name);

WITH ansolution_job_skills (job_post_id, skill_codes, required_level) AS (
    VALUES
        (900201, ARRAY['FI', 'S4HANA'], 'ADVANCED'),
        (900202, ARRAY['MM', 'ARIBA'], 'INTERMEDIATE'),
        (900203, ARRAY['ABAP', 'ODATA', 'CDS_VIEW'], 'ADVANCED'),
        (900204, ARRAY['BASIS', 'S4HANA'], 'ADVANCED'),
        (900205, ARRAY['SD', 'MM', 'FI'], 'INTERMEDIATE'),
        (900206, ARRAY['BTP', 'CPI'], 'INTERMEDIATE'),
        (900207, ARRAY['SUCCESSFACTORS', 'HCM'], 'INTERMEDIATE'),
        (900208, ARRAY['EWM', 'WM'], 'ADVANCED'),
        (900209, ARRAY['ANALYTICS_CLOUD', 'BW4HANA'], 'INTERMEDIATE'),
        (900210, ARRAY['S4HANA', 'BASIS'], 'EXPERT')
)
INSERT INTO job_post_sap_skills (job_post_id, sap_skill_id, required_level, is_required)
SELECT
    job_post_id,
    sap_skills.id,
    required_level,
    TRUE
FROM ansolution_job_skills
CROSS JOIN LATERAL UNNEST(skill_codes) AS skill_values(code)
JOIN sap_skills ON sap_skills.code = skill_values.code
ON CONFLICT (job_post_id, sap_skill_id) DO UPDATE
SET
    required_level = EXCLUDED.required_level,
    is_required = EXCLUDED.is_required;

SELECT setval(
    pg_get_serial_sequence('users', 'id'),
    GREATEST((SELECT MAX(id) FROM users), 1)
);

SELECT setval(
    pg_get_serial_sequence('company_profiles', 'id'),
    GREATEST((SELECT MAX(id) FROM company_profiles), 1)
);

SELECT setval(
    pg_get_serial_sequence('job_posts', 'id'),
    GREATEST((SELECT MAX(id) FROM job_posts), 1)
);
