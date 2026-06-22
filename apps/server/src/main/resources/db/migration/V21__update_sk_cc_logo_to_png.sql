-- Replace the seeded SK C&C logo with the provided PNG asset.

UPDATE files
SET
    original_name = 'sk-cc-logo.png',
    stored_name = 'sk-cc-logo.png',
    file_path = 'apps/client/public/company-logos/sk-cc-logo.png',
    file_url = '/company-logos/sk-cc-logo.png',
    content_type = 'image/png',
    file_size = 35567,
    file_category = 'COMPANY_LOGO'
WHERE id = 910006;

UPDATE company_profiles
SET
    logo_file_id = 910006,
    updated_at = NOW()
WHERE id = 900006;
