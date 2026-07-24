-- ============================================================================
--  SEED DE DEMOSTRACIÓN — Manjau Social Media
--  Ejecutar en el SQL Editor de Neon (una sola vez).
--
--  Crea: 3 cuentas sociales + 7 publicaciones PUBLICADAS con fecha de hace
--  varios días (para pasar la regla de 7 días) + sus métricas.
--  Resultado: KPIs y Reportes muestran datos de ejemplo.
--
--  Nota: estas cuentas se crean sin credenciales. Si necesitas revelarlas,
--  edita cada cuenta desde la UI e ingresa usuario y contraseña; el backend
--  las almacenará cifradas. Todo lo demás (métricas/KPI/reportes) funciona.
-- ============================================================================
DO $$
DECLARE
  v_admin uuid;
  v_ig uuid; v_fb uuid; v_tt uuid;
  v_ct_image uuid; v_ct_reel uuid; v_ct_video uuid; v_ct_carousel uuid; v_ct_story uuid;
  v_acc_ig uuid; v_acc_fb uuid; v_acc_tt uuid;
  v_pub uuid;
BEGIN
  -- Evita duplicar si se ejecuta dos veces
  IF EXISTS (SELECT 1 FROM social_accounts WHERE account_name = 'Instagram Manjau (demo)') THEN
    RAISE NOTICE 'El seed de demo ya fue ejecutado; no se hace nada.';
    RETURN;
  END IF;

  SELECT id INTO v_admin FROM users WHERE institutional_email = 'admin@manjau.com' LIMIT 1;
  SELECT id INTO v_ig FROM platforms WHERE code = 'INSTAGRAM';
  SELECT id INTO v_fb FROM platforms WHERE code = 'FACEBOOK';
  SELECT id INTO v_tt FROM platforms WHERE code = 'TIKTOK';
  SELECT id INTO v_ct_image    FROM content_types WHERE code = 'IMAGE';
  SELECT id INTO v_ct_reel     FROM content_types WHERE code = 'REEL';
  SELECT id INTO v_ct_video    FROM content_types WHERE code = 'VIDEO';
  SELECT id INTO v_ct_carousel FROM content_types WHERE code = 'CAROUSEL';
  SELECT id INTO v_ct_story    FROM content_types WHERE code = 'STORY';

  -- ---------- Cuentas sociales ----------
  -- Las cuentas demo se crean sin credenciales. Los valores sensibles deben
  -- ingresarse luego desde la UI para que CryptoService los cifre con AES-GCM.
  INSERT INTO social_accounts (platform_id, account_name, status, created_by)
    VALUES (v_ig, 'Instagram Manjau (demo)', 'ACTIVE', v_admin) RETURNING id INTO v_acc_ig;

  INSERT INTO social_accounts (platform_id, account_name, status, created_by)
    VALUES (v_fb, 'Facebook Manjau (demo)', 'ACTIVE', v_admin) RETURNING id INTO v_acc_fb;

  INSERT INTO social_accounts (platform_id, account_name, status, created_by)
    VALUES (v_tt, 'TikTok Manjau (demo)', 'ACTIVE', v_admin) RETURNING id INTO v_acc_tt;

  -- ---------- Publicaciones + métricas (publicadas hace >7 días) ----------

  -- 1) Imagen · IG + FB · pagada
  INSERT INTO publications (title, description, budget, content_type_id, status, scheduled_at, published_at, evidence_link, created_by)
    VALUES ('Lanzamiento torta de terciopelo rojo', 'Nuestra nueva torta estrella', 180.00, v_ct_image, 'PUBLISHED',
            NOW() - INTERVAL '27 days', NOW() - INTERVAL '25 days', 'https://instagram.com/p/demo1', v_admin)
    RETURNING id INTO v_pub;
  INSERT INTO publication_social_accounts (publication_id, social_account_id) VALUES (v_pub, v_acc_ig), (v_pub, v_acc_fb);
  INSERT INTO publication_metrics (publication_id, social_account_id, reactions, reach, saves, shares, comments, recorded_by)
    VALUES (v_pub, v_acc_ig, 312, 4200, 45, 30, 18, v_admin),
           (v_pub, v_acc_fb, 180, 3100, 20, 22, 14, v_admin);

  -- 2) Reel · TikTok · pagada
  INSERT INTO publications (title, description, budget, content_type_id, status, scheduled_at, published_at, evidence_link, created_by)
    VALUES ('Tutorial: decoración de cupcakes', 'Paso a paso divertido', 120.00, v_ct_reel, 'PUBLISHED',
            NOW() - INTERVAL '22 days', NOW() - INTERVAL '20 days', 'https://tiktok.com/@manjau/demo2', v_admin)
    RETURNING id INTO v_pub;
  INSERT INTO publication_social_accounts (publication_id, social_account_id) VALUES (v_pub, v_acc_tt);
  INSERT INTO publication_metrics (publication_id, social_account_id, reactions, reach, saves, shares, comments, recorded_by)
    VALUES (v_pub, v_acc_tt, 1240, 8750, 210, 320, 95, v_admin);

  -- 3) Carrusel · IG + FB + TikTok · pagada
  INSERT INTO publications (title, description, budget, content_type_id, status, scheduled_at, published_at, evidence_link, created_by)
    VALUES ('Promoción del día de la madre', 'Combos especiales', 320.00, v_ct_carousel, 'PUBLISHED',
            NOW() - INTERVAL '18 days', NOW() - INTERVAL '16 days', 'https://instagram.com/p/demo3', v_admin)
    RETURNING id INTO v_pub;
  INSERT INTO publication_social_accounts (publication_id, social_account_id) VALUES (v_pub, v_acc_ig), (v_pub, v_acc_fb), (v_pub, v_acc_tt);
  INSERT INTO publication_metrics (publication_id, social_account_id, reactions, reach, saves, shares, comments, recorded_by)
    VALUES (v_pub, v_acc_ig, 540, 6200, 88, 60, 40, v_admin),
           (v_pub, v_acc_fb, 300, 4100, 35, 30, 22, v_admin),
           (v_pub, v_acc_tt, 890, 7300, 120, 140, 70, v_admin);

  -- 4) Reel · IG · orgánica (sin presupuesto)
  INSERT INTO publications (title, description, budget, content_type_id, status, scheduled_at, published_at, evidence_link, created_by)
    VALUES ('Detrás de cámaras: horneando croissants', 'Contenido orgánico', NULL, v_ct_reel, 'PUBLISHED',
            NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days', 'https://instagram.com/p/demo4', v_admin)
    RETURNING id INTO v_pub;
  INSERT INTO publication_social_accounts (publication_id, social_account_id) VALUES (v_pub, v_acc_ig);
  INSERT INTO publication_metrics (publication_id, social_account_id, reactions, reach, saves, shares, comments, recorded_by)
    VALUES (v_pub, v_acc_ig, 521, 6100, 92, 48, 33, v_admin);

  -- 5) Imagen · IG + FB · pagada
  INSERT INTO publications (title, description, budget, content_type_id, status, scheduled_at, published_at, evidence_link, created_by)
    VALUES ('Sabor del mes: macarons de lavanda', 'Edición limitada', 120.00, v_ct_image, 'PUBLISHED',
            NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', 'https://facebook.com/manjau/demo5', v_admin)
    RETURNING id INTO v_pub;
  INSERT INTO publication_social_accounts (publication_id, social_account_id) VALUES (v_pub, v_acc_ig), (v_pub, v_acc_fb);
  INSERT INTO publication_metrics (publication_id, social_account_id, reactions, reach, saves, shares, comments, recorded_by)
    VALUES (v_pub, v_acc_ig, 278, 3800, 40, 26, 15, v_admin),
           (v_pub, v_acc_fb, 160, 2600, 18, 20, 10, v_admin);

  -- 6) Video · TikTok · orgánica
  INSERT INTO publications (title, description, budget, content_type_id, status, scheduled_at, published_at, evidence_link, created_by)
    VALUES ('Receta exprés: muffins de arándanos', 'Video corto', NULL, v_ct_video, 'PUBLISHED',
            NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', 'https://tiktok.com/@manjau/demo6', v_admin)
    RETURNING id INTO v_pub;
  INSERT INTO publication_social_accounts (publication_id, social_account_id) VALUES (v_pub, v_acc_tt);
  INSERT INTO publication_metrics (publication_id, social_account_id, reactions, reach, saves, shares, comments, recorded_by)
    VALUES (v_pub, v_acc_tt, 670, 5500, 95, 110, 48, v_admin);

  -- 7) Historia · IG · pagada (recién cumple 8 días)
  INSERT INTO publications (title, description, budget, content_type_id, status, scheduled_at, published_at, evidence_link, created_by)
    VALUES ('Oferta relámpago fin de semana', '20% en toda la vitrina', 90.00, v_ct_story, 'PUBLISHED',
            NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', 'https://instagram.com/stories/demo7', v_admin)
    RETURNING id INTO v_pub;
  INSERT INTO publication_social_accounts (publication_id, social_account_id) VALUES (v_pub, v_acc_ig);
  INSERT INTO publication_metrics (publication_id, social_account_id, reactions, reach, saves, shares, comments, recorded_by)
    VALUES (v_pub, v_acc_ig, 205, 2900, 30, 18, 9, v_admin);

  RAISE NOTICE 'Seed de demo creado: 3 cuentas, 7 publicaciones y sus métricas.';
END $$;
