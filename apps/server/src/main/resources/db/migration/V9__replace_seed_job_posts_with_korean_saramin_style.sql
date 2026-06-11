-- Replace previous generated job-post seed data with Korean SAP recruitment postings.
-- The postings are written in a Saramin-style structure: role-focused titles,
-- Korean locations, career ranges, responsibilities, qualifications, preferences,
-- tags, and required SAP skills.

DELETE FROM job_post_sap_skills WHERE job_post_id BETWEEN 900001 AND 900200;
DELETE FROM job_tags WHERE job_post_id BETWEEN 900001 AND 900200;
DELETE FROM job_posts WHERE id BETWEEN 900001 AND 900200;

INSERT INTO users (id, email, password_hash, name, phone, role, status)
VALUES
    (900001, 'seed-company-001@sapphire.local', NULL, '삼정KPMG', '02-555-0001', 'COMPANY', 'ACTIVE'),
    (900002, 'seed-company-002@sapphire.local', NULL, '딜로이트 안진회계법인', '02-555-0002', 'COMPANY', 'ACTIVE'),
    (900003, 'seed-company-003@sapphire.local', NULL, 'LG CNS', '02-555-0003', 'COMPANY', 'ACTIVE'),
    (900004, 'seed-company-004@sapphire.local', NULL, '삼성SDS', '02-555-0004', 'COMPANY', 'ACTIVE'),
    (900005, 'seed-company-005@sapphire.local', NULL, '현대오토에버', '02-555-0005', 'COMPANY', 'ACTIVE'),
    (900006, 'seed-company-006@sapphire.local', NULL, 'SK C&C', '02-555-0006', 'COMPANY', 'ACTIVE'),
    (900007, 'seed-company-007@sapphire.local', NULL, '포스코DX', '02-555-0007', 'COMPANY', 'ACTIVE'),
    (900008, 'seed-company-008@sapphire.local', NULL, '롯데이노베이트', '02-555-0008', 'COMPANY', 'ACTIVE'),
    (900009, 'seed-company-009@sapphire.local', NULL, '한화시스템', '02-555-0009', 'COMPANY', 'ACTIVE'),
    (900010, 'seed-company-010@sapphire.local', NULL, '메가존클라우드', '02-555-0010', 'COMPANY', 'ACTIVE')
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW(),
    deleted_at = NULL;

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
VALUES
    (900001, 900001, '삼정KPMG', '220-88-90001', '컨설팅', '1001-5000', 'https://home.kpmg/kr/ko/home.html', 'ERP 전략 수립, SAP S/4HANA 전환, 재무/관리회계 프로세스 혁신을 지원하는 컨설팅 조직입니다.', '서울 강남구 테헤란로', 'APPROVED'),
    (900002, 900002, '딜로이트 안진회계법인', '220-88-90002', '컨설팅', '1001-5000', 'https://www2.deloitte.com/kr/ko.html', 'SAP 기반 디지털 전환, 글로벌 롤아웃, PI 및 업무 프로세스 혁신 프로젝트를 수행합니다.', '서울 영등포구 국제금융로', 'APPROVED'),
    (900003, 900003, 'LG CNS', '220-88-90003', 'IT 서비스', '5000+', 'https://www.lgcns.com', '제조, 물류, 금융 영역의 대형 SAP 구축 및 운영 서비스를 제공하는 DX 전문 기업입니다.', '서울 강서구 마곡중앙로', 'APPROVED'),
    (900004, 900004, '삼성SDS', '220-88-90004', 'IT 서비스', '5000+', 'https://www.samsungsds.com', '엔터프라이즈 클라우드, ERP 운영, 글로벌 제조 시스템 혁신을 수행합니다.', '서울 송파구 올림픽로35길', 'APPROVED'),
    (900005, 900005, '현대오토에버', '220-88-90005', '모빌리티 IT', '5000+', 'https://www.hyundai-autoever.com', '자동차/부품 제조사의 SAP ERP 운영, S/4HANA 전환, 데이터 표준화를 담당합니다.', '서울 강남구 테헤란로', 'APPROVED'),
    (900006, 900006, 'SK C&C', '220-88-90006', 'IT 서비스', '5000+', 'https://www.skcc.co.kr', '그룹사 ERP 고도화, 클라우드 전환, SAP 운영 자동화 프로젝트를 수행합니다.', '경기 성남시 분당구 성남대로', 'APPROVED'),
    (900007, 900007, '포스코DX', '220-88-90007', '제조 IT', '1001-5000', 'https://www.poscodx.com', '철강/제조 현장의 SAP, MES, 물류 시스템을 통합하는 산업 DX 기업입니다.', '경북 포항시 남구', 'APPROVED'),
    (900008, 900008, '롯데이노베이트', '220-88-90008', '유통 IT', '1001-5000', 'https://www.lotteinnovate.com', '유통, 식품, 서비스 계열사의 SAP ERP 구축 및 운영을 담당합니다.', '서울 금천구 가산디지털2로', 'APPROVED'),
    (900009, 900009, '한화시스템', '220-88-90009', 'ICT', '1001-5000', 'https://www.hanwhasystems.com', '제조/방산 ERP 고도화와 SAP 기반 업무 표준화 프로젝트를 수행합니다.', '서울 중구 청계천로', 'APPROVED'),
    (900010, 900010, '메가존클라우드', '220-88-90010', '클라우드', '1001-5000', 'https://www.megazone.com', '클라우드 기반 SAP 전환, BTP, 데이터 분석 플랫폼 구축을 지원합니다.', '서울 강남구 논현로', 'APPROVED')
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
    deadline_days,
    view_count,
    created_days_ago
) AS (
    VALUES
        (900001, 900001, 'SAP FI/CO 컨설턴트 경력직 채용', '대기업 재무 프로세스 혁신과 S/4HANA 전환 프로젝트를 함께 수행할 SAP FI/CO 컨설턴트를 모집합니다.', '재무회계 및 관리회계 업무 요건 분석, IMG 설정, 전표/결산 프로세스 설계, 테스트 및 오픈 안정화 지원을 담당합니다.', 'SAP FI 또는 CO 구축/운영 경험 3년 이상, 회계 업무 프로세스 이해, 고객 커뮤니케이션 및 산출물 작성 역량이 필요합니다.', 'S/4HANA Conversion, New GL, COPA, 연결/결산 프로젝트 경험 또는 SAP 자격 보유자를 우대합니다.', 'FULL_TIME', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 6000, 9500, FALSE, 35, 421, 2),
        (900002, 900002, 'SAP S/4HANA 전환 PM/PL 모집', '제조 및 유통 고객사의 S/4HANA 전환 로드맵 수립부터 이행까지 리딩할 PM/PL 포지션입니다.', '프로젝트 계획 수립, 일정/리스크 관리, 모듈별 이슈 조율, 고객 보고, 컷오버 및 안정화 관리를 수행합니다.', 'SAP 구축 프로젝트 PM 또는 PL 경험 5년 이상, 모듈 간 통합 흐름 이해, 대외 보고 및 협상 역량이 필요합니다.', '글로벌 롤아웃, Brownfield/Greenfield 전환, 영어 커뮤니케이션 경험자를 우대합니다.', 'FULL_TIME', '경력 7년 이상', 7, 15, '서울, KR', 'ONSITE', 8000, 13000, FALSE, 28, 389, 4),
        (900003, 900003, 'SAP MM 구매/자재 컨설턴트', '제조 고객사의 구매, 자재, 재고 프로세스를 SAP MM 중심으로 개선할 컨설턴트를 찾습니다.', '구매요청부터 발주, 입고, 재고관리, 정산까지 업무 분석과 시스템 설정, 인터페이스 검증을 담당합니다.', 'SAP MM 구축 또는 운영 경험 2년 이상, 구매/자재 업무 프로세스 이해, 테스트 시나리오 작성 경험이 필요합니다.', 'Ariba, EWM, 제조업 표준원가 또는 물류 연계 경험자를 우대합니다.', 'FULL_TIME', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 5200, 8500, FALSE, 42, 312, 1),
        (900004, 900004, 'SAP ABAP 개발자 채용', 'ERP 운영 및 고도화 프로젝트에서 ABAP 개발과 성능 개선을 담당할 개발자를 모집합니다.', 'Report, BAPI, User Exit, Enhancement, Smart Forms 개발과 장애 분석, 배치 성능 개선을 수행합니다.', 'ABAP 개발 경험 3년 이상, SQL 튜닝 이해, 기능 컨설턴트와의 협업 및 개발 문서 작성 역량이 필요합니다.', 'CDS View, OData, Fiori/UI5, S/4HANA 개발 경험자를 우대합니다.', 'FULL_TIME', '경력 3~9년', 3, 9, '서울, KR', 'HYBRID', 5500, 9000, FALSE, 31, 506, 3),
        (900005, 900005, 'SAP SD 영업/출하 모듈 운영 담당자', '완성차 및 부품 판매 프로세스를 지원하는 SAP SD 운영 담당자를 모집합니다.', '주문, 가격, 출하, 청구 프로세스 운영, 사용자 문의 대응, 변경 요청 분석 및 테스트를 담당합니다.', 'SAP SD 운영 경험 2년 이상, 영업/물류 프로세스 이해, 장애 원인 분석과 현업 커뮤니케이션 역량이 필요합니다.', 'LE, MM, FI 연계 경험 또는 자동차/제조 도메인 경험자를 우대합니다.', 'FULL_TIME', '경력 2~7년', 2, 7, '서울, KR', 'ONSITE', 5000, 7800, FALSE, 24, 276, 5),
        (900006, 900006, 'SAP BASIS 시스템 운영 엔지니어', 'SAP ERP, S/4HANA, BW 시스템의 안정적인 운영과 클라우드 전환을 담당할 BASIS 엔지니어를 찾습니다.', 'SAP 시스템 모니터링, 권한/전송 관리, 패치 및 업그레이드, 장애 대응, 성능 점검을 수행합니다.', 'SAP BASIS 운영 경험 3년 이상, Linux/DB 기본 지식, SAP Note 적용 및 전송 관리 경험이 필요합니다.', 'HANA DB, Cloud Connector, SAP Router, AWS/Azure 기반 운영 경험자를 우대합니다.', 'FULL_TIME', '경력 3~10년', 3, 10, '경기 성남, KR', 'HYBRID', 5600, 9200, FALSE, 38, 344, 2),
        (900007, 900007, 'SAP PP 생산관리 컨설턴트', '제조 현장의 생산계획, 공정, 실적관리 프로세스를 SAP PP로 표준화할 컨설턴트를 모집합니다.', 'BOM, Routing, MRP, 생산오더, 실적처리 프로세스 설계와 MES 연계 테스트를 담당합니다.', 'SAP PP 구축/운영 경험 3년 이상, 제조 생산 프로세스 이해, 통합 테스트 및 교육 경험이 필요합니다.', 'QM, PM, MM 연계 경험 또는 철강/화학/자동차 업종 프로젝트 경험자를 우대합니다.', 'FULL_TIME', '경력 3~9년', 3, 9, '경북 포항, KR', 'ONSITE', 5400, 8800, FALSE, 45, 238, 6),
        (900008, 900008, 'SAP BW/4HANA 데이터 컨설턴트', '경영관리 및 영업 데이터 분석 체계를 BW/4HANA 기반으로 구축할 데이터 컨설턴트를 모집합니다.', '데이터 모델링, ETL 설계, Query 개발, 성능 개선, 사용자 리포트 요구사항 분석을 수행합니다.', 'SAP BW 또는 BW/4HANA 프로젝트 경험 2년 이상, SQL 및 데이터 모델링 이해가 필요합니다.', 'SAC, Datasphere, HANA Calculation View, FI/CO 데이터마트 경험자를 우대합니다.', 'FULL_TIME', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 5200, 8600, FALSE, 33, 295, 4),
        (900009, 900009, 'SAP EWM 물류 컨설턴트', '창고 운영 고도화와 물류 자동화 프로젝트를 수행할 SAP EWM 컨설턴트를 찾습니다.', '입고, 적치, 피킹, 출고, 재고실사 프로세스 설계와 WMS/MES 인터페이스 테스트를 담당합니다.', 'SAP EWM 또는 WM 경험 3년 이상, 물류센터 업무 프로세스 이해, 현업 요구사항 정리 역량이 필요합니다.', '자동화 설비 연계, RF, TM, SD/MM 통합 프로젝트 경험자를 우대합니다.', 'PROJECT', '경력 3~12년', 3, 12, '서울, KR', 'ONSITE', NULL, NULL, TRUE, 21, 198, 7),
        (900010, 900010, 'SAP BTP/CPI 연동 개발자', '클라우드 환경에서 SAP와 외부 시스템을 연동하는 BTP/CPI 개발자를 모집합니다.', 'CPI iFlow 설계, API 연동, 인증/권한 설정, 모니터링, 오류 처리 및 운영 자동화를 담당합니다.', 'SAP CPI 또는 PI/PO 연동 개발 경험 2년 이상, REST/SOAP API와 인증 방식 이해가 필요합니다.', 'BTP Extension Suite, Event Mesh, Cloud Integration, JavaScript/Groovy 경험자를 우대합니다.', 'FULL_TIME', '경력 2~8년', 2, 8, '서울, KR', 'REMOTE', 5400, 9000, FALSE, 40, 367, 1),
        (900011, 900003, 'SAP Fiori/UI5 프론트엔드 개발자', 'SAP 사용자 경험 개선을 위한 Fiori 앱 개발 및 고도화 프로젝트에 참여할 개발자를 찾습니다.', 'SAPUI5 화면 개발, OData 연계, Fiori Launchpad 설정, 사용자 테스트 대응과 개선 개발을 수행합니다.', 'JavaScript 기반 프론트엔드 개발 경험 2년 이상, SAP UI5 또는 Fiori 개발 경험이 필요합니다.', 'CDS View, RAP, ABAP Gateway, 디자인 시스템 적용 경험자를 우대합니다.', 'FULL_TIME', '경력 2~6년', 2, 6, '서울, KR', 'HYBRID', 5000, 8000, FALSE, 36, 254, 3),
        (900012, 900004, 'SAP SuccessFactors EC 컨설턴트', '인사 기준정보와 조직/직무 체계를 SuccessFactors Employee Central로 전환할 컨설턴트를 모집합니다.', '인사 마스터 설계, 권한/워크플로 설정, 데이터 마이그레이션, 통합 테스트와 사용자 교육을 담당합니다.', 'SuccessFactors EC 구축 또는 운영 경험 2년 이상, HR 업무 프로세스 이해가 필요합니다.', 'Time Off, Performance & Goals, SAP HCM 연계 또는 글로벌 HR 프로젝트 경험자를 우대합니다.', 'FULL_TIME', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 5200, 8400, FALSE, 29, 229, 5),
        (900013, 900005, 'SAP QM 품질관리 모듈 컨설턴트', '제조 품질 프로세스 개선과 SAP QM 운영 고도화를 담당할 컨설턴트를 모집합니다.', '검사계획, 검사로트, 품질통보, 성적서 및 생산/구매 연계 프로세스 설계를 수행합니다.', 'SAP QM 구축 또는 운영 경험 2년 이상, 제조 품질관리 업무 이해, 사용자 테스트 지원 경험이 필요합니다.', 'PP, MM, PM 연계 경험 또는 자동차/배터리 업종 경험자를 우대합니다.', 'FULL_TIME', '경력 2~8년', 2, 8, '서울, KR', 'ONSITE', 5000, 8200, FALSE, 44, 187, 8),
        (900014, 900006, 'SAP HANA DB 운영 DBA', 'SAP HANA 기반 ERP 시스템의 DB 운영, 성능 분석, 백업/복구를 담당할 DBA를 찾습니다.', 'HANA DB 모니터링, SQL 성능 분석, 백업/복구, 장애 대응, 용량 관리와 운영 표준화를 수행합니다.', 'HANA DB 운영 경험 3년 이상, SQL 튜닝과 Linux 환경 이해가 필요합니다.', 'BASIS 협업 경험, HA/DR 구성, 클라우드 DB 운영 경험자를 우대합니다.', 'FULL_TIME', '경력 3~10년', 3, 10, '경기 성남, KR', 'HYBRID', 5800, 9800, FALSE, 26, 318, 2),
        (900015, 900007, 'SAP PM 설비보전 컨설턴트', '제조 설비보전 프로세스를 SAP PM 기반으로 운영/개선할 컨설턴트를 모집합니다.', '설비마스터, 예방정비, 작업오더, 정비이력, 구매/자재 연계 프로세스 개선을 담당합니다.', 'SAP PM 구축 또는 운영 경험 2년 이상, 설비보전 업무 프로세스 이해가 필요합니다.', 'EAM, QM, MM 연계 경험 또는 플랜트/제조 현장 프로젝트 경험자를 우대합니다.', 'CONTRACT', '경력 2~9년', 2, 9, '경북 포항, KR', 'ONSITE', NULL, NULL, TRUE, 32, 165, 9),
        (900016, 900008, 'SAP CO 원가/수익성 분석 컨설턴트', '유통 및 제조 고객사의 원가관리, 손익분석, 예산관리 프로세스를 개선할 CO 컨설턴트를 찾습니다.', 'CCA, PCA, COPA, 내부오더, 배부/정산 프로세스 설계와 월결산 지원을 담당합니다.', 'SAP CO 프로젝트 경험 3년 이상, 관리회계 업무 이해, FI/MM/SD 연계 분석 역량이 필요합니다.', 'S/4HANA Universal Journal, Margin Analysis 경험자를 우대합니다.', 'FULL_TIME', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 5800, 9300, FALSE, 37, 282, 4),
        (900017, 900009, 'SAP 보안/권한 운영 담당자', 'SAP ERP와 S/4HANA 시스템의 권한 설계 및 운영을 담당할 보안 담당자를 모집합니다.', 'Role/Profile 설계, 사용자 권한 신청 처리, SoD 점검, 감사 대응, 권한 변경 테스트를 수행합니다.', 'SAP 권한 운영 경험 2년 이상, 업무별 권한 구조와 내부통제 이해가 필요합니다.', 'GRC Access Control, Fiori 권한, 개인정보/감사 대응 경험자를 우대합니다.', 'FULL_TIME', '경력 2~7년', 2, 7, '서울, KR', 'HYBRID', 4800, 7600, FALSE, 30, 207, 6),
        (900018, 900010, 'SAP 클라우드 마이그레이션 컨설턴트', 'SAP 워크로드의 클라우드 이전과 운영 아키텍처 설계를 담당할 컨설턴트를 모집합니다.', 'SAP 시스템 진단, 이전 계획 수립, 클라우드 인프라 설계, 전환 리허설과 운영 안정화를 수행합니다.', 'SAP BASIS 또는 클라우드 인프라 경험 3년 이상, 네트워크/보안/스토리지 기본 이해가 필요합니다.', 'AWS, Azure, GCP 기반 SAP 인증 아키텍처 설계 경험자를 우대합니다.', 'FULL_TIME', '경력 3~10년', 3, 10, '서울, KR', 'HYBRID', 6200, 10500, FALSE, 41, 351, 1),
        (900019, 900001, 'SAP Ariba 구매 시스템 컨설턴트', '전략구매와 협력사 포털 고도화를 위한 SAP Ariba 컨설턴트를 모집합니다.', 'Sourcing, Contract, Buying 프로세스 설계, SAP MM 연계, 데이터 이관과 사용자 교육을 담당합니다.', '구매 시스템 구축 또는 운영 경험 2년 이상, SAP MM 또는 Ariba 이해가 필요합니다.', '글로벌 구매 프로세스, 협력사 온보딩, API 연계 경험자를 우대합니다.', 'FULL_TIME', '경력 2~8년', 2, 8, '서울, KR', 'HYBRID', 5200, 8500, FALSE, 39, 173, 7),
        (900020, 900002, 'SAP Concur 구축/운영 컨설턴트', '경비 처리와 출장 정산 프로세스를 SAP Concur 기반으로 구축/운영할 컨설턴트를 찾습니다.', 'Expense, Request, Travel 설정, 정책 반영, ERP 연계 테스트, 운영 문의 대응을 수행합니다.', 'Concur 또는 경비/출장 시스템 운영 경험 1년 이상, 회계 연계 프로세스 이해가 필요합니다.', 'FI 연계, 글로벌 템플릿 적용, 영어 커뮤니케이션 경험자를 우대합니다.', 'FULL_TIME', '경력 1~6년', 1, 6, '서울, KR', 'REMOTE', 4200, 7000, FALSE, 34, 149, 8)
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
    CURRENT_DATE + deadline_days,
    'OPEN',
    view_count,
    NOW() - (created_days_ago || ' days')::INTERVAL,
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

WITH job_tags_seed (job_post_id, tags) AS (
    VALUES
        (900001, ARRAY['SAP FI', 'SAP CO', 'S/4HANA', '재무회계', '경력직']),
        (900002, ARRAY['S/4HANA', 'PM', 'PL', '전환프로젝트', '글로벌롤아웃']),
        (900003, ARRAY['SAP MM', '구매', '자재관리', '제조', 'Ariba']),
        (900004, ARRAY['ABAP', 'CDS View', 'OData', 'Fiori', '개발자']),
        (900005, ARRAY['SAP SD', '영업관리', '출하', '자동차', '운영']),
        (900006, ARRAY['SAP BASIS', 'HANA', '클라우드', '운영', '인프라']),
        (900007, ARRAY['SAP PP', '생산관리', 'MES', '제조', '구축']),
        (900008, ARRAY['BW/4HANA', '데이터', 'SAC', '리포팅', '분석']),
        (900009, ARRAY['SAP EWM', '물류', 'WMS', '창고관리', '프로젝트']),
        (900010, ARRAY['SAP BTP', 'CPI', 'API', '클라우드연동', '원격근무']),
        (900011, ARRAY['SAP Fiori', 'UI5', 'OData', '프론트엔드', 'UX']),
        (900012, ARRAY['SuccessFactors', 'Employee Central', 'HR', '인사', '글로벌']),
        (900013, ARRAY['SAP QM', '품질관리', '제조', 'PP연계', '운영']),
        (900014, ARRAY['HANA DB', 'DBA', 'BASIS', '성능튜닝', '운영']),
        (900015, ARRAY['SAP PM', '설비보전', 'EAM', '플랜트', '계약직']),
        (900016, ARRAY['SAP CO', '원가관리', 'COPA', '손익분석', '월결산']),
        (900017, ARRAY['SAP 권한', '보안', 'GRC', '내부통제', '운영']),
        (900018, ARRAY['SAP Cloud', 'BASIS', 'Migration', 'AWS', 'Azure']),
        (900019, ARRAY['SAP Ariba', '구매', '협력사포털', 'MM연계', '컨설턴트']),
        (900020, ARRAY['SAP Concur', '경비정산', '출장정산', 'FI연계', '원격근무'])
)
INSERT INTO job_tags (job_post_id, tag_name)
SELECT job_post_id, tag_name
FROM job_tags_seed
CROSS JOIN LATERAL UNNEST(tags) AS t(tag_name);

WITH job_skill_seed (job_post_id, skill_codes, required_level) AS (
    VALUES
        (900001, ARRAY['FI', 'CO', 'S4HANA'], 'ADVANCED'),
        (900002, ARRAY['S4HANA'], 'EXPERT'),
        (900003, ARRAY['MM', 'ARIBA'], 'INTERMEDIATE'),
        (900004, ARRAY['ABAP', 'CDS_VIEW', 'ODATA'], 'ADVANCED'),
        (900005, ARRAY['SD', 'MM', 'FI'], 'INTERMEDIATE'),
        (900006, ARRAY['BASIS', 'S4HANA'], 'ADVANCED'),
        (900007, ARRAY['PP', 'MM'], 'ADVANCED'),
        (900008, ARRAY['BW4HANA', 'ANALYTICS_CLOUD'], 'INTERMEDIATE'),
        (900009, ARRAY['EWM', 'WM', 'MM'], 'ADVANCED'),
        (900010, ARRAY['BTP', 'CPI', 'PI_PO'], 'INTERMEDIATE'),
        (900011, ARRAY['FIORI', 'UI5', 'ODATA'], 'INTERMEDIATE'),
        (900012, ARRAY['SUCCESSFACTORS', 'HCM'], 'INTERMEDIATE'),
        (900013, ARRAY['QM', 'PP', 'MM'], 'INTERMEDIATE'),
        (900014, ARRAY['BASIS', 'S4HANA'], 'ADVANCED'),
        (900015, ARRAY['PM', 'MM'], 'INTERMEDIATE'),
        (900016, ARRAY['CO', 'FI', 'S4HANA'], 'ADVANCED'),
        (900017, ARRAY['BASIS', 'FIORI'], 'INTERMEDIATE'),
        (900018, ARRAY['BASIS', 'BTP', 'S4HANA'], 'ADVANCED'),
        (900019, ARRAY['ARIBA', 'MM'], 'INTERMEDIATE'),
        (900020, ARRAY['CONCUR', 'FI'], 'BEGINNER')
)
INSERT INTO job_post_sap_skills (job_post_id, sap_skill_id, required_level, is_required)
SELECT
    jss.job_post_id,
    ss.id,
    jss.required_level,
    TRUE
FROM job_skill_seed jss
CROSS JOIN LATERAL UNNEST(jss.skill_codes) AS c(code)
JOIN sap_skills ss ON ss.code = c.code
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
