 -- =====================================================
-- SISTEMA DE ADMIN E VÍDEOS DE EXERCÍCIOS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Tabela de administradores
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de vídeos de exercícios
CREATE TABLE IF NOT EXISTS exercise_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_name TEXT NOT NULL,
    exercise_name_normalized TEXT NOT NULL, -- Para busca case-insensitive
    youtube_video_id TEXT NOT NULL,
    youtube_url TEXT GENERATED ALWAYS AS ('https://www.youtube.com/watch?v=' || youtube_video_id) STORED,
    embed_url TEXT GENERATED ALWAYS AS ('https://www.youtube.com/embed/' || youtube_video_id) STORED,
    thumbnail_url TEXT GENERATED ALWAYS AS ('https://img.youtube.com/vi/' || youtube_video_id || '/mqdefault.jpg') STORED,
    channel_name TEXT DEFAULT 'Queslo Sistemas',
    description TEXT,
    muscle_group TEXT, -- ex: 'peito', 'costas', 'pernas', etc.
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_exercise_videos_name ON exercise_videos(exercise_name_normalized);
CREATE INDEX IF NOT EXISTS idx_exercise_videos_muscle ON exercise_videos(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercise_videos_active ON exercise_videos(is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_exercise_videos_unique ON exercise_videos(exercise_name_normalized, youtube_video_id);

-- 4. Função para normalizar nome do exercício
CREATE OR REPLACE FUNCTION normalize_exercise_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.exercise_name_normalized := LOWER(TRIM(NEW.exercise_name));
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para normalizar automaticamente
DROP TRIGGER IF EXISTS trigger_normalize_exercise_name ON exercise_videos;
CREATE TRIGGER trigger_normalize_exercise_name
    BEFORE INSERT OR UPDATE ON exercise_videos
    FOR EACH ROW
    EXECUTE FUNCTION normalize_exercise_name();

-- 6. RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_videos ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_users
DROP POLICY IF EXISTS "admin_users_select" ON admin_users;
CREATE POLICY "admin_users_select" ON admin_users
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_users_insert" ON admin_users;
CREATE POLICY "admin_users_insert" ON admin_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para exercise_videos (leitura pública, escrita só admin)
DROP POLICY IF EXISTS "exercise_videos_select_all" ON exercise_videos;
CREATE POLICY "exercise_videos_select_all" ON exercise_videos
    FOR SELECT USING (TRUE); -- Todos podem ver vídeos

DROP POLICY IF EXISTS "exercise_videos_insert_admin" ON exercise_videos;
CREATE POLICY "exercise_videos_insert_admin" ON exercise_videos
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "exercise_videos_update_admin" ON exercise_videos;
CREATE POLICY "exercise_videos_update_admin" ON exercise_videos
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "exercise_videos_delete_admin" ON exercise_videos;
CREATE POLICY "exercise_videos_delete_admin" ON exercise_videos
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
    );

-- 7. Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = user_email
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para extrair video ID de URL do YouTube
CREATE OR REPLACE FUNCTION extract_youtube_id(url TEXT)
RETURNS TEXT AS $$
DECLARE
    video_id TEXT;
BEGIN
    -- Formato: youtube.com/watch?v=XXXXX
    IF url ~ 'youtube\.com/watch\?v=' THEN
        video_id := regexp_replace(url, '.*[?&]v=([^&]+).*', '\1');
    -- Formato: youtu.be/XXXXX
    ELSIF url ~ 'youtu\.be/' THEN
        video_id := regexp_replace(url, '.*youtu\.be/([^?]+).*', '\1');
    -- Formato: youtube.com/embed/XXXXX
    ELSIF url ~ 'youtube\.com/embed/' THEN
        video_id := regexp_replace(url, '.*youtube\.com/embed/([^?]+).*', '\1');
    -- Formato: youtube.com/shorts/XXXXX
    ELSIF url ~ 'youtube\.com/shorts/' THEN
        video_id := regexp_replace(url, '.*youtube\.com/shorts/([^?]+).*', '\1');
    -- Já é só o ID
    ELSIF url ~ '^[a-zA-Z0-9_-]{11}$' THEN
        video_id := url;
    ELSE
        video_id := url; -- Tenta usar como está
    END IF;
    
    RETURN video_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Migrar vídeos existentes do código para o banco
-- (Os vídeos que estavam hardcoded no queslo-videos.ts)
INSERT INTO exercise_videos (exercise_name, exercise_name_normalized, youtube_video_id, channel_name, muscle_group)
VALUES
    ('Remada na máquina pegada aberta', 'remada na máquina pegada aberta', 'L1sj8Ujz6Ms', 'Queslo Sistemas', 'costas'),
    ('Remada máquina articulada pegada fechada', 'remada máquina articulada pegada fechada', 'z3Bqm1B9HUc', 'Queslo Sistemas', 'costas'),
    ('Tríceps testa na máquina', 'tríceps testa na máquina', '010bQQVTtno', 'Queslo Sistemas', 'triceps'),
    ('Peck deck voador', 'peck deck voador', 'u0CUc0TKFDM', 'Queslo Sistemas', 'peito'),
    ('Desenvolvimento de ombro máquina', 'desenvolvimento de ombro máquina', 'wL41w-NRH6I', 'Queslo Sistemas', 'ombros'),
    ('Crucifixo invertido', 'crucifixo invertido', 'wBfnhmNur6o', 'Queslo Sistemas', 'costas'),
    ('Desenvolvimento de ombros máquina', 'desenvolvimento de ombros máquina', 'oDrVvWwpTzI', 'Queslo Sistemas', 'ombros'),
    ('Supino inclinado máquina', 'supino inclinado máquina', '4E0mgSfgdfc', 'Queslo Sistemas', 'peito'),
    ('Supino reto máquina', 'supino reto máquina', 'TrjXp1bP8-E', 'Queslo Sistemas', 'peito'),
    ('Remada baixa máquina', 'remada baixa máquina', 'FLT55fPkM_4', 'Queslo Sistemas', 'costas'),
    ('Voador máquina', 'voador máquina', '8Q_VF29Ar-8', 'Queslo Sistemas', 'peito'),
    ('Puxada articulada', 'puxada articulada', 'PRQbKmWyabw', 'Queslo Sistemas', 'costas'),
    ('Tríceps francês unilateral', 'tríceps francês unilateral', 'fRyXgnMB1JM', 'Queslo Sistemas', 'triceps'),
    ('Tríceps francês com halter', 'tríceps francês com halter', '-kRgpfSEwaI', 'Queslo Sistemas', 'triceps'),
    ('Desenvolvimento com halteres', 'desenvolvimento com halteres', 'siwKSEHa3p4', 'Queslo Sistemas', 'ombros'),
    ('Puxada alta com triângulo', 'puxada alta com triângulo', 'LrfNTLtHPiM', 'Queslo Sistemas', 'costas'),
    ('Elevação frontal com halteres (ombros)', 'elevação frontal com halteres (ombros)', 'Kn_yTHD1qpM', 'Queslo Sistemas', 'ombros'),
    ('Remada baixa', 'remada baixa', 'xQ7gRdhBQI8', 'Queslo Sistemas', 'costas'),
    ('Elevação lateral para ombros', 'elevação lateral para ombros', 'q2p43F9gFwo', 'Queslo Sistemas', 'ombros'),
    ('Puxada aberta supinada', 'puxada aberta supinada', 'uBkXGSio4zk', 'Queslo Sistemas', 'costas'),
    ('Rotação Interna com Polia para manguito rotador', 'rotação interna com polia para manguito rotador', 'b_tYLVYBIF8', 'Queslo Sistemas', 'ombros'),
    ('Remada curvada com barra', 'remada curvada com barra', 'Vezbx6CAZzk', 'Queslo Sistemas', 'costas'),
    ('Pull-down crossover corda', 'pull-down crossover corda', 'IMoigAzHT3E', 'Queslo Sistemas', 'costas'),
    ('Pull-down no cross barra reta', 'pull-down no cross barra reta', '0StamgOvaKs', 'Queslo Sistemas', 'costas'),
    ('Remada alta no pulley', 'remada alta no pulley', 'w1kMQ5eR1ZU', 'Queslo Sistemas', 'costas'),
    ('Stiff com barra reta', 'stiff com barra reta', 'oIu-e_mHTPU', 'Queslo Sistemas', 'pernas'),
    ('Abdominal reto', 'abdominal reto', '5RucMkRjTyE', 'Queslo Sistemas', 'abdomen'),
    ('Prancha abdominal', 'prancha abdominal', 'WSirPHTOhx4', 'Queslo Sistemas', 'abdomen'),
    ('Mesa flexora', 'mesa flexora', 'pcsrb3kQwUY', 'Queslo Sistemas', 'pernas'),
    ('Panturrilha sentado na máquina', 'panturrilha sentado na máquina', '-Ct3nbgrbcY', 'Queslo Sistemas', 'pernas'),
    ('Cadeira abdutora', 'cadeira abdutora', 'ShCscfSkYEU', 'Queslo Sistemas', 'pernas'),
    ('Cadeira adutora', 'cadeira adutora', '1tnsk-j5CA0', 'Queslo Sistemas', 'pernas'),
    ('Puxada frontal fechada', 'puxada frontal fechada', 'W98phx1r2Yg', 'Queslo Sistemas', 'costas'),
    ('Posterior de coxa máquina', 'posterior de coxa máquina', '1WXL_oeypTk', 'Queslo Sistemas', 'pernas'),
    ('Bíceps na polia baixa', 'bíceps na polia baixa', 'OnXIagSFoU8', 'Queslo Sistemas', 'biceps'),
    ('Desenvolvimento para ombros sentado com halteres', 'desenvolvimento para ombros sentado com halteres', 'cl29pNd1E0Y', 'Queslo Sistemas', 'ombros'),
    ('Elevação frontal com halteres', 'elevação frontal com halteres', 'O1aSEoHuxpQ', 'Queslo Sistemas', 'ombros'),
    ('Bíceps com halteres', 'bíceps com halteres', 'Kg0SlkZjlTY', 'Queslo Sistemas', 'biceps'),
    ('Crucifixo no banco reto com halteres', 'crucifixo no banco reto com halteres', 'pma0D65cKTk', 'Queslo Sistemas', 'peito'),
    ('Tríceps cross barra v', 'tríceps cross barra v', 'tK3bolJca_4', 'Queslo Sistemas', 'triceps'),
    ('Tríceps corda', 'tríceps corda', 'BCUmmZgW61M', 'Queslo Sistemas', 'triceps'),
    ('Tríceps pulley (na polia) com barra reta', 'tríceps pulley (na polia) com barra reta', 'zwhQg6oEgTU', 'Queslo Sistemas', 'triceps'),
    ('Leg press 180°', 'leg press 180°', 'Wu-CQUYFYO0', 'Queslo Sistemas', 'pernas'),
    ('Agachamento livre barra', 'agachamento livre barra', 'Rb1C_xGT51Y', 'Queslo Sistemas', 'pernas'),
    ('Cadeira flexora', 'cadeira flexora', 'mjCYcvs_BeY', 'Queslo Sistemas', 'pernas'),
    ('Cadeira extensora', 'cadeira extensora', 'kaFLb-jZ14w', 'Queslo Sistemas', 'pernas')
ON CONFLICT (exercise_name_normalized, youtube_video_id) DO NOTHING;

-- 10. View para facilitar consultas
CREATE OR REPLACE VIEW exercise_videos_view AS
SELECT 
    id,
    exercise_name,
    youtube_video_id,
    youtube_url,
    embed_url,
    thumbnail_url,
    channel_name,
    muscle_group,
    is_active,
    view_count,
    created_at
FROM exercise_videos
WHERE is_active = TRUE
ORDER BY exercise_name;

-- =====================================================
-- 11. CRIAR USUÁRIO ADMIN AUTOMATICAMENTE
-- =====================================================

-- Criar o usuário admin diretamente no auth.users
-- Senha: ADMINVERDADEIRO(ADMIN)123456789*&^%$#@!sss
DO $$
DECLARE
    admin_uid UUID;
BEGIN
    -- Verificar se já existe
    SELECT id INTO admin_uid FROM auth.users WHERE email = 'RealAdmin@admin.real';
    
    IF admin_uid IS NULL THEN
        -- Criar usuário admin
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_sent_at,
            recovery_sent_at,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'RealAdmin@admin.real',
            crypt('ADMINVERDADEIRO(ADMIN)123456789*&^%$#@!sss', gen_salt('bf')),
            NOW(),
            NOW(),
            NULL,
            NULL,
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Admin Master"}',
            FALSE,
            NOW(),
            NOW(),
            NULL,
            NULL,
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO admin_uid;
        
        RAISE NOTICE 'Usuário admin criado com ID: %', admin_uid;
    ELSE
        RAISE NOTICE 'Usuário admin já existe com ID: %', admin_uid;
    END IF;
    
    -- Registrar como admin na tabela admin_users
    INSERT INTO admin_users (user_id, email, role)
    VALUES (admin_uid, 'RealAdmin@admin.real', 'super_admin')
    ON CONFLICT (email) DO UPDATE SET role = 'super_admin';
    
    RAISE NOTICE '✅ Admin registrado com sucesso!';
END $$;

-- Criar identidade para o admin (necessário para login)
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    id,
    jsonb_build_object('sub', id::text, 'email', email),
    'email',
    id::text,
    NOW(),
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'RealAdmin@admin.real'
ON CONFLICT (provider, provider_id) DO NOTHING;

-- =====================================================
-- ✅ PRONTO! TUDO FEITO AUTOMATICAMENTE
-- 
-- Agora basta:
-- 1. Fazer login com:
--    Email: RealAdmin@admin.real
--    Senha: ADMINVERDADEIRO(ADMIN)123456789*&^%$#@!sss
-- 2. Acessar: /admin
-- =====================================================

