import { readdir, stat, rename, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';

/**
 * Trích xuất Order ID từ tên file
 * Format: {ORDER_ID}.{ext}
 * Ví dụ: "12345.jpg" -> "12345"
 * Lấy tên file (bỏ extension) làm Order ID
 */
export function extractOrderId(fileName) {
  const nameWithoutExt = basename(fileName, extname(fileName));
  const orderId = nameWithoutExt.trim();
  
  if (!orderId || orderId.length === 0) {
    throw new Error(`Order ID rỗng từ file: ${fileName}`);
  }
  
  return orderId;
}

/**
 * Lấy danh sách file ảnh từ thư mục
 */
export async function getImageFiles(directory) {
  try {
    const files = await readdir(directory);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    
    const imageFiles = [];
    const allFiles = [];
    
    for (const file of files) {
      const filePath = join(directory, file);
      const stats = await stat(filePath);
      
      if (stats.isFile()) {
        allFiles.push(file);
        const ext = extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          imageFiles.push({
            fileName: file,
            filePath: filePath,
            size: stats.size,
          });
        }
      }
    }
    
    // Debug: Hiển thị tất cả file tìm thấy
    if (allFiles.length > 0 && imageFiles.length === 0) {
      console.log(`   ℹ️  Tìm thấy ${allFiles.length} file(s) nhưng không có file ảnh hợp lệ:`);
      allFiles.forEach(file => {
        const ext = extname(file).toLowerCase();
        console.log(`      - ${file} ${imageExtensions.includes(ext) ? '✅' : '❌ (extension không hợp lệ)'}`);
      });
      console.log(`   💡 Các extension hợp lệ: ${imageExtensions.join(', ')}`);
    }
    
    return imageFiles;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Thư mục không tồn tại: ${directory}\n   Vui lòng tạo thư mục uploads/ ở root của project.`);
    }
    throw error;
  }
}

/**
 * Đảm bảo thư mục tồn tại, nếu không thì tạo mới
 */
export async function ensureDirectoryExists(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Di chuyển file sang thư mục khác
 */
export async function moveFile(sourcePath, destDir, fileName) {
  await ensureDirectoryExists(destDir);
  const destPath = join(destDir, fileName);
  await rename(sourcePath, destPath);
  return destPath;
}

/**
 * Format file size thành human-readable
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Retry function với exponential backoff
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const waitTime = delay * Math.pow(2, i);
      console.log(`   ⚠️  Retry ${i + 1}/${maxRetries} sau ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

