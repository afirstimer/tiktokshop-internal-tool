# 🚀 Hướng Dẫn Deploy Lên Netlify

## 📦 Build Output

Sau khi chạy `npm run build`, thư mục `dist/` chứa các file đã được build sẵn sàng để deploy.

## 🌐 Deploy Lên Netlify

### Cách 1: Deploy Manual (Drag & Drop)

1. **Chuẩn bị:**
   - Đảm bảo đã chạy `npm run build` thành công
   - Thư mục `dist/` đã được tạo

2. **Deploy:**
   - Vào https://app.netlify.com/
   - Kéo thả thư mục `dist/` vào vùng "Deploy manually"
   - Netlify sẽ tự động deploy

3. **Cấu hình Environment Variables:**
   - Vào Site settings → Environment variables
   - Thêm các biến sau:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - Sau đó **redeploy** site để áp dụng env variables

### Cách 2: Deploy Từ Git Repository

1. **Push code lên Git:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Kết nối với Netlify:**
   - Vào Netlify Dashboard
   - Chọn "Add new site" → "Import an existing project"
   - Chọn Git provider (GitHub/GitLab/Bitbucket)
   - Chọn repository

3. **Cấu hình Build Settings:**
   - **Build command:** `cd react-app && npm run build`
   - **Publish directory:** `react-app/dist`
   - Hoặc nếu deploy từ root:
     - **Base directory:** `react-app`
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`

4. **Environment Variables:**
   - Vào Site settings → Environment variables
   - Thêm:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

5. **Deploy:**
   - Click "Deploy site"
   - Netlify sẽ tự động build và deploy

## ⚙️ Cấu Hình Bổ Sung

### File `netlify.toml`

File `netlify.toml` đã được tạo để:
- Chỉ định thư mục publish là `dist`
- Redirect tất cả routes về `index.html` (cho SPA routing)

### Environment Variables

**QUAN TRỌNG:** Vite sử dụng prefix `VITE_` cho env variables.

Trong Netlify, thêm:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Lưu ý:** Sau khi thêm/sửa env variables, cần **redeploy** site.

## 🔍 Kiểm Tra Sau Khi Deploy

1. Truy cập URL được Netlify cung cấp
2. Test tìm kiếm với Order ID: `577199824153251946`
3. Kiểm tra download ảnh có hoạt động không

## 🐛 Troubleshooting

### Lỗi: "Cannot find module"

- Đảm bảo đã chạy `npm install` trước khi build
- Kiểm tra `node_modules/` có tồn tại

### Lỗi: Environment variables không hoạt động

- Kiểm tra prefix `VITE_` đã đúng chưa
- Redeploy site sau khi thêm env variables
- Xem logs trong Netlify để debug

### Lỗi: 404 khi refresh page

- File `netlify.toml` đã có redirect rule
- Nếu vẫn lỗi, kiểm tra file `_redirects` trong `dist/`

## 📝 Notes

- Build output nằm trong `react-app/dist/`
- File `netlify.toml` đã được cấu hình sẵn
- Nhớ thêm environment variables trong Netlify dashboard














