INSERT INTO users (email, password_hash, name, role, status, language)
VALUES (
    'admin@sapphire.local',
    '$2a$10$BjU/UsXmlxjMcq8QfkX7l.aWzr0oCeysPu16XjwWl5qt893SErdS6',
    'Admin',
    'ADMIN',
    'ACTIVE',
    'KO'
)
ON CONFLICT (email) DO NOTHING;
