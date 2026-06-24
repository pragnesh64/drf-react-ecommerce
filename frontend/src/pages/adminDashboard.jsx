import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Card, Table, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import httpService from "../services/httpService";
import UserContext from "../context/userContext";
import Loader from "../components/loader";
import Message from "../components/message";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function StatCard({ icon, label, value, color }) {
  return (
    <Card className="h-100 shadow-sm border-0" style={{ borderLeft: `4px solid ${color}` }}>
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div>
          <p className="text-muted small mb-1">{label}</p>
          <h3 className="fw-bold mb-0">{value}</h3>
        </div>
        <div style={{ fontSize: "2rem", color, opacity: 0.8 }}>
          <i className={icon}></i>
        </div>
      </Card.Body>
    </Card>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userInfo, logout } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) { navigate("/"); return; }
    const fetchStats = async () => {
      try {
        const { data } = await httpService.get("/api/dashboard/");
        setStats(data);
      } catch (ex) {
        if (ex.response?.status === 403) logout();
        setError("Could not load dashboard data.");
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!stats) return null;

  const barData = {
    labels: stats.recentOrders.map((o) => `#${o.id}`),
    datasets: [{
      label: "Order Total (₹)",
      data: stats.recentOrders.map((o) => o.totalPrice),
      backgroundColor: "rgba(44, 62, 80, 0.7)",
      borderRadius: 6,
    }],
  };

  const doughnutData = {
    labels: ["Paid Orders", "Pending Orders", "Delivered"],
    datasets: [{
      data: [
        stats.totalOrders - stats.pendingOrders,
        stats.pendingOrders,
        stats.deliveredOrders,
      ],
      backgroundColor: ["#27ae60", "#e67e22", "#2980b9"],
    }],
  };

  return (
    <div>
      <h2 className="mb-4">
        <i className="fas fa-tachometer-alt me-2"></i>Admin Dashboard
      </h2>

      <Row className="mb-4 g-3">
        <Col sm={6} lg={3}>
          <StatCard icon="fas fa-users" label="Total Users" value={stats.totalUsers} color="#3498db" />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard icon="fas fa-box" label="Total Products" value={stats.totalProducts} color="#9b59b6" />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard icon="fas fa-shopping-bag" label="Total Orders" value={stats.totalOrders} color="#e67e22" />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard icon="fas fa-rupee-sign" label="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} color="#27ae60" />
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col sm={6} lg={3}>
          <StatCard icon="fas fa-clock" label="Pending Orders" value={stats.pendingOrders} color="#e74c3c" />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard icon="fas fa-truck" label="Delivered" value={stats.deliveredOrders} color="#1abc9c" />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard icon="fas fa-envelope" label="Unread Messages" value={stats.unreadMessages} color="#f39c12" />
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="mb-3">Recent Orders Revenue</h5>
              <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="mb-3">Order Status</h5>
              <Doughnut data={doughnutData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="mb-3">Recent Orders</h5>
          <Table responsive hover>
            <thead className="table-dark">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/orders/${order.id}`} className="text-decoration-none">
                      #{order.id}
                    </Link>
                  </td>
                  <td>{order.user?.username || "N/A"}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>
                    <Badge bg={order.isPaid ? "success" : "warning"}>
                      {order.isPaid ? "Paid" : "Pending"}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={order.isDelivered ? "success" : "secondary"}>
                      {order.isDelivered ? "Delivered" : "Pending"}
                    </Badge>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default AdminDashboard;
