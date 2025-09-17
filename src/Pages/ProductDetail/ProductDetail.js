import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import './ProductDetail.css'

const API_BASE_URL = 'http://127.0.0.1:3000/products'

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  } catch (e) {
    return `${value}₫`
  }
}

const ProductDetail = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_BASE_URL}/${slug}`)
        if (!res.ok) throw new Error('Không lấy được dữ liệu sản phẩm')
        const data = await res.json()
        if (isMounted) setProduct(data)
      } catch (err) {
        if (isMounted) setError(err.message || 'Có lỗi xảy ra')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [slug])

  const images = useMemo(() => (product?.images && product.images.length > 0 ? product.images : []), [product])

  const handleDecrease = () => {
    setQuantity((q) => (q > 1 ? q - 1 : 1))
  }

  const handleIncrease = () => {
    const max = product?.stock ?? 1
    setQuantity((q) => (q < max ? q + 1 : max))
  }

  if (loading) return <div className='pd-container'><div className='pd-skeleton'>Đang tải...</div></div>
  if (error) return <div className='pd-container'><div className='pd-error'>{error}</div></div>
  if (!product) return null

  return (
    <div className='pd-container'>
      <div className='pd-grid'>
        <div className='pd-media'>
          <div className='pd-swiper'>
            {images.length > 0 ? (
              <img src={images[activeIndex]} alt={product.name} className='pd-main-image' />
            ) : (
              <div className='pd-no-image'>Không có hình ảnh</div>
            )}
          </div>
          {images.length > 1 && (
            <div className='pd-thumbs'>
              {images.map((src, idx) => (
                <button
                  key={src}
                  className={`pd-thumb ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Xem ảnh ${idx + 1}`}
                >
                  <img src={src} alt={`thumb-${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className='pd-info'>
          <h1 className='pd-name'>{product.name}</h1>
          <div className='pd-price'>{formatCurrency(product.price)}</div>

          <div className='pd-meta'>
            <div className={`pd-stock ${product.inStock ? 'in' : 'out'}`}>
              {product.inStock ? `Còn hàng (${product.stock})` : 'Hết hàng'}
            </div>
            {product.category?.name && (
              <div className='pd-category'>Danh mục: <span>{product.category.name}</span></div>
            )}
          </div>

          {product.description && <p className='pd-desc'>{product.description}</p>}

          <div className='pd-actions'>
            <div className='pd-qty'>
              <button onClick={handleDecrease} aria-label='Giảm'>-</button>
              <input
                type='number'
                min={1}
                max={product.stock || 1}
                value={quantity}
                onChange={(e) => {
                  const val = Number(e.target.value) || 1
                  const max = product.stock || 1
                  if (val < 1) return setQuantity(1)
                  if (val > max) return setQuantity(max)
                  setQuantity(val)
                }}
              />
              <button onClick={handleIncrease} aria-label='Tăng'>+</button>
            </div>

            <button className='pd-add' disabled={!product.inStock}>Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail


