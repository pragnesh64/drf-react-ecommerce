import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Row, Col, Image, ListGroup, Button, Card, Form, Toast, ToastContainer,
} from "react-bootstrap";
import Rating from "../components/rating";
import ProductsContext from "../context/productsContext";
import Loader from "../components/loader";
import Message from "../components/message";
import CartContext from "../context/cartContext";
import ReviewsList from "../components/reviewsList";
import UserContext from "../context/userContext";
import httpService from "../services/httpService";

function ProductPage() {
  const { id } = useParams();
  const { error, loadProduct } = useContext(ProductsContext);
  const { addItemToCart } = useContext(CartContext);
  const { userInfo } = useContext(UserContext);
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setProduct(await loadProduct(id));
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (userInfo) {
      httpService.get("/api/wishlist/").then(({ data }) => {
        setWishlistIds(data.map((item) => item.product.id));
      }).catch(() => {});
    }
  }, [userInfo]);

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const addToCartHandler = () => {
    addItemToCart(Number(id), Number(qty));
    navigate("/cart");
  };

  const handleWishlist = async () => {
    if (!userInfo) { navigate("/login"); return; }
    setWishlistLoading(true);

    const isInWishlist = wishlistIds.includes(product.id);

    if (isInWishlist) {
      try {
        const { data } = await httpService.get("/api/wishlist/");
        const item = data.find((w) => w.product.id === product.id);
        if (item) {
          await httpService.delete(`/api/wishlist/${item.id}/`);
          setWishlistIds(wishlistIds.filter((wid) => wid !== product.id));
          showToast("Removed from wishlist.", "warning");
        }
      } catch {
        showToast("Could not remove from wishlist.", "danger");
      }
    } else {
      try {
        await httpService.post("/api/wishlist/", { product_id: product.id });
        setWishlistIds([...wishlistIds, product.id]);
        showToast("Added to wishlist!");
      } catch {
        showToast("Could not add to wishlist.", "danger");
      }
    }
    setWishlistLoading(false);
  };

  if (loading) return <Loader />;

  if (error !== "")
    return <Message variant="danger"><h4>{error}</h4></Message>;

  if (product && product.id)
    return (
      <div>
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
          <Toast show={toast.show} bg={toast.variant} onClose={() => setToast((t) => ({ ...t, show: false }))}>
            <Toast.Body className="text-white fw-semibold">
              {toast.variant === "success" && <i className="fas fa-heart me-2"></i>}
              {toast.variant === "warning" && <i className="fas fa-heart-broken me-2"></i>}
              {toast.message}
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <Link to="/" className="btn btn-light my-3">Go back</Link>

        <Row>
          <Col md={6}>
            <Image src={product.image} alt={product.name} fluid />
          </Col>
          <Col md={6} lg={3}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h3>{product.name}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating
                  value={product.rating}
                  text={`${product.numReviews} reviews`}
                  color={"#f8e825"}
                />
              </ListGroup.Item>
              <ListGroup.Item>
                Description: {product.description}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={12} lg={3}>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col><strong>₹{product.price}</strong></Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status</Col>
                    <Col>{product.countInStock > 0 ? "In Stock" : "Out of Stock"}</Col>
                  </Row>
                </ListGroup.Item>
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Quantity</Col>
                      <Col xs="auto" className="my-1">
                        <Form.Select
                          value={qty}
                          onChange={({ currentTarget }) => setQty(currentTarget.value)}
                        >
                          {[...Array(product.countInStock <= 10 ? product.countInStock : 10).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <Row className="px-2">
                    <Button
                      onClick={addToCartHandler}
                      className="btn-block mb-2"
                      disabled={product.countInStock === 0}
                      type="button"
                      variant="dark"
                    >
                      <i className="fas fa-cart-plus me-2"></i>Add to Cart
                    </Button>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row className="px-2">
                    <Button
                      onClick={handleWishlist}
                      className="btn-block"
                      type="button"
                      disabled={wishlistLoading}
                      variant={wishlistIds.includes(product.id) ? "danger" : "outline-danger"}
                    >
                      <i className={`fas fa-heart me-2`}></i>
                      {wishlistLoading
                        ? "..."
                        : wishlistIds.includes(product.id)
                        ? "Remove from Wishlist"
                        : "Add to Wishlist"}
                    </Button>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>

        <Row className="my-3">
          <Col md={6}>
            <ReviewsList product={product} />
          </Col>
        </Row>
      </div>
    );

  return <h4>No such product found.</h4>;
}

export default ProductPage;
