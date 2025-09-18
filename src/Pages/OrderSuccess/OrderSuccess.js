import React, { useEffect, useState, useContext } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../../context/AuthContext'

const API_BASE_URL = 'http://127.0.0.1:3000'

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

const OrderSuccess = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { orderId } = useParams()
  const { accessToken } = useContext(AuthContext)
  const [order, setOrder] = useState(state?.order || null)
  const [loading, setLoading] = useState(!state?.order)

  useEffect(() => {
    const fetchOrder = async () => {
      if (order) return
      try {
        const res = await axios.get(`${API_BASE_URL}/orders/${orderId}`, { headers: { Authorization: `Bearer ${accessToken}` } })
        setOrder(res.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>
  if (!order) return <div style={{ padding: 24 }}>Không tìm thấy đơn hàng</div>

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', background: '#fff', padding: 24, borderRadius: 8 }}>
      <h1>Thanh toán thành công 🎉</h1>
      <p>Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn sẽ được giao theo địa chỉ sau:</p>
      <div style={{ background: '#f7f7f7', padding: 12, borderRadius: 6, marginBottom: 16 }}>
        <div><b>{order.shippingAddress.fullName}</b> - {order.shippingAddress.phone}</div>
        <div>{order.shippingAddress.street}</div>
      </div>

      <h3>Chi tiết đơn hàng</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {order.items.map(it => (
          <li key={it.productId} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #eee' }}>
            {it.image ? <img src={it.image} alt={it.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 4 }} /> : <div style={{ width: 64, height: 64, background: '#ddd', borderRadius: 4 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{it.name}</div>
              <div>Số lượng: {it.quantity}</div>
            </div>
            <div>{formatCurrency(it.totalDiscountPrice)}</div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <div>Tạm tính: <b>{formatCurrency(order.subtotal)}</b></div>
        <div>Phí vận chuyển: <b>{formatCurrency(order.shippingFee)}</b></div>
        <div style={{ fontSize: 18 }}>Tổng cộng: <b>{formatCurrency(order.total)}</b></div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Link to="/products" className="continue-shopping-btn">Tiếp tục mua sắm</Link>
        <Link to="/carts" className="clear-cart-btn">Xem giỏ hàng</Link>
      </div>
    </div>
  )
}

export default OrderSuccess
