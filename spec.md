Tuyệt vời\! Dưới đây là bản đặc tả kỹ thuật được định dạng dưới dạng file Markdown (`.md`), sẵn sàng để bạn sao chép và lưu lại.

-----

# 🚀 Đặc Tả Kỹ Thuật: Hệ Thống Quản Lý Hình Ảnh Theo Order ID

## I. Tổng Quan

Hệ thống này được thiết kế để liên kết hình ảnh vật lý (như ảnh gói hàng, ảnh mã vận đơn) với một **Order ID** cụ thể, cho phép nhân viên dễ dàng tìm kiếm và tải về file thông qua một giao diện web đơn giản.

  * **Database:** Supabase (PostgreSQL)
  * **Lưu trữ File:** Cloudinary
  * **Upload:** Batch Script (Node.js)
  * **Tool Tìm kiếm:** React App

-----

## II. 📝 Cấu Trúc Cơ Sở Dữ Liệu (Supabase)

Tất cả dữ liệu liên kết Order ID và URL hình ảnh sẽ được lưu trữ trong một bảng duy nhất trên Supabase.

### Tên bảng: `order_images`

| Tên Trường | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `BIGINT` | Primary Key, Auto-generated | Mã định danh duy nhất của bản ghi. |
| **`order_id`** | `VARCHAR(20)` | NOT NULL | **Mã đơn hàng** (Key để tìm kiếm). |
| **`cloudinary_url`** | `TEXT` | NOT NULL | **URL an toàn** của hình ảnh trên Cloudinary. |
| `public_id` | `VARCHAR` | NOT NULL | ID công khai của Cloudinary (dùng để quản lý/xóa). |
| `file_name` | `VARCHAR` | NOT NULL | Tên file gốc (ví dụ: `12345_packing.jpg`). |
| `uploaded_at` | `TIMESTAMPZ` | DEFAULT NOW() | Thời gian tải lên. |

**Yêu cầu Bảo mật (RLS):**

  * Thiết lập **Row Level Security (RLS)** trên bảng `order_images`.
  * Tạo **SELECT Policy** cho phép người dùng đã xác thực (nhân viên) được quyền `SELECT` dữ liệu.

-----

## III. 💻 Batch Script Upload (Node.js)

Script này chạy cục bộ (local) để xử lý việc tải hàng loạt hình ảnh lên Cloudinary và ghi dữ liệu liên kết vào Supabase.

### 1\. Công nghệ

  * **Ngôn ngữ:** Node.js
  * **Dependencies:**
      * `cloudinary`: SDK để tương tác với Cloudinary.
      * `@supabase/supabase-js`: SDK để tương tác với Supabase DB.
      * `fs`, `path` (built-in Node.js modules) để xử lý file.

### 2\. Logic Xử lý (Flow)

1.  **Đầu vào:** Script nhận một thư mục chỉ định (`/local/uploads`) chứa các file hình ảnh.
2.  **Lặp và Phân tích:**
      * Script lặp qua từng file trong thư mục.
      * **Trích xuất Order ID:** Trích Order ID từ tên file. Ví dụ: file tên `12345_a.jpg` sẽ cho ra Order ID là `12345`.
3.  **Tải lên Cloudinary:**
      * Sử dụng `cloudinary.uploader.upload()` để tải file.
      * Đảm bảo cấu hình Cloudinary để nhận `secure_url`.
4.  **Ghi vào Supabase:**
      * Sử dụng Supabase SDK để chèn dữ liệu vào bảng `order_images`.
      * **Data Insert:** Ghi **`order_id`**, **`cloudinary_url`**, **`public_id`**, và **`file_name`** vào Supabase.
5.  **Quản lý File & Báo cáo:**
      * Sau khi ghi vào Supabase thành công, di chuyển file gốc sang thư mục lưu trữ (`/processed`).
      * Ghi log chi tiết về các file thành công và thất bại.

-----

## IV. 🔍 Tool Tìm kiếm và Tải về (React App)

Đây là giao diện nhân viên sử dụng.

### 1\. Công nghệ

  * **Frontend:** React, Next.js, hoặc framework frontend tương đương.
  * **Database Client:** `@supabase/supabase-js` SDK.

### 2\. Logic Tìm kiếm (Frontend)

1.  **Nhập Order ID:** Nhân viên nhập Order ID vào ô tìm kiếm.
2.  **Gọi API Supabase:** Ứng dụng React thực hiện truy vấn **Filter** tới Supabase:
    ```javascript
    supabase
      .from('order_images')
      .select('cloudinary_url, file_name, uploaded_at')
      .eq('order_id', orderIdInput)
    ```
3.  **Hiển thị Kết quả:**
      * Nếu tìm thấy, hiển thị danh sách các file liên quan đến Order ID đó.
      * Mỗi mục hiển thị: Tên File (`file_name`) và Ngày Upload (`uploaded_at`).
4.  **Chức năng Tải về:**
      * Tạo một nút/link **"Tải về"** cho mỗi file.
      * Link tải về trỏ trực tiếp đến trường **`cloudinary_url`**. Trình duyệt sẽ tự động xử lý việc tải file về máy tính của nhân viên.