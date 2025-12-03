import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import config from './config.js';
import {
  getImageFiles,
  extractOrderId,
  moveFile,
  ensureDirectoryExists,
  formatFileSize,
  retry,
} from './utils.js';

// Initialize Supabase client
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

// Statistics
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  errors: [],
};

/**
 * Upload file lên Cloudinary
 */
async function uploadToCloudinary(filePath, orderId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: `order_images/${orderId}`,
        resource_type: 'image',
        overwrite: false,
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
}

/**
 * Kiểm tra xem Order ID đã tồn tại trong DB chưa
 */
async function checkDuplicate(orderId, fileName) {
  const { data, error } = await supabase
    .from('order_images')
    .select('id')
    .eq('order_id', orderId)
    .limit(1);

  if (error) {
    throw error;
  }

  return data && data.length > 0;
}

/**
 * Ghi dữ liệu vào Supabase
 */
async function insertToSupabase(orderId, cloudinaryResult, fileName) {
  const { data, error } = await supabase
    .from('order_images')
    .insert({
      order_id: orderId,
      cloudinary_url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      file_name: fileName,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Xử lý một file
 */
async function processFile(file) {
  const { fileName, filePath } = file;
  
  try {
    // 1. Trích xuất Order ID từ tên file (bỏ extension)
    const orderId = extractOrderId(fileName);
    console.log(`\n📄 Xử lý: ${fileName} (Order ID: ${orderId})`);

    // 2. Kiểm tra duplicate (theo order_id)
    const isDuplicate = await retry(() => checkDuplicate(orderId, fileName));
    if (isDuplicate) {
      console.log(`   ⏭️  Order ID ${orderId} đã tồn tại trong database, bỏ qua...`);
      stats.skipped++;
      // Vẫn di chuyển file để tránh xử lý lại
      await moveFile(filePath, config.paths.processedDir, fileName);
      return;
    }

    // 3. Upload lên Cloudinary (với retry)
    console.log(`   ☁️  Đang upload lên Cloudinary...`);
    const cloudinaryResult = await retry(() =>
      uploadToCloudinary(filePath, orderId)
    );
    console.log(`   ✅ Upload thành công: ${cloudinaryResult.secure_url}`);

    // 4. Ghi vào Supabase (với retry)
    console.log(`   💾 Đang ghi vào Supabase...`);
    const dbRecord = await retry(() =>
      insertToSupabase(orderId, cloudinaryResult, fileName)
    );
    console.log(`   ✅ Đã ghi vào DB (ID: ${dbRecord.id})`);

    // 5. Di chuyển file sang thư mục processed
    await moveFile(filePath, config.paths.processedDir, fileName);
    console.log(`   📦 Đã di chuyển file sang thư mục processed`);

    stats.success++;
  } catch (error) {
    console.error(`   ❌ Lỗi: ${error.message}`);
    stats.failed++;
    stats.errors.push({
      fileName,
      error: error.message,
    });

    // Di chuyển file lỗi sang thư mục errors
    try {
      await moveFile(filePath, config.paths.errorDir, fileName);
      console.log(`   📁 Đã di chuyển file lỗi sang thư mục errors`);
    } catch (moveError) {
      console.error(`   ⚠️  Không thể di chuyển file lỗi: ${moveError.message}`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Bắt đầu batch upload script...\n');
  console.log('📋 Cấu hình:');
  console.log(`   - Upload dir: ${config.paths.uploadDir}`);
  console.log(`   - Processed dir: ${config.paths.processedDir}`);
  console.log(`   - Error dir: ${config.paths.errorDir}`);
  console.log(`   - Cloudinary: ${config.cloudinary.cloudName}`);
  console.log(`   - Supabase: ${config.supabase.url}\n`);

  try {
    // Đảm bảo các thư mục tồn tại
    await ensureDirectoryExists(config.paths.uploadDir);
    await ensureDirectoryExists(config.paths.processedDir);
    await ensureDirectoryExists(config.paths.errorDir);

    // Lấy danh sách file ảnh
    console.log('🔍 Đang quét thư mục upload...');
    console.log(`   📁 Đường dẫn: ${config.paths.uploadDir}`);
    
    const imageFiles = await getImageFiles(config.paths.uploadDir);
    
    if (imageFiles.length === 0) {
      console.log('\n⚠️  Không tìm thấy file ảnh nào trong thư mục upload.');
      console.log('\n💡 Hướng dẫn:');
      console.log('   1. Đảm bảo thư mục uploads/ tồn tại ở root của project');
      console.log('   2. Đặt file ảnh vào thư mục uploads/');
      console.log('   3. Tên file phải có format: {ORDER_ID}.{ext}');
      console.log('      Ví dụ: 12345.jpg, 67890.png');
      console.log(`   4. Đường dẫn hiện tại: ${config.paths.uploadDir}`);
      return;
    }

    stats.total = imageFiles.length;
    console.log(`📊 Tìm thấy ${stats.total} file(s)\n`);

    // Xử lý từng file (tuần tự để tránh quá tải)
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      console.log(`\n[${i + 1}/${stats.total}]`);
      await processFile(file);
    }

    // In kết quả tổng kết
    console.log('\n' + '='.repeat(50));
    console.log('📊 KẾT QUẢ TỔNG KẾT');
    console.log('='.repeat(50));
    console.log(`✅ Thành công: ${stats.success}`);
    console.log(`⏭️  Đã bỏ qua: ${stats.skipped}`);
    console.log(`❌ Thất bại: ${stats.failed}`);
    console.log(`📊 Tổng cộng: ${stats.total}`);

    if (stats.errors.length > 0) {
      console.log('\n❌ Chi tiết lỗi:');
      stats.errors.forEach((err, index) => {
        console.log(`   ${index + 1}. ${err.fileName}: ${err.error}`);
      });
    }

    console.log('\n✨ Hoàn thành!\n');
  } catch (error) {
    console.error('\n❌ Lỗi nghiêm trọng:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Chạy script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

