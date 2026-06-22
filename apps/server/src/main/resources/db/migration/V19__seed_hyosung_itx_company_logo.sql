-- Register the Hyosung ITX logo for the seeded company profile.

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
    910015,
    900015,
    'hyosung-itx-logo.svg',
    'hyosung-itx-logo.svg',
    'apps/client/public/company-logos/hyosung-itx-logo.svg',
    '/company-logos/hyosung-itx-logo.svg',
    'image/svg+xml',
    370,
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

UPDATE company_profiles
SET
    logo_file_id = 910015,
    updated_at = NOW()
WHERE id = 900015;

SELECT setval(
    pg_get_serial_sequence('files', 'id'),
    GREATEST((SELECT MAX(id) FROM files), 1)
);
