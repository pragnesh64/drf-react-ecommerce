import React, { useContext, useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import Product from "../components/product";
import ProductsContext from "../context/productsContext";
import Loader from "../components/loader";
import Message from "../components/message";
import BrandCard from "../components/brandCard";
import CategoryCard from "../components/categoryCard";
import ProductsCarousel from "../components/productsCarousel";

function HomePage() {
  const { error, products, loadProducts, brands, categories } = useContext(ProductsContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      await loadProducts();
      setLoading(false);
    };
    fetchProducts();
  }, []);

  if (loading) return <Loader />;

  if (error !== "")
    return <Message variant="danger"><h4>{error}</h4></Message>;

  let popularProducts = [...products];
  popularProducts.sort((a, b) => b.numReviews - a.numReviews);
  popularProducts = popularProducts.slice(0, 8);

  return (
    <div>
      <ProductsCarousel products={products} />

      <div className="my-4">
        <h2 className="section-heading">
          <i className="fas fa-fire me-2" style={{ color: "var(--secondary)" }}></i>
          Popular Products
        </h2>
        <Row>
          {popularProducts.map((product) => (
            <Col key={product.id} sm={12} md={6} lg={4} xl={3} className="mb-3">
              <Product product={product} />
            </Col>
          ))}
        </Row>
      </div>

      {brands.length > 0 && (
        <div className="my-4 py-4" style={{ background: "var(--bg-section)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
          <h2 className="section-heading ms-2">
            <i className="fas fa-trademark me-2" style={{ color: "var(--primary)" }}></i>
            Brands
          </h2>
          <Row className="mt-2">
            {brands.map((brand) => (
              <Col key={brand.id} xs={6} md={4} lg={3} xl={2} className="mb-3">
                <BrandCard brand={brand} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {categories.length > 0 && (
        <div className="my-4">
          <h2 className="section-heading">
            <i className="fas fa-layer-group me-2" style={{ color: "var(--primary)" }}></i>
            Categories
          </h2>
          <Row className="mt-2">
            {categories.map((category) => (
              <Col key={category.id} xs={6} md={4} lg={3} xl={2} className="mb-3">
                <CategoryCard category={category} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}

export default HomePage;
