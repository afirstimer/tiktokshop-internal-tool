import { existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const uploadDir = join(rootDir, 'uploads');

console.log('🔍 Kiểm tra thư mục uploads...\n');
console.log(`📁 Đường dẫn: ${uploadDir}`);
console.log(`   Tồn tại: ${existsSync(uploadDir) ? '✅ Có' : '❌ Không'}\n`);

if (!existsSync(uploadDir)) {
  console.log('⚠️  Thư mục uploads/ chưa tồn tại!');
  console.log('\n💡 Giải pháp:');
  console.log('   Tạo thư mục uploads/ ở root của project:');
  console.log(`   mkdir "${uploadDir}"`);
  console.log('   Hoặc dùng File Explorer để tạo thư mục.');
  process.exit(1);
}

try {
  const files = readdirSync(uploadDir);
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  
  console.log(`📊 Tổng số file trong thư mục: ${files.length}\n`);
  
  if (files.length === 0) {
    console.log('⚠️  Thư mục uploads/ rỗng!');
    console.log('\n💡 Hướng dẫn:');
    console.log('   1. Đặt file ảnh vào thư mục uploads/');
    console.log('   2. Tên file phải có format: {ORDER_ID}.{ext}');
    console.log('      Ví dụ: 12345.jpg, 67890.png');
    process.exit(0);
  }
  
  console.log('📋 Danh sách file:\n');
  
  let imageCount = 0;
  let invalidCount = 0;
  
  files.forEach((file, index) => {
    const filePath = join(uploadDir, file);
    const stats = statSync(filePath);
    
    if (stats.isFile()) {
      const ext = extname(file).toLowerCase();
      const isValidImage = imageExtensions.includes(ext);
      
      if (isValidImage) {
        imageCount++;
        const orderId = file.replace(ext, '');
        console.log(`   ${index + 1}. ✅ ${file}`);
        console.log(`      Order ID: ${orderId}`);
        console.log(`      Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
      } else {
        invalidCount++;
        console.log(`   ${index + 1}. ❌ ${file} (extension không hợp lệ: ${ext || 'không có'})`);
        console.log(`      Các extension hợp lệ: ${imageExtensions.join(', ')}\n`);
      }
    } else if (stats.isDirectory()) {
      console.log(`   ${index + 1}. 📁 ${file} (thư mục, bỏ qua)\n`);
    }
  });
  
  console.log('='.repeat(50));
  console.log(`✅ File ảnh hợp lệ: ${imageCount}`);
  console.log(`❌ File không hợp lệ: ${invalidCount}`);
  console.log('='.repeat(50));
  
  if (imageCount === 0) {
    console.log('\n⚠️  Không có file ảnh hợp lệ nào để upload!');
    console.log('\n💡 Hướng dẫn:');
    console.log('   1. Đảm bảo file có extension hợp lệ: .jpg, .jpeg, .png, .gif, .webp, .bmp');
    console.log('   2. Tên file phải có format: {ORDER_ID}.{ext}');
    console.log('      Ví dụ: 12345.jpg, 67890.png');
  } else {
    console.log(`\n✅ Sẵn sàng upload ${imageCount} file(s)!`);
    console.log('   Chạy: npm run upload');
  }
  
} catch (error) {
  console.error('❌ Lỗi khi đọc thư mục:', error.message);
  process.exit(1);
}

