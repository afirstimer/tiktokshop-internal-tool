# 📤 Hướng Dẫn Upload Hình Ảnh

Hướng dẫn chi tiết cách chuẩn bị và upload hình ảnh sử dụng batch upload script.

## 📋 Yêu Cầu Tên File

### Format Tên File

Tên file **PHẢI** tuân theo format sau:

```
{ORDER_ID}.{extension}
```

**Ví dụ:**
- ✅ `12345.jpg`
- ✅ `67890.png`
- ✅ `11111.jpeg`
- ✅ `99999.jpg`

### Quy Tắc:

1. **Order ID** là tên file (bỏ phần extension)
2. **Extension** phải là định dạng ảnh hợp lệ: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`
3. Tên file không được có khoảng trắng hoặc ký tự đặc biệt (trừ dấu `-` và `_`)

### ❌ Tên File KHÔNG Hợp Lệ:

- ❌ `12345 packing.jpg` (có khoảng trắng)
- ❌ `12345@#$.jpg` (có ký tự đặc biệt không hợp lệ)
- ❌ `.jpg` (thiếu Order ID)

## 📁 Cấu Trúc Thư Mục

Trước khi chạy script, đảm bảo có cấu trúc thư mục sau:

```
tiktokshop-internal-tool/
├── batch-upload/
│   └── ...
├── uploads/          ← Đặt file ảnh ở đây
├── processed/        ← Script tự động tạo
├── errors/           ← Script tự động tạo
└── .env
```

## 🚀 Các Bước Upload

### Bước 1: Chuẩn Bị File Ảnh

1. **Đổi tên file** theo format: `{ORDER_ID}.{ext}`
   
   Ví dụ:
   - File gốc: `IMG_20240101_123456.jpg`
   - Đổi thành: `12345.jpg` (nếu Order ID là 12345)
   
   **Lưu ý:** Tên file chính là Order ID, không cần thêm suffix hay mô tả

2. **Kiểm tra định dạng**: Đảm bảo file là ảnh hợp lệ

### Bước 2: Đặt File Vào Thư Mục Uploads

**Windows:**
```powershell
# Tạo thư mục nếu chưa có
New-Item -ItemType Directory -Force -Path uploads

# Copy file vào thư mục
Copy-Item "C:\path\to\your\image\12345_packing.jpg" -Destination "uploads\"
```

**Hoặc dùng File Explorer:**
1. Mở thư mục `tiktokshop-internal-tool`
2. Tạo thư mục `uploads` nếu chưa có
3. Copy/cắt file ảnh vào thư mục `uploads`

**Linux/Mac:**
```bash
# Tạo thư mục nếu chưa có
mkdir -p uploads

# Copy file vào thư mục
cp /path/to/your/image/12345_packing.jpg uploads/
```

### Bước 3: Kiểm Tra File Trước Khi Upload

```bash
# Windows PowerShell
Get-ChildItem uploads\*.jpg, uploads\*.png, uploads\*.jpeg

# Linux/Mac
ls -la uploads/
```

### Bước 4: Chạy Batch Upload Script

```bash
cd batch-upload
npm run upload
```

Script sẽ:
1. ✅ Quét tất cả file ảnh trong thư mục `uploads/`
2. ✅ Trích xuất Order ID từ tên file
3. ✅ Upload lên Cloudinary
4. ✅ Ghi metadata vào Supabase
5. ✅ Di chuyển file thành công → `processed/`
6. ✅ Di chuyển file lỗi → `errors/`

## 📊 Ví Dụ Thực Tế

### Ví Dụ 1: Upload 1 File

**File:** `12345.jpg`

```bash
# 1. Copy file vào uploads
Copy-Item "C:\images\12345.jpg" -Destination "uploads\"

# 2. Chạy script
cd batch-upload
npm run upload
```

**Kết quả:**
```
🚀 Bắt đầu batch upload script...

📄 Xử lý: 12345.jpg (Order ID: 12345)
   ☁️  Đang upload lên Cloudinary...
   ✅ Upload thành công: https://res.cloudinary.com/...
   💾 Đang ghi vào Supabase...
   ✅ Đã ghi vào DB (ID: abc-123-def)
   📦 Đã di chuyển file sang thư mục processed

📊 KẾT QUẢ TỔNG KẾT
✅ Thành công: 1
⏭️  Đã bỏ qua: 0
❌ Thất bại: 0
```

### Ví Dụ 2: Upload Nhiều File

**Files:**
- `12345.jpg`
- `67890.png`
- `11111.jpeg`
- `99999.jpg`

