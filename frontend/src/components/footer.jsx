import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <footer>
      <Container className="py-5">
        <Row className="mb-4">
          <Col md={4} className="mb-4">
            <h5>
              <i className="fas fa-store me-2" style={{ color: "var(--primary)" }}></i>
              ShopSphere
            </h5>
            <p className="small" style={{ color: "var(--text-muted)", lineHeight: "1.7" }}>
              Your one-stop destination for quality products at the best prices. Shop smart, shop ShopSphere.
            </p>
          </Col>
          <Col md={2} className="mb-4">
            <h6 className="mb-3">Shop</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/">Home</a></li>
              <li className="mb-2"><a href="/cart">Cart</a></li>
              <li className="mb-2"><a href="/wishlist">Wishlist</a></li>
            </ul>
          </Col>

        </Row>
        <hr />
        <Row>
          <Col className="text-center small" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} <strong style={{ color: "var(--primary)" }}>ShopSphere</strong> — MCA Final Year Project. All rights reserved.
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
