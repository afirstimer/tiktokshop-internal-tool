import { useState } from 'react';
import './ImageCard.css';

function ImageCard({ image }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownload = async () => {
    try {
      // Fetch image as blob để tránh CORS issues
      const response = await fetch(image.cloudinary_url);
      const blob = await response.blob();
      
      // Tạo URL từ blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Tạo link download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = image.file_name;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: mở trong tab mới nếu fetch thất bại
      window.open(image.cloudinary_url, '_blank');
    }
  };

  return (
    <>
      <div className="image-card">
        <div className="image-thumbnail">
          {!imageLoaded && !imageError && (
            <div className="image-loading">
              <div className="spinner-small"></div>
            </div>
          )}
          {imageError ? (
            <div className="image-error">
              <span>⚠️</span>
            </div>
          ) : (
            <img
              src={image.cloudinary_url}
              alt={image.file_name}
              className={`thumbnail-img ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              onClick={() => setPreviewOpen(true)}
            />
          )}
        </div>

        <div className="image-details">
          <p className="image-filename" title={image.file_name}>
            {image.file_name}
          </p>
        </div>

        <div className="image-actions">
          <button className="download-button" onClick={handleDownload}>
            <span className="download-icon">+</span>
            Download
          </button>
        </div>
      </div>

      {previewOpen && !imageError && (
        <div className="modal-overlay" onClick={() => setPreviewOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setPreviewOpen(false)}
            >
              ✕
            </button>
            <img
              src={image.cloudinary_url}
              alt={image.file_name}
              className="modal-image"
            />
            <div className="modal-info">
              <p className="modal-filename">{image.file_name}</p>
              <p className="modal-date">📅 {formatDate(image.uploaded_at)}</p>
              <button className="modal-download" onClick={handleDownload}>
                ⬇️ Tải về
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImageCard;

