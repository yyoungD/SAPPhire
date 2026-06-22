-- Register logos for additional seeded company profiles.

WITH logo_files (
    id,
    uploader_user_id,
    original_name,
    stored_name,
    file_path,
    file_url,
    file_size
) AS (
    VALUES
        (910004, 900004, 'samsung-sds-logo.svg', 'samsung-sds-logo.svg', 'apps/client/public/company-logos/samsung-sds-logo.svg', '/company-logos/samsung-sds-logo.svg', 610),
        (910005, 900005, 'hyundai-autoever-logo.svg', 'hyundai-autoever-logo.svg', 'apps/client/public/company-logos/hyundai-autoever-logo.svg', '/company-logos/hyundai-autoever-logo.svg', 522),
        (910006, 900006, 'sk-cc-logo.svg', 'sk-cc-logo.svg', 'apps/client/public/company-logos/sk-cc-logo.svg', '/company-logos/sk-cc-logo.svg', 826),
        (910008, 900008, 'lotte-innovate-logo.svg', 'lotte-innovate-logo.svg', 'apps/client/public/company-logos/lotte-innovate-logo.svg', '/company-logos/lotte-innovate-logo.svg', 577),
        (910010, 900010, 'megazone-cloud-logo.svg', 'megazone-cloud-logo.svg', 'apps/client/public/company-logos/megazone-cloud-logo.svg', '/company-logos/megazone-cloud-logo.svg', 471),
        (910011, 900011, 'cj-olive-networks-logo.svg', 'cj-olive-networks-logo.svg', 'apps/client/public/company-logos/cj-olive-networks-logo.svg', '/company-logos/cj-olive-networks-logo.svg', 756)
)
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
SELECT
    id,
    uploader_user_id,
    original_name,
    stored_name,
    file_path,
    file_url,
    'image/svg+xml',
    file_size,
    'COMPANY_LOGO'
FROM logo_files
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

WITH company_logos (company_profile_id, logo_file_id) AS (
    VALUES
        (900004, 910004),
        (900005, 910005),
        (900006, 910006),
        (900008, 910008),
        (900010, 910010),
        (900011, 910011)
)
UPDATE company_profiles cp
SET
    logo_file_id = company_logos.logo_file_id,
    updated_at = NOW()
FROM company_logos
WHERE cp.id = company_logos.company_profile_id;

SELECT setval(
    pg_get_serial_sequence('files', 'id'),
    GREATEST((SELECT MAX(id) FROM files), 1)
);
