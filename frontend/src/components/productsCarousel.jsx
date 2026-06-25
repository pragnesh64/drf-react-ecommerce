import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Badge } from 'react-bootstrap';

const GRADIENTS = [
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "linear-gradient(135deg, #0d1b2a 0%, #1b4332 50%, #2d6a4f 100%)",
  "linear-gradient(135deg, #1a0533 0%, #3d0066 50%, #6a0dad 100%)",
  "linear-gradient(135deg, #1a0a00 0%, #7b2d00 50%, #c44b00 100%)",
];

function ProductsCarousel({ products }) {
  let topRatedProducts = [...products];
  topRatedProducts.sort((a, b) => Number(b.rating) - Number(a.rating));
  topRatedProducts = topRatedProducts.slice(0, 4);

  return (
    <Carousel pause="hover" className="hero-carousel mb-4">
      {topRatedProducts.map((product, idx) => (
        <Carousel.Item key={product.id}>
          <Link to={`/products/${product.id}`} style={{ textDecoration: "none" }}>
            <div
              className="hero-slide"
              style={{ background: GRADIENTS[idx % GRADIENTS.length] }}
            >
              {/* Left: Text Content */}
              <div className="hero-text">
                <Badge
                  className="mb-2"
                  style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.06em" }}
                >
                  ⭐ TOP RATED
                </Badge>
                <h2 className="hero-title">{product.name}</h2>
                <p className="hero-desc">
                  {product.description
                    ? product.description.slice(0, 90) + (product.description.length > 90 ? "..." : "")
                    : "Premium quality product at the best price."}
                </p>
                <div className="hero-price">₹{Number(product.price).toLocaleString('en-IN')}</div>
                <div
                  className="hero-btn"
                >
                  Shop Now <i className="fas fa-arrow-right ms-2"></i>
                </div>
              </div>

              {/* Right: Image */}
              <div className="hero-img-wrap">
                <img
                  src={product.image}
                  alt={product.name}
                  className="hero-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="hero-img-fallback" style={{ display: "none" }}>
                  <i className="fas fa-shopping-bag"></i>
                </div>
              </div>
            </div>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default ProductsCarousel;
