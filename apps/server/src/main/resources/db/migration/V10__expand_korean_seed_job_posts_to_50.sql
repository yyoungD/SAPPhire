-- Expand Korean SAP recruitment seed postings to 50 rows.
-- This migration is additive after V9 so already-migrated local databases avoid
-- Flyway checksum conflicts while still replacing the previous 20-row seed set.

DELETE FROM job_post_sap_skills WHERE job_post_id BETWEEN 900001 AND 900200;
DELETE FROM job_tags WHERE job_post_id BETWEEN 900001 AND 900200;
DELETE FROM job_posts WHERE id BETWEEN 900001 AND 900200;

WITH seed_companies (seq, company_name, industry, company_size, website_url, description, address) AS (
    VALUES
        (1, '삼정KPMG', '컨설팅', '1001-5000', 'https://home.kpmg/kr/ko/home.html', 'ERP 전략 수립, SAP S/4HANA 전환, 재무/관리회계 프로세스 혁신을 지원하는 컨설팅 조직입니다.', '서울 강남구 테헤란로'),
        (2, '딜로이트 안진회계법인', '컨설팅', '1001-5000', 'https://www2.deloitte.com/kr/ko.html', 'SAP 기반 디지털 전환, 글로벌 롤아웃, PI 및 업무 프로세스 혁신 프로젝트를 수행합니다.', '서울 영등포구 국제금융로'),
        (3, 'LG CNS', 'IT 서비스', '5000+', 'https://www.lgcns.com', '제조, 물류, 금융 영역의 대형 SAP 구축 및 운영 서비스를 제공하는 DX 전문 기업입니다.', '서울 강서구 마곡중앙로'),
        (4, '삼성SDS', 'IT 서비스', '5000+', 'https://www.samsungsds.com', '엔터프라이즈 클라우드, ERP 운영, 글로벌 제조 시스템 혁신을 수행합니다.', '서울 송파구 올림픽로35길'),
        (5, '현대오토에버', '모빌리티 IT', '5000+', 'https://www.hyundai-autoever.com', '자동차 및 부품 제조사의 SAP ERP 운영, S/4HANA 전환, 데이터 표준화를 담당합니다.', '서울 강남구 테헤란로'),
        (6, 'SK C&C', 'IT 서비스', '5000+', 'https://www.skcc.co.kr', '그룹사 ERP 고도화, 클라우드 전환, SAP 운영 자동화 프로젝트를 수행합니다.', '경기 성남시 분당구 성남대로'),
        (7, '포스코DX', '제조 IT', '1001-5000', 'https://www.poscodx.com', '철강 및 제조 현장의 SAP, MES, 물류 시스템을 통합하는 산업 DX 기업입니다.', '경북 포항시 남구'),
        (8, '롯데이노베이트', '유통 IT', '1001-5000', 'https://www.lotteinnovate.com', '유통, 식품, 서비스 계열사의 SAP ERP 구축 및 운영을 담당합니다.', '서울 금천구 가산디지털2로'),
        (9, '한화시스템', 'ICT', '1001-5000', 'https://www.hanwhasystems.com', '제조 및 방산 ERP 고도화와 SAP 기반 업무 표준화 프로젝트를 수행합니다.', '서울 중구 청계천로'),
        (10, '메가존클라우드', '클라우드', '1001-5000', 'https://www.megazone.com', '클라우드 기반 SAP 전환, BTP, 데이터 분석 플랫폼 구축을 지원합니다.', '서울 강남구 논현로'),
        (11, 'CJ올리브네트웍스', '유통 IT', '1001-5000', 'https://www.cjolivenetworks.co.kr', '식품, 물류, 커머스 영역의 ERP 운영과 데이터 기반 업무 혁신을 수행합니다.', '서울 용산구 한강대로'),
        (12, 'KT DS', 'IT 서비스', '1001-5000', 'https://www.ktds.com', '그룹사 ERP, 클라우드, 데이터 플랫폼 구축 및 운영 서비스를 제공합니다.', '서울 서초구 효령로'),
        (13, '신세계아이앤씨', '리테일 IT', '1001-5000', 'https://www.shinsegae-inc.com', '리테일 업무 프로세스와 SAP 기반 기준정보, 물류, 재무 시스템을 운영합니다.', '서울 중구 남대문시장길'),
        (14, 'GS ITM', 'IT 서비스', '501-1000', 'https://www.gsitm.com', '에너지, 유통, 서비스 산업의 SAP 운영 및 고도화 프로젝트를 수행합니다.', '서울 종로구 종로'),
        (15, '효성ITX', 'IT 서비스', '1001-5000', 'https://www.hyosungitx.com', '제조 및 서비스 기업의 SAP 운영, 인프라, 데이터 연계를 지원합니다.', '서울 영등포구 선유동2로')
),
seed_users AS (
    INSERT INTO users (id, email, password_hash, name, phone, role, status)
    SELECT
        900000 + seq,
        FORMAT('seed-company-%s@sapphire.local', LPAD(seq::TEXT, 3, '0')),
        NULL,
        company_name,
        FORMAT('02-555-%04s', seq),
        'COMPANY',
        'ACTIVE'
    FROM seed_companies
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        updated_at = NOW(),
        deleted_at = NULL
    RETURNING id
)
INSERT INTO company_profiles (
    id,
    user_id,
    company_name,
    business_number,
    industry,
    company_size,
    website_url,
    description,
    address,
    verification_status
)
SELECT
    900000 + seq,
    900000 + seq,
    company_name,
    FORMAT('220-88-%05s', 90000 + seq),
    industry,
    company_size,
    website_url,
    description,
    address,
    'APPROVED'
