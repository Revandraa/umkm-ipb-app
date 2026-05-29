-- ========================================
-- 8. PROMOS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.promos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percent',
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order DECIMAL(12, 2) DEFAULT 0,
    max_discount DECIMAL(12, 2),
    umkm_id UUID REFERENCES public.umkm(id) ON DELETE SET NULL,
    image_url VARCHAR(512),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for updated_at in promos
CREATE OR REPLACE TRIGGER set_updated_at_promos BEFORE UPDATE ON public.promos FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
