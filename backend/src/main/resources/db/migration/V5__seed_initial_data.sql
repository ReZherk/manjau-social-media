-- Insert permissions
INSERT INTO permissions (code, name, description) VALUES
('ADMIN_DASHBOARD_VIEW', 'Ver panel de administración', 'Acceso al dashboard administrativo'),
('USER_VIEW', 'Ver usuarios', 'Consultar listado de usuarios'),
('USER_CREATE', 'Crear usuario', 'Crear nuevos usuarios'),
('USER_UPDATE', 'Editar usuario', 'Editar usuarios existentes'),
('USER_STATUS_UPDATE', 'Cambiar estado de usuario', 'Activar o desactivar usuarios'),
('USER_RESET_CREDENTIALS', 'Restablecer credenciales', 'Generar nuevas credenciales temporales'),
('AUDIT_VIEW', 'Ver auditoría', 'Consultar registros de auditoría'),
('SOCIAL_ACCOUNT_VIEW', 'Ver redes sociales', 'Consultar cuentas de redes sociales'),
('SOCIAL_ACCOUNT_CREATE', 'Crear red social', 'Registrar nuevas redes sociales'),
('SOCIAL_ACCOUNT_UPDATE', 'Editar red social', 'Actualizar redes sociales'),
('SOCIAL_ACCOUNT_STATUS_UPDATE', 'Cambiar estado de red social', 'Activar o desactivar redes sociales'),
('SOCIAL_ACCOUNT_CREDENTIAL_REVEAL', 'Revelar credenciales', 'Ver credenciales de redes sociales'),
('PUBLICATION_VIEW', 'Ver publicaciones', 'Consultar publicaciones'),
('PUBLICATION_CREATE', 'Crear publicación', 'Registrar nuevas publicaciones'),
('PUBLICATION_UPDATE', 'Editar publicación', 'Editar publicaciones'),
('PUBLICATION_DELETE', 'Eliminar publicación', 'Eliminar publicaciones'),
('PUBLICATION_MARK_AS_PUBLISHED', 'Marcar como publicada', 'Marcar publicación como realizada'),
('PUBLICATION_HISTORY_VIEW', 'Ver historial', 'Consultar historial de publicaciones'),
('METRIC_VIEW', 'Ver métricas', 'Consultar métricas'),
('METRIC_CREATE', 'Registrar métricas', 'Ingresar métricas manualmente'),
('KPI_VIEW', 'Ver KPI', 'Consultar indicadores KPI'),
('REPORT_VIEW', 'Ver reportes', 'Consultar reportes'),
('REPORT_GENERATE', 'Generar reporte', 'Generar reportes PDF');

-- Insert roles
INSERT INTO roles (code, name, description) VALUES
('ADMINISTRATOR', 'Administrador', 'Acceso completo a todos los módulos'),
('COMMUNITY_MANAGER', 'Community Manager', 'Gestión de redes sociales y publicaciones'),
('MARKETING_ANALYST', 'Analista de Marketing', 'Gestión de métricas y reportes');

-- Assign all permissions to ADMINISTRATOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'ADMINISTRATOR';

-- Assign permissions to COMMUNITY_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'COMMUNITY_MANAGER'
AND p.code IN ('SOCIAL_ACCOUNT_VIEW', 'SOCIAL_ACCOUNT_CREATE', 'SOCIAL_ACCOUNT_UPDATE', 'SOCIAL_ACCOUNT_STATUS_UPDATE',
               'PUBLICATION_VIEW', 'PUBLICATION_CREATE', 'PUBLICATION_UPDATE', 'PUBLICATION_DELETE',
               'PUBLICATION_MARK_AS_PUBLISHED', 'PUBLICATION_HISTORY_VIEW');

-- Assign permissions to MARKETING_ANALYST
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.code = 'MARKETING_ANALYST'
AND p.code IN ('SOCIAL_ACCOUNT_VIEW', 'SOCIAL_ACCOUNT_CREDENTIAL_REVEAL',
               'METRIC_VIEW', 'METRIC_CREATE', 'KPI_VIEW', 'REPORT_VIEW', 'REPORT_GENERATE');
