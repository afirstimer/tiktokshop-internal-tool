-- ============================================
-- FIX RLS POLICY FOR REACT APP
-- ============================================
-- Vấn đề: React app dùng anon key (không authenticated)
-- Giải pháp: Cho phép anon users đọc dữ liệu

-- Xóa policy cũ (nếu có)
DROP POLICY IF EXISTS "Allow authenticated users to read order_images" ON order_images;

-- Tạo policy mới cho phép tất cả users (bao gồm anon) đọc dữ liệu
CREATE POLICY "Allow public read access to order_images"
ON order_images
FOR SELECT
TO public
USING (true);

-- Hoặc nếu muốn bảo mật hơn, chỉ cho phép đọc (không cho insert/update/delete)
-- Policy này cho phép mọi người đọc nhưng không thể sửa/xóa

-- Kiểm tra policy đã được tạo
SELECT * FROM pg_policies WHERE tablename = 'order_images';





