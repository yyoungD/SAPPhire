-- Remove profile rows attached to users with the wrong account role, then prevent
-- future cross-role profile ownership at the database boundary.

DELETE FROM company_profiles cp
USING users u
WHERE u.id = cp.user_id
  AND u.role <> 'COMPANY';

DELETE FROM personal_profiles pp
USING users u
WHERE u.id = pp.user_id
  AND u.role <> 'PERSONAL';

CREATE OR REPLACE FUNCTION enforce_company_profile_user_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM users u
        WHERE u.id = NEW.user_id
          AND u.role = 'COMPANY'
          AND u.deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'company_profiles.user_id must reference an active COMPANY user';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION enforce_personal_profile_user_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM users u
        WHERE u.id = NEW.user_id
          AND u.role = 'PERSONAL'
          AND u.deleted_at IS NULL
    ) THEN
        RAISE EXCEPTION 'personal_profiles.user_id must reference an active PERSONAL user';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_company_profiles_user_role ON company_profiles;
CREATE TRIGGER trg_company_profiles_user_role
BEFORE INSERT OR UPDATE OF user_id ON company_profiles
FOR EACH ROW
EXECUTE FUNCTION enforce_company_profile_user_role();

DROP TRIGGER IF EXISTS trg_personal_profiles_user_role ON personal_profiles;
CREATE TRIGGER trg_personal_profiles_user_role
BEFORE INSERT OR UPDATE OF user_id ON personal_profiles
FOR EACH ROW
EXECUTE FUNCTION enforce_personal_profile_user_role();
