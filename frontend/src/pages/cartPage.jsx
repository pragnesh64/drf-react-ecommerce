import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Row, Col, ListGroup, Image, Form, Button, Card, InputGroup, Badge } from "react-bootstrap";
import Message from "../components/message";
import CartContext from "../context/cartContext";

function CartPage() {
  const {
    error, productsInCart, updateItemQty, removeFromCart,
    totalItemsPrice, discountAmount, shippingPrice, taxPrice, totalPrice,
    coupon, couponError, applyCoupon, removeCoupon,
  } = useContext(CartContext);

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);

  const handleCheckOut = () => navigate("/login?redirect=shipping");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    await applyCoupon(couponCode);
    setApplying(false);
  };

  if (error !== "")
    return <Message variant="danger"><h4>{error}</h4></Message>;

  return (
    <Row>
      <Col md={8}>
        <h1>Shopping Cart</h1>
        {productsInCart.length === 0 ? (
          <Message variant="info">Your cart is empty <Link to="/">Go Back</Link></Message>
        ) : (
          <ListGroup variant="flush">
            {productsInCart.map((product) => (
              <ListGroup.Item key={product.id}>
                <Row className="align-items-center">
                  <Col md={2}>
                    <Image src={product.image} alt={product.name} fluid rounded />
                  </Col>
                  <Col xs={9} md={3}>
                    <Link to={`/products/${product.id}`} className="text-decoration-none">
                      {product.name}
                    </Link>
                  </Col>
                  <Col xs={3} md={2}>₹{product.price}</Col>
                  <Col xs={6} md={3}>
                    <Form.Select
                      value={product.qty}
                      onChange={(e) => updateItemQty(product.id, Number(e.currentTarget.value))}
                    >
                      {[...Array(product.countInStock <= 10 ? product.countInStock : 10).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col className="ms-auto" xs={2}>
                    <Button type="button" variant="light" onClick={() => removeFromCart(product.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>

      <Col md={4}>
        <Card>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>
                Subtotal ({productsInCart.reduce((acc, p) => acc + p.qty, 0)} items)
              </h2>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row><Col>Items Price</Col><Col>₹{totalItemsPrice}</Col></Row>
            </ListGroup.Item>

            {coupon && (
              <ListGroup.Item className="text-success">
                <Row>
                  <Col>Discount ({coupon.discount}%) <Badge bg="success">{coupon.code}</Badge></Col>
                  <Col>-₹{discountAmount}</Col>
                </Row>
              </ListGroup.Item>
            )}

            <ListGroup.Item>
              <Row><Col>Shipping</Col><Col>₹{shippingPrice}</Col></Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row><Col>Tax (5%)</Col><Col>₹{taxPrice}</Col></Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row><Col><strong>Total</strong></Col><Col><strong>₹{totalPrice}</strong></Col></Row>
            </ListGroup.Item>

            <ListGroup.Item>
              <p className="mb-1 fw-semibold">Have a coupon?</p>
              <InputGroup>
                <Form.Control
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!coupon}
                />
                {!coupon ? (
                  <Button variant="outline-success" onClick={handleApplyCoupon} disabled={applying}>
                    {applying ? "..." : "Apply"}
                  </Button>
                ) : (
                  <Button variant="outline-danger" onClick={() => { removeCoupon(); setCouponCode(""); }}>
                    Remove
                  </Button>
                )}
              </InputGroup>
              {couponError && <p className="text-danger small mt-1">{couponError}</p>}
              {coupon && <p className="text-success small mt-1">Coupon applied! {coupon.discount}% off.</p>}
            </ListGroup.Item>

            <ListGroup.Item>
              <Row className="px-2">
                <Button
                  type="button"
                  className="btn-block"
                  disabled={productsInCart.length === 0}
                  onClick={handleCheckOut}
                >
                  Proceed to Checkout
                </Button>
              </Row>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  );
}

export default CartPage;
