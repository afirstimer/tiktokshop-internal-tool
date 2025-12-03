import { useState } from 'react';
import './SearchBar.css';

function SearchBar({ onSearch, loading }) {
  const [orderId, setOrderId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading) {
      onSearch(orderId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Enter by Order ID..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading || !orderId.trim()}
        >
          {loading ? (
            <>
              <span className="button-spinner"></span>
              Searching...
            </>
          ) : (
            <>
              <span className="search-icon">🔍</span>
              Search
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default SearchBar;

