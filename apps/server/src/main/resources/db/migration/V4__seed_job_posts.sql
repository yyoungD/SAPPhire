-- Seed data for the currently hard-coded job listing screen.
-- Required UI fields: company, location, title, tags, posted date, salary, and badge/deadline.
INSERT INTO users (id, email, password_hash, name, phone, role, status)
SELECT
    900000 + g,
    FORMAT('seed-company-%s@sapphire.local', g),
    NULL,
    (ARRAY[
        'Deloitte Korea', 'SAP Korea Partner', 'LG CNS', 'Samsung SDS', 'SK C&C',
        'Hyundai AutoEver', 'CJ OliveNetworks', 'Lotte Data Communication', 'Hanwha Systems', 'Doosan Digital',
        'KPMG Korea', 'PwC Korea', 'EY Korea', 'Accenture Korea', 'MegazoneCloud',
        'Naver Cloud', 'Kakao Enterprise', 'POSCO DX', 'KT DS', 'Shinsegae I&C'
    ])[g],
    FORMAT('02-555-%04s', g),
    'COMPANY',
    'ACTIVE'
FROM generate_series(1, 20) AS g
ON CONFLICT (id) DO UPDATE
SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

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
    900000 + g,
    900000 + g,
    (ARRAY[
        'Deloitte Korea', 'SAP Korea Partner', 'LG CNS', 'Samsung SDS', 'SK C&C',
        'Hyundai AutoEver', 'CJ OliveNetworks', 'Lotte Data Communication', 'Hanwha Systems', 'Doosan Digital',
        'KPMG Korea', 'PwC Korea', 'EY Korea', 'Accenture Korea', 'MegazoneCloud',
        'Naver Cloud', 'Kakao Enterprise', 'POSCO DX', 'KT DS', 'Shinsegae I&C'
    ])[g],
    FORMAT('220-88-%05s', g),
    (ARRAY['Consulting', 'IT Service', 'Cloud', 'Manufacturing', 'Retail'])[1 + ((g - 1) % 5)],
    (ARRAY['51-200', '201-500', '501-1000', '1001-5000', '5000+'])[1 + ((g - 1) % 5)],
    FORMAT('https://seed-company-%s.example.com', g),
    'SAP ERP, S/4HANA, cloud migration, and enterprise process innovation partner.',
    (ARRAY['Seoul, KR', 'Pangyo, KR', 'Gwangju, KR', 'Busan, KR', 'Daejeon, KR'])[1 + ((g - 1) % 5)],
    'APPROVED'
FROM generate_series(1, 20) AS g
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

DELETE FROM job_post_sap_skills WHERE job_post_id BETWEEN 900001 AND 900200;
DELETE FROM job_tags WHERE job_post_id BETWEEN 900001 AND 900200;

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
    900000 + g,
    900000 + (1 + ((g - 1) % 20)),
    (ARRAY[
        'Senior SAP FICO Consultant',
        'SAP BASIS Operation Consultant',
        'S/4HANA Conversion Project Manager',
        'SAP MM Purchasing Consultant',
        'SAP SD Order-to-Cash Consultant',
        'ABAP Backend Developer',
        'SAP SuccessFactors HR Consultant',
        'SAP Cloud Integration Engineer',
        'SAP BW/4HANA Data Consultant',
        'SAP CO Management Accounting Lead'
    ])[1 + ((g - 1) % 10)],
    'SAP specialist recruitment for enterprise transformation projects. This role works with business users, developers, and project managers to improve SAP-based processes.',
    (ARRAY[
        'Analyze business requirements and design SAP process improvements.',
        'Lead configuration, testing, migration, and go-live support.',
        'Coordinate module consultants, developers, and key users.',
        'Operate SAP landscape incidents, changes, and release tasks.'
    ])[1 + ((g - 1) % 4)],
    'Hands-on SAP project experience, structured communication, and documentation skills are required.',
    (ARRAY[
        'S/4HANA conversion experience preferred.',
        'Public cloud or SAP BTP experience preferred.',
        'Global rollout and English communication experience preferred.',
        'SAP certification or major SI project experience preferred.'
    ])[1 + ((g - 1) % 4)],
    (ARRAY['FULL_TIME', 'CONTRACT', 'PROJECT'])[1 + ((g - 1) % 3)],
    (ARRAY['Junior', 'Mid-level', 'Senior', 'Lead'])[1 + ((g - 1) % 4)],
    (g % 8),
    (g % 8) + 5,
    (ARRAY['Seoul, KR', 'Pangyo, KR', 'Gwangju, KR', 'Busan, KR', 'Daejeon, KR', 'Remote, KR'])[1 + ((g - 1) % 6)],
    (ARRAY['ONSITE', 'HYBRID', 'REMOTE'])[1 + ((g - 1) % 3)],
    CASE WHEN g % 4 = 0 THEN NULL ELSE 5000 + ((g % 10) * 500) END,
    CASE WHEN g % 4 = 0 THEN NULL ELSE 7000 + ((g % 12) * 600) END,
    (g % 4 = 0),
    CURRENT_DATE + (7 + (g % 45)),
    'OPEN',
    120 + (g * 17),
    NOW() - ((g % 30) || ' days')::INTERVAL,
    NOW()
FROM generate_series(1, 200) AS g
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

INSERT INTO job_tags (job_post_id, tag_name)
SELECT
    900000 + g,
    tag_name
FROM generate_series(1, 200) AS g
CROSS JOIN LATERAL UNNEST(ARRAY[
    (ARRAY['SAP FI', 'SAP BASIS', 'S/4HANA', 'SAP MM', 'SAP SD', 'ABAP', 'SuccessFactors', 'BTP', 'BW/4HANA', 'SAP CO'])[1 + ((g - 1) % 10)],
    (ARRAY['Expert', 'Intermediate', 'Advanced', 'Junior'])[1 + ((g - 1) % 4)],
    (ARRAY['Migration', 'Roll-out', 'Cloud', 'Operation', 'Implementation'])[1 + ((g - 1) % 5)],
    (ARRAY['AI Recommended', 'D-15', 'Verified Company', 'Urgent'])[1 + ((g - 1) % 4)]
]) AS tags(tag_name);

INSERT INTO job_post_sap_skills (job_post_id, sap_skill_id, required_level, is_required)
SELECT
    900000 + g,
    ss.id,
    (ARRAY['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])[1 + ((g - 1) % 4)],
    TRUE
FROM generate_series(1, 200) AS g
JOIN sap_skills ss
    ON ss.code = (ARRAY['FI', 'BASIS', 'S4HANA', 'MM', 'SD', 'ABAP', 'SUCCESSFACTORS', 'S4HANA', 'S4HANA', 'CO'])[1 + ((g - 1) % 10)]
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
