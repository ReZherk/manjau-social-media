-- ============================================================================
--  USUARIOS DE DEMOSTRACIÓN — Community Manager y Analista de Marketing
--  Ejecutar en el SQL Editor de Neon (una sola vez).
--
--  Contraseña de ambos: Manjau2026!
--  (hash BCrypt generado con la misma librería del backend)
--
--  must_change_password = FALSE → entran directo, sin pedir cambio de clave.
-- ============================================================================

-- Community Manager
INSERT INTO users (dni, first_name, paternal_surname, maternal_surname,
                   institutional_email, password_hash, status, must_change_password, role_id)
SELECT '10000001', 'Camila', 'Torres', 'Rojas', 'community@manjau.com',
       '$2a$10$PjmpLrgvzZW5fzaYU2/ZwOa8iiqyRMY1RnRiQO.3Ix/XkIWi6Ploa',
       'ACTIVE', FALSE, r.id
FROM roles r
WHERE r.code = 'COMMUNITY_MANAGER'
ON CONFLICT (institutional_email) DO NOTHING;

-- Analista de Marketing
INSERT INTO users (dni, first_name, paternal_surname, maternal_surname,
                   institutional_email, password_hash, status, must_change_password, role_id)
SELECT '10000002', 'Diego', 'Herrera', 'Luna', 'analista@manjau.com',
       '$2a$10$M8Lz2cK6ad6VtCZrfEvd6eo4iTzvoqZXzUYbt1bH5zZ27VxqsFQ4K',
       'ACTIVE', FALSE, r.id
FROM roles r
WHERE r.code = 'MARKETING_ANALYST'
ON CONFLICT (institutional_email) DO NOTHING;

-- Comprobación
SELECT u.institutional_email, u.first_name, r.code AS rol, u.status, u.must_change_password
FROM users u JOIN roles r ON r.id = u.role_id
WHERE u.institutional_email IN ('community@manjau.com', 'analista@manjau.com');
