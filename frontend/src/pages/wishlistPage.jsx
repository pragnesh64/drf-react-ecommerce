import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import httpService from "../services/httpService";
import UserContext from "../context/userContext";
import CartContext from "../context/cartContext";
import Loader from "../components/loader";
import Message from "../components/message";

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { userInfo, logout } = useContext(UserContext);
  const { addItemToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) { navigate("/login"); return; }
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data } = await httpService.get("/api/wishlist/");
      setWishlist(data);
    } catch (ex) {
      if (ex.response?.status === 403) logout();
      setError("Could not load wishlist.");
    }
    setLoading(false);
  };

  const removeFromWishlist = async (id) => {
    try {
      await httpService.delete(`/api/wishlist/${id}/`);
      setWishlist(wishlist.filter((item) => item.id !== id));
    } catch (ex) {
      setError("Could not remove item.");
    }
  };

  const handleAddToCart = (productId) => {
    addItemToCart(productId, 1);
    navigate("/cart");
  };

  return (
    <div>
      <h2><i className="fas fa-heart me-2 text-danger"></i>My Wishlist</h2>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : wishlist.length === 0 ? (
        <Message variant="info">
          Your wishlist is empty. <Link to="/">Browse products</Link>
        </Message>
      ) : (
        <Row>
          {wishlist.map((item) => (
            <Col key={item.id} sm={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Link to={`/products/${item.product.id}`}>
                  <Card.Img
                    variant="top"
                    src={item.product.image}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                </Link>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6">
                    <Link to={`/products/${item.product.id}`} className="text-decoration-none text-dark">
                      {item.product.name}
                    </Link>
                  </Card.Title>
                  <Card.Text className="text-success fw-bold mb-auto">
                    ₹{item.product.price}
                  </Card.Text>
                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="dark"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() => handleAddToCart(item.product.id)}
                      disabled={item.product.countInStock === 0}
                    >
                      <i className="fas fa-cart-plus me-1"></i>
                      {item.product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default WishlistPage;
