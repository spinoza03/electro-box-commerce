-- Variants on products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '[]'::jsonb;
-- Each entry: { "name": "Couleur", "name_ar": "اللون", "options": ["Noir","Blanc"] }

-- Selected variants on orders (e.g. {"Couleur":"Noir","Taille":"M"})
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS variant_selection JSONB;

-- New settings key: which conversion event to fire (Purchase or Lead)
INSERT INTO public.settings (key, value)
VALUES ('pixel_conversion_event', 'Purchase')
ON CONFLICT (key) DO NOTHING;
