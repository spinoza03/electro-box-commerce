-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "admins read all categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins write categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER categories_touch
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed a few starter categories (matches the design example)
INSERT INTO public.categories (slug, name, name_ar, sort_order) VALUES
  ('audio',     'Audio',     'صوتيات',   10),
  ('montres',   'Montres',   'ساعات',    20),
  ('maison',    'Maison',    'منزل',     30),
  ('mobilite',  'Mobilité',  'تنقل',     40),
  ('photo',     'Photo',     'تصوير',    50)
ON CONFLICT (slug) DO NOTHING;

-- Backfill any existing products.category text values into the categories table
INSERT INTO public.categories (slug, name, sort_order)
SELECT DISTINCT
  lower(category) AS slug,
  initcap(category) AS name,
  100
FROM public.products
WHERE category IS NOT NULL AND category <> ''
ON CONFLICT (slug) DO NOTHING;
