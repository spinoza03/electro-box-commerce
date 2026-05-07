
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Order status enum
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price NUMERIC(10,2),
  stock_count INTEGER NOT NULL DEFAULT 0,
  html_description TEXT,
  html_description_ar TEXT,
  short_description TEXT,
  short_description_ar TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "admins read all products" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL UNIQUE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Settings (key-value)
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
-- Pixels and store alerts must be readable by storefront (anon)
CREATE POLICY "public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "admins write settings" ON public.settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed default settings keys
INSERT INTO public.settings (key, value) VALUES
  ('meta_pixel_id', ''),
  ('tiktok_pixel_id', ''),
  ('google_id', ''),
  ('store_alert', ''),
  ('store_name', 'Electro Box Edge'),
  ('whatsapp_number', '')
ON CONFLICT (key) DO NOTHING;

-- Seed sample product
INSERT INTO public.products (name, name_ar, slug, price, compare_at_price, stock_count, short_description, short_description_ar, html_description, html_description_ar, images, category, is_featured)
VALUES (
  'Écouteurs Sans Fil Pro X',
  'سماعات لاسلكية برو إكس',
  'ecouteurs-sans-fil-pro-x',
  299, 499, 50,
  'Son immersif, batterie 30h, réduction de bruit active.',
  'صوت غامر، بطارية 30 ساعة، إلغاء الضوضاء النشط.',
  '<h2>Caractéristiques</h2><ul><li>Bluetooth 5.3</li><li>Autonomie 30h</li><li>Réduction de bruit ANC</li><li>Étanche IPX5</li></ul><p>Livraison gratuite partout au Maroc. Paiement à la livraison.</p>',
  '<h2>المواصفات</h2><ul><li>بلوتوث 5.3</li><li>بطارية 30 ساعة</li><li>إلغاء الضوضاء ANC</li><li>مقاوم للماء IPX5</li></ul><p>توصيل مجاني في جميع أنحاء المغرب. الدفع عند الاستلام.</p>',
  ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200','https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=1200'],
  'audio', true
);
