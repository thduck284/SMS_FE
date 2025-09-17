import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Products.css'

const API_BASE_URL = 'http://127.0.0.1:3000'

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  } catch (e) {
    return `${value}₫`
  }
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Filter states
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [limit] = useState(12)
  const [cursor, setCursor] = useState(null)

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (err) {
      console.error('Lỗi tải danh mục:', err)
    }
  }, [])

  // Fetch products
  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        sort: sortField,
        order: sortOrder
      })
      
      // Only add search if it's not empty
      if (search.trim()) {
        params.append('search', search.trim())
      }
      
      if (!reset && cursor) {
        params.append('cursor', cursor)
      }

      // Use different endpoint based on whether category is selected
      let url
      if (selectedCategory) {
        // Find category slug from categories array
        const category = categories.find(cat => cat._id === selectedCategory)
        console.log('Selected category ID:', selectedCategory)
        console.log('Categories array:', categories)
        console.log('Found category:', category)
        if (category && category.slug) {
          url = `${API_BASE_URL}/products/category/${category.slug}?${params}`
        } else {
          // Fallback to regular products endpoint if category not found
          url = `${API_BASE_URL}/products?${params}`
        }
      } else {
        url = `${API_BASE_URL}/products?${params}`
      }

      console.log('Final URL:', url)

      const res = await fetch(url)
      if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm')
      
      const data = await res.json()
      
      if (reset) {
        setProducts(data.products || [])
      } else {
        setProducts(prev => [...prev, ...(data.products || [])])
      }
      
      setHasMore(data.hasMore || false)
      setCursor(data.nextCursor || null)
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, sortField, sortOrder, limit, cursor])

  // Load more products
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProducts(false)
    }
  }

  // Reset and search
  const handleSearch = () => {
    setCursor(null)
    fetchProducts(true)
  }

  // Reset filters
  const resetFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setSortField('createdAt')
    setSortOrder('desc')
    setCursor(null)
    setIsInitialLoad(true)
    fetchProducts(true).then(() => {
      setIsInitialLoad(false)
    })
  }

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      await fetchCategories()
      await fetchProducts(true)
      setIsInitialLoad(false)
    }
    initializeData()
  }, [])

  // Auto search when filters change (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      setCursor(null)
      fetchProducts(true)
    }
  }, [selectedCategory, search, sortField, sortOrder])

  // Handle search on Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Danh sách sản phẩm</h1>
        
        {/* Search and Filters */}
        <div className="products-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSearch}>Tìm kiếm</button>
          </div>
          
          <div className="filter-row">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortField(field)
                setSortOrder(order)
              }}
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="createdAt-asc">Cũ nhất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
            </select>
            
            <button onClick={handleSearch} className="apply-btn">
              Áp dụng
            </button>
            
            <button onClick={resetFilters} className="reset-btn">
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {error && <div className="error-message">{error}</div>}
      
      {products.length === 0 && !loading ? (
        <div className="no-products">
          <p>Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <Link to={`/products/${product.slug}`} className="product-link">
                <div className="product-image">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <div className="no-image">Không có hình ảnh</div>
                  )}
                  {!product.inStock && (
                    <div className="out-of-stock">Hết hàng</div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">
                    {formatCurrency(product.price)}
                  </div>
                  {product.category && (
                    <div className="product-category">
                      {product.category.name}
                    </div>
                  )}
                  <div className={`product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="load-more">
          <button 
            onClick={loadMore} 
            disabled={loading}
            className="load-more-btn"
          >
            {loading ? 'Đang tải...' : 'Tải thêm'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Products

