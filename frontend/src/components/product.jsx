import React from "react";
import Rating from "./rating";
import { Link } from "react-router-dom";

function Product({ product }) {
  return (
    <div className="product-card my-3">
      <Link to={`/products/${product.id}`} onClick={() => window.scrollTo(0, 0)}>
        <div className="card-img-wrap">
          <img src={product.image} alt={product.name} />
        </div>
      </Link>
      <div className="card-body">
        <Link
          to={`/products/${product.id}`}
          className="text-decoration-none"
          onClick={() => window.scrollTo(0, 0)}
        >
          <div className="card-title">{product.name}</div>
        </Link>
        <div className="my-2">
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
            color={"#f59e0b"}
          />
        </div>
        <div className="price-tag">₹{product.price}</div>
      </div>
    </div>
  );
}

export default Product;
