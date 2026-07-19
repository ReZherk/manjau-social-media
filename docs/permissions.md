# Matriz de Permisos

## Roles

| Código | Nombre | Descripción |
|--------|--------|-------------|
| ADMINISTRATOR | Administrador | Acceso completo |
| COMMUNITY_MANAGER | Community Manager | Redes sociales y publicaciones |
| MARKETING_ANALYST | Analista de Marketing | Métricas y reportes |

## Permisos

### Administración
| Código | ADMINISTRATOR | COMMUNITY_MANAGER | MARKETING_ANALYST |
|--------|:---:|:---:|:---:|
| ADMIN_DASHBOARD_VIEW | ✓ | - | - |
| USER_VIEW | ✓ | - | - |
| USER_CREATE | ✓ | - | - |
| USER_UPDATE | ✓ | - | - |
| USER_STATUS_UPDATE | ✓ | - | - |
| USER_RESET_CREDENTIALS | ✓ | - | - |
| AUDIT_VIEW | ✓ | - | - |

### Redes Sociales
| Código | ADMINISTRATOR | COMMUNITY_MANAGER | MARKETING_ANALYST |
|--------|:---:|:---:|:---:|
| SOCIAL_ACCOUNT_VIEW | ✓ | ✓ | ✓ |
| SOCIAL_ACCOUNT_CREATE | ✓ | ✓ | - |
| SOCIAL_ACCOUNT_UPDATE | ✓ | ✓ | - |
| SOCIAL_ACCOUNT_STATUS_UPDATE | ✓ | ✓ | - |
| SOCIAL_ACCOUNT_CREDENTIAL_REVEAL | ✓ | - | ✓ |

### Publicaciones
| Código | ADMINISTRATOR | COMMUNITY_MANAGER | MARKETING_ANALYST |
|--------|:---:|:---:|:---:|
| PUBLICATION_VIEW | ✓ | ✓ | - |
| PUBLICATION_CREATE | ✓ | ✓ | - |
| PUBLICATION_UPDATE | ✓ | ✓ | - |
| PUBLICATION_DELETE | ✓ | ✓ | - |
| PUBLICATION_MARK_AS_PUBLISHED | ✓ | ✓ | - |
| PUBLICATION_HISTORY_VIEW | ✓ | ✓ | - |

### Métricas
| Código | ADMINISTRATOR | COMMUNITY_MANAGER | MARKETING_ANALYST |
|--------|:---:|:---:|:---:|
| METRIC_VIEW | ✓ | - | ✓ |
| METRIC_CREATE | ✓ | - | ✓ |
| KPI_VIEW | ✓ | - | ✓ |
| REPORT_VIEW | ✓ | - | ✓ |
| REPORT_GENERATE | ✓ | - | ✓ |

## Uso en el Frontend

```typescript
// Verificar permiso
if (hasPermission('USER_CREATE')) {
  // mostrar botón
}

// Componente guard
<PermissionGuard permission="USER_CREATE">
  <button>Crear usuario</button>
</PermissionGuard>
```
