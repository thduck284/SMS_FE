import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../../context/AuthContext'
import './Carts.css'

const API_BASE_URL = 'http://127.0.0.1:3000'

const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  } catch (e) {
    return `${value}₫`
  }
}

const useCart = (accessToken) => {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        setCart([])
      }
    }
  }, [])

  const saveCart = (newCart) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
  }

  const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  })

  const syncWithServer = async (method, endpoint, data = null) => {
    if (!accessToken) return
    try {
      const headers = getApiHeaders()
      if (method === 'delete' || method === 'get') {
        await axios[method](`${API_BASE_URL}${endpoint}`, { headers })
      } else {
        await axios[method](`${API_BASE_URL}${endpoint}`, data, { headers })
      }
    } catch (error) {
      console.error('Server sync error:', error)
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const item = cart.find(item => item.id === productId)
    if (item) {
      const finalQuantity = Math.min(newQuantity, item.stock || 99)
      await syncWithServer('put', '/update', { productId, quantity: finalQuantity })
      
      saveCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: finalQuantity } : item
      ))
    }
  }

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API_BASE_URL}/cart/remove/${productId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      setCart(prevCart => {
        const newCart = prevCart.filter(item => item.id !== productId)
        localStorage.setItem('cart', JSON.stringify(newCart))
        return newCart
      })
    } catch (error) {
      console.error('Remove error:', error)
    }
  }

  const clearCart = async () => {
    await syncWithServer('delete', '/cart/clear')
    saveCart([])
  }

  const syncCartWithServer = async () => {
    if (!accessToken) return
    try {
      const response = await axios.get(`${API_BASE_URL}/cart`, { headers: getApiHeaders() })
      if (response.data?.items) {
        const cartItems = response.data.items.map(item => ({
          id: item.productId,       
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          discountPrice: item.discountPrice,
          discountPercent: item.discountPercent,
          quantity: item.quantity,
          stock: item.availableStock,
          inStock: item.inStock
        }))
        setCart(cartItems)
        localStorage.setItem('cart', JSON.stringify(cartItems))
      }
    } catch (error) {
      console.error('Sync error:', error)
    }
  }

  const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0)

  return {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncCartWithServer,
    getCartTotal,
    getCartCount
  }
}

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return <div className={`notification ${type}`}>{message}</div>
}

// Cart Item Component
const CartItem = ({ item, onQuantityChange, onRemove }) => (
  <div className="cart-item">
    <div className="cart-item-image">
      {item.image ? (
        <img src={item.image} alt={item.name} />
      ) : (
        <div className="no-image">Không có hình ảnh</div>
      )}
    </div>

    <div className="cart-item-info">
      <Link to={`/products/${item.slug}`} className="cart-item-name">
        {item.name}
      </Link>
      {item.category && <div className="cart-item-category">{item.category}</div>}
      <div className="cart-item-price">{formatCurrency(item.price)}</div>
      <div className={`cart-item-stock ${item.inStock ? '' : 'out-of-stock'}`}>
        {item.inStock ? `Còn ${item.stock} sản phẩm` : 'Hết hàng'}
      </div>
    </div>

    <div className="quantity-controls">
      <button
        className="quantity-btn"
        onClick={() => onQuantityChange(item.id, item.quantity - 1)}
        disabled={item.quantity <= 1}
      >
        −
      </button>
      <input
        type="number"
        className="quantity-input"
        value={item.quantity}
        onChange={(e) => onQuantityChange(item.id, e.target.value)}
        min="1"
        max={item.stock}
      />
      <button
        className="quantity-btn"
        onClick={() => onQuantityChange(item.id, item.quantity + 1)}
        disabled={item.quantity >= item.stock}
      >
        +
      </button>
    </div>

    <div className="cart-item-total">
      {formatCurrency(item.price * item.quantity)}
    </div>

    <button
      className="remove-btn"
      onClick={() => onRemove(item.id, item.name)}
      title="Xóa sản phẩm"
    >
      ×
    </button>
  </div>
)

