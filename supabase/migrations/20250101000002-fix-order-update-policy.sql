-- Add missing UPDATE policy for orders table
-- This allows users to update their own orders (needed for payment processing)
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for admin users to update any order
-- Note: Using the user_role enum type that was created in the previous migration
CREATE POLICY "Admins can update any order" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'::user_role
    )
  );

-- Add missing RLS policies for order_items table
-- The order_items table had RLS enabled but no policies, causing checkout failures

CREATE POLICY "Users can create order items for their own orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view order items for their own orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update order items for their own orders" ON public.order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_id 
      AND user_id = auth.uid()
    )
  );

-- Add admin policies for order_items table
CREATE POLICY "Admins can manage all order items" ON public.order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'::user_role
    )
  ); 