FROM seed_companies
ON CONFLICT (id) DO UPDATE
SET
    company_name = EXCLUDED.company_name,
    business_number = EXCLUDED.business_number,
    industry = EXCLUDED.industry,
    company_size = EXCLUDED.company_size,
    website_url = EXCLUDED.website_url,
    description = EXCLUDED.description,
    address = EXCLUDED.address,
    verification_status = EXCLUDED.verification_status,
    updated_at = NOW();

WITH seed_jobs (
    seq,
    title,
    primary_skill_code,
    secondary_skill_code,
    domain_name,
    career_label,
    min_years,
    max_years,
    location,
    work_type,
    employment_type,
    salary_min,
    salary_max,
    salary_negotiable,
    required_level
) AS (
    VALUES
        (1, 'SAP FI/CO 컨설턴트 경력직 채용', 'FI', 'CO', '재무회계와 관리회계', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 6000, 9500, FALSE, 'ADVANCED'),
        (2, 'SAP S/4HANA 전환 PM/PL 모집', 'S4HANA', 'BASIS', 'S/4HANA 전환', '경력 7년 이상', 7, 15, '서울, KR', 'ONSITE', 'FULL_TIME', 8000, 13000, FALSE, 'EXPERT'),
        (3, 'SAP MM 구매/자재 컨설턴트', 'MM', 'ARIBA', '구매와 자재관리', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8500, FALSE, 'INTERMEDIATE'),
        (4, 'SAP ABAP 개발자 채용', 'ABAP', 'ODATA', 'ABAP 개발', '경력 3~9년', 3, 9, '서울, KR', 'HYBRID', 'FULL_TIME', 5500, 9000, FALSE, 'ADVANCED'),
        (5, 'SAP SD 영업/출하 모듈 운영 담당자', 'SD', 'MM', '영업과 출하관리', '경력 2~7년', 2, 7, '서울, KR', 'ONSITE', 'FULL_TIME', 5000, 7800, FALSE, 'INTERMEDIATE'),
        (6, 'SAP BASIS 시스템 운영 엔지니어', 'BASIS', 'S4HANA', 'SAP 시스템 운영', '경력 3~10년', 3, 10, '경기 성남, KR', 'HYBRID', 'FULL_TIME', 5600, 9200, FALSE, 'ADVANCED'),
        (7, 'SAP PP 생산관리 컨설턴트', 'PP', 'MM', '생산계획과 공정관리', '경력 3~9년', 3, 9, '경북 포항, KR', 'ONSITE', 'FULL_TIME', 5400, 8800, FALSE, 'ADVANCED'),
        (8, 'SAP BW/4HANA 데이터 컨설턴트', 'BW4HANA', 'ANALYTICS_CLOUD', '데이터 분석과 리포팅', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8600, FALSE, 'INTERMEDIATE'),
        (9, 'SAP EWM 물류 컨설턴트', 'EWM', 'WM', '창고와 물류관리', '경력 3~12년', 3, 12, '서울, KR', 'ONSITE', 'PROJECT', NULL, NULL, TRUE, 'ADVANCED'),
        (10, 'SAP BTP/CPI 연동 개발자', 'BTP', 'CPI', '클라우드 연동', '경력 2~8년', 2, 8, '서울, KR', 'REMOTE', 'FULL_TIME', 5400, 9000, FALSE, 'INTERMEDIATE'),
        (11, 'SAP Fiori/UI5 프론트엔드 개발자', 'FIORI', 'UI5', 'Fiori 사용자 경험', '경력 2~6년', 2, 6, '서울, KR', 'HYBRID', 'FULL_TIME', 5000, 8000, FALSE, 'INTERMEDIATE'),
        (12, 'SAP SuccessFactors EC 컨설턴트', 'SUCCESSFACTORS', 'HCM', '인사 기준정보', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8400, FALSE, 'INTERMEDIATE'),
        (13, 'SAP QM 품질관리 모듈 컨설턴트', 'QM', 'PP', '품질관리', '경력 2~8년', 2, 8, '서울, KR', 'ONSITE', 'FULL_TIME', 5000, 8200, FALSE, 'INTERMEDIATE'),
        (14, 'SAP HANA DB 운영 DBA', 'BASIS', 'S4HANA', 'HANA DB 운영', '경력 3~10년', 3, 10, '경기 성남, KR', 'HYBRID', 'FULL_TIME', 5800, 9800, FALSE, 'ADVANCED'),
        (15, 'SAP PM 설비보전 컨설턴트', 'PM', 'MM', '설비보전', '경력 2~9년', 2, 9, '경북 포항, KR', 'ONSITE', 'CONTRACT', NULL, NULL, TRUE, 'INTERMEDIATE'),
        (16, 'SAP CO 원가/수익성 분석 컨설턴트', 'CO', 'FI', '원가와 손익분석', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 5800, 9300, FALSE, 'ADVANCED'),
        (17, 'SAP 보안/권한 운영 담당자', 'BASIS', 'FIORI', 'SAP 권한과 내부통제', '경력 2~7년', 2, 7, '서울, KR', 'HYBRID', 'FULL_TIME', 4800, 7600, FALSE, 'INTERMEDIATE'),
        (18, 'SAP 클라우드 마이그레이션 컨설턴트', 'BASIS', 'BTP', '클라우드 마이그레이션', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 6200, 10500, FALSE, 'ADVANCED'),
        (19, 'SAP Ariba 구매 시스템 컨설턴트', 'ARIBA', 'MM', '전략구매', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8500, FALSE, 'INTERMEDIATE'),
        (20, 'SAP Concur 구축/운영 컨설턴트', 'CONCUR', 'FI', '경비와 출장정산', '경력 1~6년', 1, 6, '서울, KR', 'REMOTE', 'FULL_TIME', 4200, 7000, FALSE, 'BEGINNER'),
        (21, 'SAP SD/MM 통합 운영 컨설턴트', 'SD', 'MM', '영업-물류 통합 운영', '경력 4~10년', 4, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 6000, 9600, FALSE, 'ADVANCED'),
        (22, 'SAP FI 결산 프로세스 개선 담당자', 'FI', 'S4HANA', '월결산과 재무마감', '경력 3~8년', 3, 8, '서울, KR', 'ONSITE', 'FULL_TIME', 5600, 8700, FALSE, 'ADVANCED'),
        (23, 'SAP CO 관리회계 운영 리더', 'CO', 'FI', '관리회계 운영', '경력 5~12년', 5, 12, '서울, KR', 'HYBRID', 'FULL_TIME', 7000, 11500, FALSE, 'EXPERT'),
        (24, 'SAP ABAP CDS View 개발자', 'ABAP', 'CDS_VIEW', 'CDS View와 분석 모델', '경력 2~7년', 2, 7, '서울, KR', 'REMOTE', 'FULL_TIME', 5200, 8400, FALSE, 'INTERMEDIATE'),
        (25, 'SAP PI/PO 인터페이스 운영 담당자', 'PI_PO', 'CPI', '인터페이스 운영', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8500, FALSE, 'INTERMEDIATE'),
        (26, 'SAP CPI 글로벌 연동 개발자', 'CPI', 'BTP', '글로벌 시스템 연동', '경력 3~9년', 3, 9, '서울, KR', 'REMOTE', 'FULL_TIME', 6000, 9800, FALSE, 'ADVANCED'),
        (27, 'SAP Analytics Cloud 컨설턴트', 'ANALYTICS_CLOUD', 'BW4HANA', '경영 분석 대시보드', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5400, 8900, FALSE, 'INTERMEDIATE'),
        (28, 'SAP HCM 급여/근태 운영 컨설턴트', 'HCM', 'SUCCESSFACTORS', '급여와 근태관리', '경력 3~10년', 3, 10, '서울, KR', 'ONSITE', 'FULL_TIME', 5600, 9000, FALSE, 'ADVANCED'),
        (29, 'SAP WM 물류센터 운영 담당자', 'WM', 'MM', '물류센터 운영', '경력 2~7년', 2, 7, '경기 이천, KR', 'ONSITE', 'FULL_TIME', 4800, 7600, FALSE, 'INTERMEDIATE'),
        (30, 'SAP EWM 자동화 창고 구축 PL', 'EWM', 'BTP', '자동화 창고 구축', '경력 6~13년', 6, 13, '경기 용인, KR', 'ONSITE', 'PROJECT', NULL, NULL, TRUE, 'EXPERT'),
        (31, 'SAP PP/QM 제조 프로세스 개선 컨설턴트', 'PP', 'QM', '생산과 품질 통합', '경력 4~10년', 4, 10, '충북 청주, KR', 'ONSITE', 'FULL_TIME', 5800, 9300, FALSE, 'ADVANCED'),
        (32, 'SAP MM 외주/재고 프로세스 운영', 'MM', 'PP', '외주와 재고관리', '경력 2~7년', 2, 7, '부산, KR', 'HYBRID', 'FULL_TIME', 4800, 7600, FALSE, 'INTERMEDIATE'),
        (33, 'SAP SD 가격/프로모션 운영 컨설턴트', 'SD', 'FI', '가격과 청구관리', '경력 3~9년', 3, 9, '서울, KR', 'HYBRID', 'FULL_TIME', 5400, 8800, FALSE, 'ADVANCED'),
        (34, 'SAP S/4HANA FI 데이터 이관 담당자', 'FI', 'S4HANA', '재무 데이터 이관', '경력 3~8년', 3, 8, '서울, KR', 'HYBRID', 'CONTRACT', NULL, NULL, TRUE, 'ADVANCED'),
        (35, 'SAP Master Data Governance 컨설턴트', 'S4HANA', 'MM', '기준정보 거버넌스', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 6000, 9500, FALSE, 'ADVANCED'),
        (36, 'SAP Retail 프로세스 컨설턴트', 'SD', 'MM', '리테일 매입과 판매', '경력 3~9년', 3, 9, '서울, KR', 'ONSITE', 'FULL_TIME', 5600, 9000, FALSE, 'ADVANCED'),
        (37, 'SAP BTP Extension 개발 컨설턴트', 'BTP', 'UI5', '확장 앱 개발', '경력 3~9년', 3, 9, '서울, KR', 'REMOTE', 'FULL_TIME', 6200, 10000, FALSE, 'ADVANCED'),
        (38, 'SAP Fiori Launchpad 운영 담당자', 'FIORI', 'BASIS', 'Fiori 포털 운영', '경력 2~7년', 2, 7, '서울, KR', 'HYBRID', 'FULL_TIME', 4800, 7600, FALSE, 'INTERMEDIATE'),
        (39, 'SAP BW 데이터마트 구축 개발자', 'BW', 'BW4HANA', '데이터마트 구축', '경력 3~9년', 3, 9, '서울, KR', 'HYBRID', 'FULL_TIME', 5600, 9200, FALSE, 'ADVANCED'),
        (40, 'SAP SAC 경영관리 대시보드 개발자', 'ANALYTICS_CLOUD', 'CO', '경영관리 대시보드', '경력 2~7년', 2, 7, '서울, KR', 'REMOTE', 'FULL_TIME', 5000, 8200, FALSE, 'INTERMEDIATE'),
        (41, 'SAP BASIS 권한/전송 관리 담당자', 'BASIS', 'FIORI', '권한과 전송관리', '경력 2~8년', 2, 8, '대전, KR', 'HYBRID', 'FULL_TIME', 5000, 8000, FALSE, 'INTERMEDIATE'),
        (42, 'SAP HANA 성능 튜닝 엔지니어', 'BASIS', 'S4HANA', 'HANA 성능 개선', '경력 4~11년', 4, 11, '서울, KR', 'HYBRID', 'FULL_TIME', 6500, 11000, FALSE, 'EXPERT'),
        (43, 'SAP PM/QM 플랜트 운영 컨설턴트', 'PM', 'QM', '플랜트 보전과 품질', '경력 3~9년', 3, 9, '울산, KR', 'ONSITE', 'FULL_TIME', 5400, 8800, FALSE, 'ADVANCED'),
        (44, 'SAP SuccessFactors 채용 모듈 컨설턴트', 'SUCCESSFACTORS', 'HCM', '채용과 인재관리', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8600, FALSE, 'INTERMEDIATE'),
        (45, 'SAP Ariba Supplier Lifecycle 컨설턴트', 'ARIBA', 'MM', '협력사 라이프사이클', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5400, 8800, FALSE, 'INTERMEDIATE'),
        (46, 'SAP Concur Expense 운영 담당자', 'CONCUR', 'FI', '경비정산 운영', '경력 1~5년', 1, 5, '서울, KR', 'REMOTE', 'FULL_TIME', 4000, 6500, FALSE, 'BEGINNER'),
        (47, 'SAP OData Gateway 개발자', 'ODATA', 'ABAP', 'Gateway 서비스 개발', '경력 2~7년', 2, 7, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8400, FALSE, 'INTERMEDIATE'),
        (48, 'SAP UI5 모바일 앱 개발자', 'UI5', 'ODATA', '모바일 업무 앱', '경력 2~7년', 2, 7, '서울, KR', 'REMOTE', 'FULL_TIME', 5200, 8500, FALSE, 'INTERMEDIATE'),
        (49, 'SAP S/4HANA 운영 안정화 컨설턴트', 'S4HANA', 'BASIS', '오픈 안정화와 운영 전환', '경력 5~12년', 5, 12, '서울, KR', 'HYBRID', 'CONTRACT', NULL, NULL, TRUE, 'EXPERT'),
        (50, 'SAP 글로벌 롤아웃 모듈 컨설턴트', 'S4HANA', 'SD', '글로벌 템플릿 롤아웃', '경력 5~12년', 5, 12, '서울, KR', 'HYBRID', 'FULL_TIME', 7200, 12000, FALSE, 'EXPERT')
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
    900000 + seq,
    900000 + (1 + ((seq - 1) % 15)),
    title,
    domain_name || ' 영역의 SAP 프로젝트를 수행하며, 현업 요구사항을 시스템 기능으로 연결할 전문가를 모집합니다.',
    domain_name || ' 업무 프로세스 분석, SAP 설정 및 개발 협의, 통합 테스트, 데이터 검증, 오픈 후 안정화 지원을 담당합니다.',
    primary_skill_code || ' 관련 SAP 구축 또는 운영 경험과 현업 커뮤니케이션 역량, 테스트 산출물 작성 경험이 필요합니다.',
    'S/4HANA 전환, 글로벌 롤아웃, 클라우드 연동, 제조/유통/서비스 업종 프로젝트 경험자를 우대합니다.',
    employment_type,
    career_label,
    min_years,
    max_years,
    location,
    work_type,
    salary_min,
    salary_max,
    salary_negotiable,
    CURRENT_DATE + (20 + (seq % 35)),
    'OPEN',
    120 + (seq * 19),
    NOW() - ((seq % 14) || ' days')::INTERVAL,
    NOW()
FROM seed_jobs
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

WITH seed_jobs (
    seq,
    title,
    primary_skill_code,
    secondary_skill_code,
    domain_name,
    career_label,
    min_years,
    max_years,
    location,
    work_type,
    employment_type,
    salary_min,
    salary_max,
    salary_negotiable,
    required_level
) AS (
    VALUES
        (1, 'SAP FI/CO 컨설턴트 경력직 채용', 'FI', 'CO', '재무회계와 관리회계', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 6000, 9500, FALSE, 'ADVANCED'),
        (2, 'SAP S/4HANA 전환 PM/PL 모집', 'S4HANA', 'BASIS', 'S/4HANA 전환', '경력 7년 이상', 7, 15, '서울, KR', 'ONSITE', 'FULL_TIME', 8000, 13000, FALSE, 'EXPERT'),
        (3, 'SAP MM 구매/자재 컨설턴트', 'MM', 'ARIBA', '구매와 자재관리', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8500, FALSE, 'INTERMEDIATE'),
        (4, 'SAP ABAP 개발자 채용', 'ABAP', 'ODATA', 'ABAP 개발', '경력 3~9년', 3, 9, '서울, KR', 'HYBRID', 'FULL_TIME', 5500, 9000, FALSE, 'ADVANCED'),
        (5, 'SAP SD 영업/출하 모듈 운영 담당자', 'SD', 'MM', '영업과 출하관리', '경력 2~7년', 2, 7, '서울, KR', 'ONSITE', 'FULL_TIME', 5000, 7800, FALSE, 'INTERMEDIATE'),
        (6, 'SAP BASIS 시스템 운영 엔지니어', 'BASIS', 'S4HANA', 'SAP 시스템 운영', '경력 3~10년', 3, 10, '경기 성남, KR', 'HYBRID', 'FULL_TIME', 5600, 9200, FALSE, 'ADVANCED'),
        (7, 'SAP PP 생산관리 컨설턴트', 'PP', 'MM', '생산계획과 공정관리', '경력 3~9년', 3, 9, '경북 포항, KR', 'ONSITE', 'FULL_TIME', 5400, 8800, FALSE, 'ADVANCED'),
        (8, 'SAP BW/4HANA 데이터 컨설턴트', 'BW4HANA', 'ANALYTICS_CLOUD', '데이터 분석과 리포팅', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8600, FALSE, 'INTERMEDIATE'),
        (9, 'SAP EWM 물류 컨설턴트', 'EWM', 'WM', '창고와 물류관리', '경력 3~12년', 3, 12, '서울, KR', 'ONSITE', 'PROJECT', NULL, NULL, TRUE, 'ADVANCED'),
        (10, 'SAP BTP/CPI 연동 개발자', 'BTP', 'CPI', '클라우드 연동', '경력 2~8년', 2, 8, '서울, KR', 'REMOTE', 'FULL_TIME', 5400, 9000, FALSE, 'INTERMEDIATE'),
        (11, 'SAP Fiori/UI5 프론트엔드 개발자', 'FIORI', 'UI5', 'Fiori 사용자 경험', '경력 2~6년', 2, 6, '서울, KR', 'HYBRID', 'FULL_TIME', 5000, 8000, FALSE, 'INTERMEDIATE'),
        (12, 'SAP SuccessFactors EC 컨설턴트', 'SUCCESSFACTORS', 'HCM', '인사 기준정보', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8400, FALSE, 'INTERMEDIATE'),
        (13, 'SAP QM 품질관리 모듈 컨설턴트', 'QM', 'PP', '품질관리', '경력 2~8년', 2, 8, '서울, KR', 'ONSITE', 'FULL_TIME', 5000, 8200, FALSE, 'INTERMEDIATE'),
        (14, 'SAP HANA DB 운영 DBA', 'BASIS', 'S4HANA', 'HANA DB 운영', '경력 3~10년', 3, 10, '경기 성남, KR', 'HYBRID', 'FULL_TIME', 5800, 9800, FALSE, 'ADVANCED'),
        (15, 'SAP PM 설비보전 컨설턴트', 'PM', 'MM', '설비보전', '경력 2~9년', 2, 9, '경북 포항, KR', 'ONSITE', 'CONTRACT', NULL, NULL, TRUE, 'INTERMEDIATE'),
        (16, 'SAP CO 원가/수익성 분석 컨설턴트', 'CO', 'FI', '원가와 손익분석', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 5800, 9300, FALSE, 'ADVANCED'),
        (17, 'SAP 보안/권한 운영 담당자', 'BASIS', 'FIORI', 'SAP 권한과 내부통제', '경력 2~7년', 2, 7, '서울, KR', 'HYBRID', 'FULL_TIME', 4800, 7600, FALSE, 'INTERMEDIATE'),
        (18, 'SAP 클라우드 마이그레이션 컨설턴트', 'BASIS', 'BTP', '클라우드 마이그레이션', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 6200, 10500, FALSE, 'ADVANCED'),
        (19, 'SAP Ariba 구매 시스템 컨설턴트', 'ARIBA', 'MM', '전략구매', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8500, FALSE, 'INTERMEDIATE'),
        (20, 'SAP Concur 구축/운영 컨설턴트', 'CONCUR', 'FI', '경비와 출장정산', '경력 1~6년', 1, 6, '서울, KR', 'REMOTE', 'FULL_TIME', 4200, 7000, FALSE, 'BEGINNER'),
        (21, 'SAP SD/MM 통합 운영 컨설턴트', 'SD', 'MM', '영업-물류 통합 운영', '경력 4~10년', 4, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 6000, 9600, FALSE, 'ADVANCED'),
        (22, 'SAP FI 결산 프로세스 개선 담당자', 'FI', 'S4HANA', '월결산과 재무마감', '경력 3~8년', 3, 8, '서울, KR', 'ONSITE', 'FULL_TIME', 5600, 8700, FALSE, 'ADVANCED'),
        (23, 'SAP CO 관리회계 운영 리더', 'CO', 'FI', '관리회계 운영', '경력 5~12년', 5, 12, '서울, KR', 'HYBRID', 'FULL_TIME', 7000, 11500, FALSE, 'EXPERT'),
        (24, 'SAP ABAP CDS View 개발자', 'ABAP', 'CDS_VIEW', 'CDS View와 분석 모델', '경력 2~7년', 2, 7, '서울, KR', 'REMOTE', 'FULL_TIME', 5200, 8400, FALSE, 'INTERMEDIATE'),
        (25, 'SAP PI/PO 인터페이스 운영 담당자', 'PI_PO', 'CPI', '인터페이스 운영', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8500, FALSE, 'INTERMEDIATE'),
        (26, 'SAP CPI 글로벌 연동 개발자', 'CPI', 'BTP', '글로벌 시스템 연동', '경력 3~9년', 3, 9, '서울, KR', 'REMOTE', 'FULL_TIME', 6000, 9800, FALSE, 'ADVANCED'),
        (27, 'SAP Analytics Cloud 컨설턴트', 'ANALYTICS_CLOUD', 'BW4HANA', '경영 분석 대시보드', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5400, 8900, FALSE, 'INTERMEDIATE'),
        (28, 'SAP HCM 급여/근태 운영 컨설턴트', 'HCM', 'SUCCESSFACTORS', '급여와 근태관리', '경력 3~10년', 3, 10, '서울, KR', 'ONSITE', 'FULL_TIME', 5600, 9000, FALSE, 'ADVANCED'),
        (29, 'SAP WM 물류센터 운영 담당자', 'WM', 'MM', '물류센터 운영', '경력 2~7년', 2, 7, '경기 이천, KR', 'ONSITE', 'FULL_TIME', 4800, 7600, FALSE, 'INTERMEDIATE'),
        (30, 'SAP EWM 자동화 창고 구축 PL', 'EWM', 'BTP', '자동화 창고 구축', '경력 6~13년', 6, 13, '경기 용인, KR', 'ONSITE', 'PROJECT', NULL, NULL, TRUE, 'EXPERT'),
        (31, 'SAP PP/QM 제조 프로세스 개선 컨설턴트', 'PP', 'QM', '생산과 품질 통합', '경력 4~10년', 4, 10, '충북 청주, KR', 'ONSITE', 'FULL_TIME', 5800, 9300, FALSE, 'ADVANCED'),
        (32, 'SAP MM 외주/재고 프로세스 운영', 'MM', 'PP', '외주와 재고관리', '경력 2~7년', 2, 7, '부산, KR', 'HYBRID', 'FULL_TIME', 4800, 7600, FALSE, 'INTERMEDIATE'),
        (33, 'SAP SD 가격/프로모션 운영 컨설턴트', 'SD', 'FI', '가격과 청구관리', '경력 3~9년', 3, 9, '서울, KR', 'HYBRID', 'FULL_TIME', 5400, 8800, FALSE, 'ADVANCED'),
        (34, 'SAP S/4HANA FI 데이터 이관 담당자', 'FI', 'S4HANA', '재무 데이터 이관', '경력 3~8년', 3, 8, '서울, KR', 'HYBRID', 'CONTRACT', NULL, NULL, TRUE, 'ADVANCED'),
        (35, 'SAP Master Data Governance 컨설턴트', 'S4HANA', 'MM', '기준정보 거버넌스', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 'FULL_TIME', 6000, 9500, FALSE, 'ADVANCED'),
        (36, 'SAP Retail 프로세스 컨설턴트', 'SD', 'MM', '리테일 매입과 판매', '경력 3~9년', 3, 9, '서울, KR', 'ONSITE', 'FULL_TIME', 5600, 9000, FALSE, 'ADVANCED'),
        (37, 'SAP BTP Extension 개발 컨설턴트', 'BTP', 'UI5', '확장 앱 개발', '경력 3~9년', 3, 9, '서울, KR', 'REMOTE', 'FULL_TIME', 6200, 10000, FALSE, 'ADVANCED'),
        (38, 'SAP Fiori Launchpad 운영 담당자', 'FIORI', 'BASIS', 'Fiori 포털 운영', '경력 2~7년', 2, 7, '서울, KR', 'HYBRID', 'FULL_TIME', 4800, 7600, FALSE, 'INTERMEDIATE'),
        (39, 'SAP BW 데이터마트 구축 개발자', 'BW', 'BW4HANA', '데이터마트 구축', '경력 3~9년', 3, 9, '서울, KR', 'HYBRID', 'FULL_TIME', 5600, 9200, FALSE, 'ADVANCED'),
        (40, 'SAP SAC 경영관리 대시보드 개발자', 'ANALYTICS_CLOUD', 'CO', '경영관리 대시보드', '경력 2~7년', 2, 7, '서울, KR', 'REMOTE', 'FULL_TIME', 5000, 8200, FALSE, 'INTERMEDIATE'),
        (41, 'SAP BASIS 권한/전송 관리 담당자', 'BASIS', 'FIORI', '권한과 전송관리', '경력 2~8년', 2, 8, '대전, KR', 'HYBRID', 'FULL_TIME', 5000, 8000, FALSE, 'INTERMEDIATE'),
        (42, 'SAP HANA 성능 튜닝 엔지니어', 'BASIS', 'S4HANA', 'HANA 성능 개선', '경력 4~11년', 4, 11, '서울, KR', 'HYBRID', 'FULL_TIME', 6500, 11000, FALSE, 'EXPERT'),
        (43, 'SAP PM/QM 플랜트 운영 컨설턴트', 'PM', 'QM', '플랜트 보전과 품질', '경력 3~9년', 3, 9, '울산, KR', 'ONSITE', 'FULL_TIME', 5400, 8800, FALSE, 'ADVANCED'),
        (44, 'SAP SuccessFactors 채용 모듈 컨설턴트', 'SUCCESSFACTORS', 'HCM', '채용과 인재관리', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8600, FALSE, 'INTERMEDIATE'),
        (45, 'SAP Ariba Supplier Lifecycle 컨설턴트', 'ARIBA', 'MM', '협력사 라이프사이클', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 'FULL_TIME', 5400, 8800, FALSE, 'INTERMEDIATE'),
        (46, 'SAP Concur Expense 운영 담당자', 'CONCUR', 'FI', '경비정산 운영', '경력 1~5년', 1, 5, '서울, KR', 'REMOTE', 'FULL_TIME', 4000, 6500, FALSE, 'BEGINNER'),
        (47, 'SAP OData Gateway 개발자', 'ODATA', 'ABAP', 'Gateway 서비스 개발', '경력 2~7년', 2, 7, '서울, KR', 'HYBRID', 'FULL_TIME', 5200, 8400, FALSE, 'INTERMEDIATE'),
        (48, 'SAP UI5 모바일 앱 개발자', 'UI5', 'ODATA', '모바일 업무 앱', '경력 2~7년', 2, 7, '서울, KR', 'REMOTE', 'FULL_TIME', 5200, 8500, FALSE, 'INTERMEDIATE'),
        (49, 'SAP S/4HANA 운영 안정화 컨설턴트', 'S4HANA', 'BASIS', '오픈 안정화와 운영 전환', '경력 5~12년', 5, 12, '서울, KR', 'HYBRID', 'CONTRACT', NULL, NULL, TRUE, 'EXPERT'),
        (50, 'SAP 글로벌 롤아웃 모듈 컨설턴트', 'S4HANA', 'SD', '글로벌 템플릿 롤아웃', '경력 5~12년', 5, 12, '서울, KR', 'HYBRID', 'FULL_TIME', 7200, 12000, FALSE, 'EXPERT')
)
INSERT INTO job_tags (job_post_id, tag_name)
SELECT 900000 + seq, tag_name
FROM seed_jobs
CROSS JOIN LATERAL UNNEST(ARRAY[
    primary_skill_code,
    secondary_skill_code,
    domain_name,
    career_label,
    CASE work_type
        WHEN 'REMOTE' THEN '원격근무'
        WHEN 'HYBRID' THEN '하이브리드'
        ELSE '상주근무'
    END
]) AS tags(tag_name);

WITH seed_skills (seq, primary_skill_code, secondary_skill_code, required_level) AS (
    VALUES
        (1, 'FI', 'CO', 'ADVANCED'), (2, 'S4HANA', 'BASIS', 'EXPERT'), (3, 'MM', 'ARIBA', 'INTERMEDIATE'),
        (4, 'ABAP', 'ODATA', 'ADVANCED'), (5, 'SD', 'MM', 'INTERMEDIATE'), (6, 'BASIS', 'S4HANA', 'ADVANCED'),
        (7, 'PP', 'MM', 'ADVANCED'), (8, 'BW4HANA', 'ANALYTICS_CLOUD', 'INTERMEDIATE'), (9, 'EWM', 'WM', 'ADVANCED'),
        (10, 'BTP', 'CPI', 'INTERMEDIATE'), (11, 'FIORI', 'UI5', 'INTERMEDIATE'), (12, 'SUCCESSFACTORS', 'HCM', 'INTERMEDIATE'),
        (13, 'QM', 'PP', 'INTERMEDIATE'), (14, 'BASIS', 'S4HANA', 'ADVANCED'), (15, 'PM', 'MM', 'INTERMEDIATE'),
        (16, 'CO', 'FI', 'ADVANCED'), (17, 'BASIS', 'FIORI', 'INTERMEDIATE'), (18, 'BASIS', 'BTP', 'ADVANCED'),
        (19, 'ARIBA', 'MM', 'INTERMEDIATE'), (20, 'CONCUR', 'FI', 'BEGINNER'), (21, 'SD', 'MM', 'ADVANCED'),
        (22, 'FI', 'S4HANA', 'ADVANCED'), (23, 'CO', 'FI', 'EXPERT'), (24, 'ABAP', 'CDS_VIEW', 'INTERMEDIATE'),
        (25, 'PI_PO', 'CPI', 'INTERMEDIATE'), (26, 'CPI', 'BTP', 'ADVANCED'), (27, 'ANALYTICS_CLOUD', 'BW4HANA', 'INTERMEDIATE'),
        (28, 'HCM', 'SUCCESSFACTORS', 'ADVANCED'), (29, 'WM', 'MM', 'INTERMEDIATE'), (30, 'EWM', 'BTP', 'EXPERT'),
        (31, 'PP', 'QM', 'ADVANCED'), (32, 'MM', 'PP', 'INTERMEDIATE'), (33, 'SD', 'FI', 'ADVANCED'),
        (34, 'FI', 'S4HANA', 'ADVANCED'), (35, 'S4HANA', 'MM', 'ADVANCED'), (36, 'SD', 'MM', 'ADVANCED'),
        (37, 'BTP', 'UI5', 'ADVANCED'), (38, 'FIORI', 'BASIS', 'INTERMEDIATE'), (39, 'BW', 'BW4HANA', 'ADVANCED'),
        (40, 'ANALYTICS_CLOUD', 'CO', 'INTERMEDIATE'), (41, 'BASIS', 'FIORI', 'INTERMEDIATE'), (42, 'BASIS', 'S4HANA', 'EXPERT'),
        (43, 'PM', 'QM', 'ADVANCED'), (44, 'SUCCESSFACTORS', 'HCM', 'INTERMEDIATE'), (45, 'ARIBA', 'MM', 'INTERMEDIATE'),
        (46, 'CONCUR', 'FI', 'BEGINNER'), (47, 'ODATA', 'ABAP', 'INTERMEDIATE'), (48, 'UI5', 'ODATA', 'INTERMEDIATE'),
        (49, 'S4HANA', 'BASIS', 'EXPERT'), (50, 'S4HANA', 'SD', 'EXPERT')
)
INSERT INTO job_post_sap_skills (job_post_id, sap_skill_id, required_level, is_required)
SELECT
    900000 + ss_seed.seq,
    sap_skills.id,
    ss_seed.required_level,
    TRUE
FROM seed_skills ss_seed
CROSS JOIN LATERAL UNNEST(ARRAY[ss_seed.primary_skill_code, ss_seed.secondary_skill_code]) AS skill_codes(code)
JOIN sap_skills ON sap_skills.code = skill_codes.code
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