```bash
# Copy tất cả file vào uploads
Copy-Item "C:\images\*.jpg", "C:\images\*.png" -Destination "uploads\"

# Chạy script
cd batch-upload
npm run upload
```

**Kết quả:**
- 4 files được xử lý
- Mỗi file được upload và ghi vào DB
- Files di chuyển vào `processed/`

### Ví Dụ 3: File Trùng Lặp

Nếu file đã tồn tại trong database (cùng Order ID + File Name):

```
📄 Xử lý: 12345.jpg (Order ID: 12345)
   ⏭️  File đã tồn tại, bỏ qua...
   📦 Đã di chuyển file sang thư mục processed
```

**Lưu ý:** Mỗi Order ID chỉ có thể có 1 file trong database. Nếu upload file mới với cùng Order ID nhưng tên file khác, file cũ sẽ được giữ nguyên.

## ⚠️ Xử Lý Lỗi

### Lỗi: "Không thể trích xuất Order ID"

**Nguyên nhân:** Tên file không đúng format hoặc rỗng

**Giải pháp:**
- Đổi tên file theo format: `{ORDER_ID}.{ext}`
- Đảm bảo tên file (bỏ extension) không rỗng
- Ví dụ: `12345.jpg` → Order ID sẽ là `12345`

### Lỗi: "Thư mục không tồn tại"

**Nguyên nhân:** Thư mục `uploads/` chưa được tạo

**Giải pháp:**
```bash
# Tạo thư mục
mkdir uploads
```

### Lỗi: Upload Cloudinary thất bại

**Nguyên nhân:** 
- API keys không đúng
- File quá lớn
- Network issues

**Giải pháp:**
- Kiểm tra `.env` có đúng Cloudinary credentials
- Kiểm tra kích thước file (nên < 10MB)
- Script sẽ tự động retry 3 lần

### Lỗi: Ghi vào Supabase thất bại

**Nguyên nhân:**
- Supabase credentials không đúng
- Database chưa được setup
- Network issues

**Giải pháp:**
- Kiểm tra `.env` có đúng Supabase credentials
- Chạy SQL script setup database (xem README.md)
- Kiểm tra kết nối internet

## 💡 Tips & Best Practices

### 1. Đặt Tên File Đúng Format

✅ **Tốt:**
- `12345.jpg` (Order ID rõ ràng)
- `67890.png` (Đơn giản, dễ quản lý)
- `ABC123.jpg` (Hỗ trợ cả chữ và số)

❌ **Không tốt:**
- `12345 packing.jpg` (có khoảng trắng)
- `12345@#$.jpg` (có ký tự đặc biệt)
- `.jpg` (thiếu Order ID)

### 2. Batch Upload Hiệu Quả

- Upload nhiều file cùng lúc thay vì từng file một
- Script xử lý tuần tự để tránh quá tải

### 3. Kiểm Tra Kết Quả

Sau khi upload, kiểm tra:
- Files đã di chuyển vào `processed/` → Thành công
- Files ở `errors/` → Có lỗi, xem log để biết nguyên nhân

### 4. Backup Trước Khi Upload

Nên giữ bản copy gốc của file trước khi upload:
```bash
# Copy vào thư mục backup
Copy-Item "uploads\*.jpg" -Destination "backup\"
```

## 🔍 Kiểm Tra Sau Khi Upload

### 1. Kiểm Tra Trong Supabase

Vào Supabase Dashboard → Table Editor → `order_images`:
- Tìm records với `order_id` tương ứng
- Kiểm tra `cloudinary_url` có hợp lệ

### 2. Kiểm Tra Trong React App

1. Chạy React app: `cd react-app && npm run dev`
2. Tìm kiếm bằng Order ID
3. Xem ảnh đã hiển thị chưa

## 📞 Troubleshooting

### Script không chạy

```bash
# Kiểm tra dependencies
cd batch-upload
npm install

# Kiểm tra .env
# Đảm bảo file .env ở root có đầy đủ config
```

### Không tìm thấy file

```bash
# Kiểm tra đường dẫn trong .env
# Mặc định: UPLOAD_DIR=./uploads

# Kiểm tra file có trong thư mục
ls uploads/  # Linux/Mac
dir uploads  # Windows
```

### File bị duplicate

Script tự động phát hiện và bỏ qua file trùng lặp (cùng Order ID + File Name).

Nếu muốn upload lại:
1. Xóa record trong Supabase
2. Hoặc đổi tên file (thêm suffix khác)

---

**Cần hỗ trợ thêm?** Xem file `README.md` hoặc kiểm tra logs trong console.