// Main Cart Component
const Cart = () => {
  const { isAuthenticated, accessToken } = useContext(AuthContext)
  const { cart, updateQuantity, removeFromCart, clearCart, syncCartWithServer, getCartTotal, getCartCount } = useCart(accessToken)
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(false)

  console.log('Cart state:', cart)
  console.log('IsAuthenticated:', isAuthenticated)
  console.log('AccessToken:', accessToken)

  useEffect(() => {
    console.log('useEffect triggered:', { isAuthenticated, accessToken })
    if (isAuthenticated && accessToken) {
      syncCartWithServer()
    }
  }, [isAuthenticated, accessToken, syncCartWithServer])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
  }

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = parseInt(newQuantity)
    if (!isNaN(quantity) && quantity >= 0) {
      updateQuantity(productId, quantity)
      if (quantity === 0) showNotification('Đã xóa sản phẩm khỏi giỏ hàng')
    }
  }

  const handleRemoveItem = async (productId, productName) => {
    await removeFromCart(productId)
    showNotification(`Đã xóa ${productName} khỏi giỏ hàng`)
  }

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      clearCart()
      showNotification('Đã xóa toàn bộ giỏ hàng')
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showNotification('Giỏ hàng của bạn đang trống', 'error')
      return
    }

    if (!isAuthenticated) {
      showNotification('Vui lòng đăng nhập để tiếp tục', 'error')
      return
    }

    const outOfStockItems = cart.filter(item => !item.inStock || item.quantity > item.stock)
    if (outOfStockItems.length > 0) {
      showNotification('Một số sản phẩm trong giỏ hàng đã hết hàng hoặc không đủ số lượng', 'error')
      return
    }

    setLoading(true)
    
    try {
      const cartTotal = getCartTotal()
      const shipping = cartTotal > 500000 ? 0 : 30000
      
      const response = await axios.post(
        `${API_BASE_URL}/cart`,
        {
          items: cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total: cartTotal + shipping
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (response.data.success) {
        showNotification('Đơn hàng đã được tạo thành công!')
        clearCart()
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const message = error.response?.status === 401 
        ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' 
        : 'Có lỗi xảy ra khi xử lý đơn hàng'
      showNotification(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const cartTotal = getCartTotal()
  const cartCount = getCartCount()
  const shipping = cartTotal > 500000 ? 0 : 30000
  const finalTotal = cartTotal + shipping

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p>Giỏ hàng của bạn đang trống</p>
          <Link to="/products" className="continue-shopping-btn">
            Tiếp tục mua sắm
          </Link>
        </div>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Giỏ hàng của bạn</h1>
        <div className="cart-summary">
          {cartCount} sản phẩm trong giỏ hàng
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-items-header">Sản phẩm trong giỏ hàng</div>
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        <div className="cart-sidebar">
          <div className="order-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-row">
              <span>Tạm tính ({cartCount} sản phẩm)</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>{shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span>{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          <div className="checkout-section">
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading || cart.some(item => !item.inStock) || !isAuthenticated}
            >
              {loading ? 'Đang xử lý...' : 
               !isAuthenticated ? 'Đăng nhập để thanh toán' : 
               'Tiến hành thanh toán'}
            </button>

            <div className="cart-actions">
              <button className="clear-cart-btn" onClick={handleClearCart}>
                Xóa toàn bộ
              </button>
              <Link to="/products" className="continue-shopping-btn">
                Mua thêm
              </Link>
            </div>

            {!isAuthenticated && (
              <p style={{ fontSize: '14px', color: '#ff6b6b', textAlign: 'center', marginTop: '15px' }}>
                <Link to="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>
                  Đăng nhập
                </Link> để tiếp tục thanh toán
              </p>
            )}

            {shipping > 0 && (
              <p style={{ fontSize: '14px', color: '#6c757d', textAlign: 'center', marginTop: '15px' }}>
                Mua thêm {formatCurrency(500000 - cartTotal)} để được miễn phí vận chuyển
              </p>
            )}
          </div>
        </div>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

export default Cart