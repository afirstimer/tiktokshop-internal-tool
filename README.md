# 🚀 Hệ Thống Quản Lý Hình Ảnh Theo Order ID

Hệ thống liên kết hình ảnh vật lý (ảnh gói hàng, mã vận đơn) với Order ID, cho phép tìm kiếm và tải về dễ dàng.

## 📋 Yêu Cầu Hệ Thống

- Node.js >= 18.x
- npm hoặc yarn
- Tài khoản Supabase
- Tài khoản Cloudinary

## 🛠️ Cài Đặt

### 1. Cài đặt dependencies cho Batch Upload Script

```bash
cd tiktokshop-internal-tool/batch-upload
npm install
```

### 2. Cấu hình Environment Variables

1. Copy file `env.example` thành `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item env.example .env
   
   # Hoặc Linux/Mac
   cp env.example .env
   ```

2. Điền thông tin vào file `.env`:

   **Supabase:**
   - Vào https://app.supabase.com/project/YOUR_PROJECT/settings/api
   - Copy `Project URL` → `SUPABASE_URL`
   - Copy `anon public` key → `SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Bảo mật cao, chỉ dùng cho batch script)

   **Cloudinary:**
   - Vào https://console.cloudinary.com/settings/api-keys
   - Copy `Cloud name` → `CLOUDINARY_CLOUD_NAME`
   - Copy `API Key` → `CLOUDINARY_API_KEY`
   - Copy `API Secret` → `CLOUDINARY_API_SECRET`

### 3. Setup Database (Supabase)

Chạy SQL script sau trong Supabase SQL Editor:

```sql
-- Tạo bảng order_images
CREATE TABLE order_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(20) NOT NULL,
  cloudinary_url TEXT NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo index cho order_id để tăng tốc tìm kiếm
CREATE INDEX idx_order_images_order_id ON order_images(order_id);

-- Thiết lập Row Level Security (RLS)
ALTER TABLE order_images ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép authenticated users đọc dữ liệu
CREATE POLICY "Allow authenticated users to read order_images"
ON order_images
FOR SELECT
TO authenticated
USING (true);
```

### 4. Tạo thư mục cần thiết

```bash
mkdir uploads processed errors
```

## 📁 Cấu Trúc Project

```
tiktokshop-internal-tool/
├── batch-upload/          # Script upload hàng loạt
│   ├── index.js          # Main upload script
│   ├── config.js          # Config & env validation
│   ├── utils.js           # Helper functions
│   └── package.json
├── react-app/            # Tool tìm kiếm (React) - Coming soon
│   ├── src/
│   └── package.json
├── uploads/              # Thư mục chứa file cần upload
├── processed/            # Thư mục file đã xử lý thành công
├── errors/               # Thư mục file lỗi
├── .env                  # Environment variables (không commit)
├── env.example           # Template env
└── README.md
```

## 🚀 Sử Dụng

### Batch Upload Script

#### Cách sử dụng:

1. **Chuẩn bị file ảnh:**
   - Đặt các file ảnh vào thư mục `uploads/` (tạo thư mục nếu chưa có)
   - Tên file phải có format: `{ORDER_ID}.{ext}` (tên file chính là Order ID)
   - Ví dụ: `12345.jpg`, `67890.png`

2. **Chạy script:**
   ```bash
   cd batch-upload
   npm run upload
   ```

3. **Kết quả:**
   - File thành công → di chuyển vào `processed/`
   - File lỗi → di chuyển vào `errors/`
   - Script sẽ hiển thị báo cáo chi tiết

#### Tính năng:

- ✅ Tự động trích xuất Order ID từ tên file
- ✅ Upload lên Cloudinary với folder structure
- ✅ Ghi metadata vào Supabase
- ✅ Phát hiện và bỏ qua file trùng lặp
- ✅ Retry tự động khi có lỗi network (3 lần với exponential backoff)
- ✅ Logging chi tiết và progress tracking
- ✅ Xử lý lỗi an toàn, không mất dữ liệu

#### 📖 Hướng Dẫn Chi Tiết:

Xem file **[UPLOAD_GUIDE.md](./batch-upload/UPLOAD_GUIDE.md)** để biết:
- Format tên file cần thiết
- Cách chuẩn bị và đặt file vào thư mục
- Ví dụ thực tế
- Troubleshooting các lỗi thường gặp

### React App (Tool Tìm kiếm)

#### Cài đặt:

1. **Cài đặt dependencies:**
   ```bash
   cd react-app
   npm install
   ```

2. **Cấu hình Environment Variables:**
   
   Vite sử dụng prefix `VITE_` cho env variables. Copy file `env.example` thành `.env`:
   
   ```bash
   # Windows PowerShell
   cd react-app
   Copy-Item env.example .env
   
   # Hoặc Linux/Mac
   cp env.example .env
   ```
   
   Sau đó chỉnh sửa file `.env` và điền thông tin Supabase:
   - `VITE_SUPABASE_URL`: URL từ Supabase dashboard
   - `VITE_SUPABASE_ANON_KEY`: Anon key từ Supabase dashboard

3. **Chạy app:**
   ```bash
   npm run dev
   ```
   
   App sẽ mở tự động tại http://localhost:3000

#### Tính năng:

- ✅ Tìm kiếm hình ảnh theo Order ID
- ✅ Hiển thị danh sách ảnh dạng grid với preview
- ✅ Click vào ảnh để xem full size trong modal
- ✅ Tải về ảnh với một click
- ✅ Hiển thị thông tin: tên file, ngày upload
- ✅ Loading states và error handling
- ✅ Responsive design (mobile-friendly)
- ✅ UI hiện đại với animations

## 🔒 Bảo Mật

- ⚠️ **KHÔNG** commit file `.env` lên Git
- `SUPABASE_SERVICE_ROLE_KEY` có quyền cao, chỉ dùng cho batch script
- React app chỉ dùng `SUPABASE_ANON_KEY` với RLS policy

## 📝 Ghi Chú

- File upload phải có format: `{ORDER_ID}.{ext}` (ví dụ: `12345.jpg`)
- Order ID sẽ được lấy trực tiếp từ tên file (bỏ phần extension)
- Mỗi Order ID chỉ có thể có 1 file trong database

