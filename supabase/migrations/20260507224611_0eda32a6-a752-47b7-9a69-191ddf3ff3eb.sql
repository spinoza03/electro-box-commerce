
-- Fix function search_path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- Tighten orders INSERT policy: validate basic fields, prevent garbage
DROP POLICY IF EXISTS "public can create orders" ON public.orders;
CREATE POLICY "public can create orders" ON public.orders FOR INSERT
WITH CHECK (
  length(customer_name) BETWEEN 2 AND 120
  AND length(phone) BETWEEN 6 AND 30
  AND length(city) BETWEEN 2 AND 80
  AND length(address) BETWEEN 4 AND 400
  AND quantity > 0 AND quantity <= 50
  AND total_price >= 0
  AND status = 'pending'
);
