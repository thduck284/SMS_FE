import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:3000';

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const OrderHistory = () => {
  const { accessToken } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${accessToken}` } });
        setOrders(res.data.orders || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [accessToken]);

  if (loading) return <div style={{ padding: 24 }}>Đang tải...</div>;
  if (!orders.length) return <div style={{ padding: 24 }}>Bạn chưa có đơn hàng nào.</div>;

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', background: '#fff', padding: 24, borderRadius: 8 }}>
      <h2>Lịch sử đơn hàng</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {orders.map(order => (
          <li key={order._id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <div>Mã đơn hàng: <b>{order._id}</b></div>
            <div>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</div>
            <div>Tổng tiền: {formatCurrency(order.total)}</div>
            <Link to={`/orders/${order._id}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>Xem chi tiết</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderHistory;
