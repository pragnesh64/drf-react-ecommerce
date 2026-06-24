import React, { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";

function PasswordInput({ value, onChange, placeholder = "Enter Password", controlId, label, errorMessage }) {
  const [show, setShow] = useState(false);

  return (
    <Form.Group controlId={controlId} className="my-2">
      {label && <Form.Label>{label}</Form.Label>}
      <InputGroup>
        <Form.Control
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <Button
          variant="outline-secondary"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          style={{ borderLeft: "none" }}
        >
          <i className={`fas ${show ? "fa-eye-slash" : "fa-eye"}`}></i>
        </Button>
      </InputGroup>
      {errorMessage && (
        <Form.Text className="text-danger small">{errorMessage}</Form.Text>
      )}
    </Form.Group>
  );
}

export default PasswordInput;
