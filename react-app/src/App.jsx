import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ImageList from './components/ImageList';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const handleSearch = async (orderId) => {
    if (!orderId || orderId.trim() === '') {
      setError('Vui lòng nhập Order ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);
    setImages([]);

    try {
      const { supabase } = await import('./config');
      
      const { data, error: queryError } = await supabase
        .from('order_images')
        .select('cloudinary_url, file_name, uploaded_at, id')
        .eq('order_id', orderId.trim())
        .order('uploaded_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      if (!data || data.length === 0) {
        setError(`Không tìm thấy hình ảnh nào cho Order ID: ${orderId}`);
        setImages([]);
        setCurrentOrderId(null);
      } else {
        setImages(data);
        setError(null);
        setCurrentOrderId(orderId.trim());
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="search-section">
        <header className="app-header">
          <h1>Walltik Order Image</h1>
        </header>
        <p className="search-label">Search by Order ID</p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tìm kiếm...</p>
        </div>
      )}

      {!loading && images.length > 0 && (
        <div className="results-container">
          <div className="results-panel">
            <h2 className="results-title">Results</h2>
            <h3 className="order-id-heading">Order ID: #{currentOrderId}</h3>
            <ImageList images={images} orderId={currentOrderId} />
            <p className="results-summary">
              Found {images.length} image{images.length !== 1 ? 's' : ''} for Order ID #{currentOrderId}.
            </p>
          </div>
        </div>
      )}

      {!loading && searchPerformed && images.length === 0 && !error && (
        <div className="results-container">
          <div className="results-panel">
            <h2 className="results-title">Results</h2>
            <p className="no-results-message">
              No images found for Order ID. Please try again.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="results-container">
          <div className="results-panel">
            <h2 className="results-title">Results</h2>
            <p className="no-results-message">
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

