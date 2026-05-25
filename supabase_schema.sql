-- ============================================================================
-- SCRIPT DE MIGRACIÓN: ESQUEMA DE BASE DE DATOS PARA SUPABASE
-- PROYECTO: DIEGO GALMARINI CRM & WEB
-- ============================================================================

-- Habilitar la extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: Planes de Asesoría (Stripe / Pricing)
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY, -- 'express', 'full', 'initial'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    duration INT NOT NULL,
    features TEXT[] DEFAULT '{}',
    "isActive" BOOLEAN DEFAULT true,
    "maxConsultations" INT,
    "supportLevel" TEXT CHECK ("supportLevel" IN ('basic', 'standard', 'premium')) DEFAULT 'standard',
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA: Clientes (CRM)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    company TEXT,
    position TEXT,
    "registrationDate" TIMESTAMPTZ DEFAULT now(),
    "lastContactDate" TIMESTAMPTZ,
    "totalConsultations" INT DEFAULT 0,
    "totalAppointments" INT DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'inactive', 'blocked')) DEFAULT 'active',
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    "preferredContactMethod" TEXT CHECK ("preferredContactMethod" IN ('email', 'phone', 'whatsapp')) DEFAULT 'email',
    timezone TEXT,
    language TEXT DEFAULT 'es',
    source TEXT CHECK (source IN ('website', 'referral', 'direct', 'social_media')) DEFAULT 'website'
);

-- 3. TABLA: Consultas / Leads
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "consultationCode" TEXT UNIQUE,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    services TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')) DEFAULT 'pending',
    "paymentStatus" TEXT CHECK ("paymentStatus" IN ('free', 'pending', 'paid')) DEFAULT 'free',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    "planType" TEXT CHECK ("planType" IN ('mail', '30min', '60min', 'custom')) DEFAULT 'mail',
    "customDuration" INT,
    "customPrice" NUMERIC,
    "startTime" TIME,
    "endTime" TIME,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    source TEXT CHECK (source IN ('website', 'referral', 'direct', 'social_media')) DEFAULT 'website',
    "assignedTo" TEXT
);

-- 4. TABLA: Citas / Reservas
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "appointmentCode" TEXT UNIQUE,
    "clientId" UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    duration INT NOT NULL,
    type TEXT CHECK (type IN ('consultation', 'follow-up', 'planning', 'review')) DEFAULT 'consultation',
    "planType" TEXT CHECK ("planType" IN ('mail', '30min', '60min', 'custom')) DEFAULT '30min',
    "paymentStatus" TEXT CHECK ("paymentStatus" IN ('free', 'pending', 'paid')) DEFAULT 'free',
    "customPrice" NUMERIC,
    status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    location TEXT,
    "meetingLink" TEXT,
    notes TEXT,
    "reminderSent" BOOLEAN DEFAULT false,
    "reminderMinutes" INT,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now(),
    "cancelReason" TEXT,
    outcome TEXT,
    "followUpRequired" BOOLEAN DEFAULT false,
    "nextSteps" TEXT
);

-- 5. TABLA: Horarios de Disponibilidad (Calendly-style)
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "isAvailable" BOOLEAN DEFAULT true,
    type TEXT CHECK (type IN ('available', 'blocked', 'unavailable')) DEFAULT 'available',
    reason TEXT,
    "isRecurring" BOOLEAN DEFAULT false,
    "dayOfWeek" TEXT CHECK ("dayOfWeek" IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    "recurringPattern" JSONB
);

-- 6. TABLA: Periodos Bloqueados (Vacaciones/Feriados)
CREATE TABLE IF NOT EXISTS public.blocked_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "startTime" TIME,
    "endTime" TIME,
    type TEXT CHECK (type IN ('full_day', 'time_range')) DEFAULT 'full_day',
    reason TEXT NOT NULL,
    "isRecurring" BOOLEAN DEFAULT false,
    "recurringDays" INT[], -- 0=domingo, 1=lunes, etc.
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "createdBy" TEXT
);

-- 7. TABLA: Plantillas de Mensajes
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('appointment_confirmation', 'appointment_reminder', 'appointment_change', 'follow_up', 'cancellation', 'welcome', 'custom')) DEFAULT 'custom',
    variables TEXT[] DEFAULT '{}',
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now(),
    "usageCount" INT DEFAULT 0,
    "lastUsed" TIMESTAMPTZ
);

-- 8. TABLA: Logs de Comunicación (Resend / WhatsApp / Notas)
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    "appointmentId" UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    "consultationId" UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('email', 'call', 'meeting', 'note', 'sms', 'whatsapp')) NOT NULL,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT now(),
    status TEXT CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'pending')) DEFAULT 'sent',
    "templateId" UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
    attachments TEXT[],
    "createdBy" TEXT NOT NULL
);

-- 9. TABLA: Tareas de Seguimiento (Kanban)
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    "appointmentId" UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    "consultationId" UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "dueDate" TIMESTAMPTZ NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')) DEFAULT 'pending',
    type TEXT CHECK (type IN ('call', 'email', 'meeting', 'task', 'proposal', 'contract')) DEFAULT 'task',
    "assignedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now(),
    "completedAt" TIMESTAMPTZ,
    notes TEXT,
    "reminderDate" TIMESTAMPTZ
);

-- 10. TABLA: Artículos del Blog IA
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    "publishedAt" TIMESTAMPTZ NOT NULL,
    author TEXT NOT NULL,
    "readTime" TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    "imageUrl" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (RLS) - CONFIGURACIÓN INICIAL
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 1. Políticas para PLANES (Acceso de lectura público, escritura admin)
CREATE POLICY "Allow public read access to plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to plans" ON public.plans FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');

-- 2. Políticas para BLOG_POSTS (Acceso de lectura público, escritura admin)
CREATE POLICY "Allow public read access to blog_posts" ON public.blog_posts FOR SELECT USING ("isActive" = true);
CREATE POLICY "Allow admin full access to blog_posts" ON public.blog_posts FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');

-- 3. Políticas para CONSULTAS / LEADS (Escritura pública para nuevos leads, lectura/gestión admin)
CREATE POLICY "Allow public insert of consultations" ON public.consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin full access to consultations" ON public.consultations FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');

-- 4. Políticas de Horarios Disponibilidad (Lectura pública, escritura admin)
CREATE POLICY "Allow public read of availability_slots" ON public.availability_slots FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to availability_slots" ON public.availability_slots FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');

-- 5. Políticas de Periodos Bloqueados (Lectura pública, escritura admin)
CREATE POLICY "Allow public read of blocked_periods" ON public.blocked_periods FOR SELECT USING (true);
CREATE POLICY "Allow admin full access to blocked_periods" ON public.blocked_periods FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');

-- 6. Políticas del CRM (Sólo administradores autorizados)
CREATE POLICY "Allow admin full access to clients" ON public.clients FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');
CREATE POLICY "Allow admin full access to appointments" ON public.appointments FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');
CREATE POLICY "Allow admin full access to message_templates" ON public.message_templates FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');
CREATE POLICY "Allow admin full access to communication_logs" ON public.communication_logs FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');
CREATE POLICY "Allow admin full access to follow_ups" ON public.follow_ups FOR ALL USING (auth.jwt()->>'email' = 'diegogalmarini@gmail.com');
