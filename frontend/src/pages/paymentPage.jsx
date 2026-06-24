import React, { useState, useContext } from "react";
import { Form, Button, Col } from "react-bootstrap";
import FormContainer from "../components/formContainer";
import CheckoutSteps from "../components/checkoutSteps";
import { useNavigate } from "react-router-dom";
import CartContext from "../context/cartContext";

function PaymentPage(props) {
  const { shippingAddress, paymentMethod: method, updatePaymentMethod } = useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState(method || "Cash on Delivery");
  const navigate = useNavigate();

  if (!shippingAddress || !shippingAddress.address) navigate("/shipping");

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePaymentMethod(paymentMethod);
    navigate("/placeorder");
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h2 className="mb-4">Payment Method</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label as="legend" className="mb-3 fw-semibold">
            Select Payment Method
          </Form.Label>
          <Col>
            <Form.Check
              type="radio"
              label="Cash on Delivery (COD)"
              id="cod"
              name="paymentMethod"
              value="Cash on Delivery"
              onChange={(e) => setPaymentMethod(e.currentTarget.value)}
              checked={paymentMethod === "Cash on Delivery"}
              className="mb-2"
            />
            <Form.Check
              type="radio"
              label="UPI / Net Banking"
              id="upi"
              name="paymentMethod"
              value="UPI / Net Banking"
              onChange={(e) => setPaymentMethod(e.currentTarget.value)}
              checked={paymentMethod === "UPI / Net Banking"}
              className="mb-2"
            />
            <Form.Check
              type="radio"
              label="Debit / Credit Card"
              id="card"
              name="paymentMethod"
              value="Debit / Credit Card"
              onChange={(e) => setPaymentMethod(e.currentTarget.value)}
              checked={paymentMethod === "Debit / Credit Card"}
              className="mb-2"
            />
          </Col>
        </Form.Group>
        <Button type="submit" variant="primary">
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
}

export default PaymentPage;
