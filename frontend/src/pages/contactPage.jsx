import React, { useState } from "react";
import { Row, Col, Form, Button, Card } from "react-bootstrap";
import httpService from "../services/httpService";
import Message from "../components/message";
import FormContainer from "../components/formContainer";

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await httpService.post("/api/contact/", form);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (ex) {
      setError("Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  return (
    <FormContainer>
      <h2 className="mb-4"><i className="fas fa-envelope me-2"></i>Contact Us</h2>

      {submitted && (
        <Message variant="success">
          <i className="fas fa-check-circle me-2"></i>
          Your message has been sent! We'll get back to you soon.
        </Message>
      )}
      {error && <Message variant="danger">{error}</Message>}

      <Card className="p-4 shadow-sm">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Your Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Subject</Form.Label>
            <Form.Control
              type="text"
              name="subject"
              placeholder="What is this about?"
              value={form.subject}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              name="message"
              rows={5}
              placeholder="Write your message here..."
              value={form.message}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button type="submit" variant="dark" disabled={loading}>
            {loading ? "Sending..." : <><i className="fas fa-paper-plane me-2"></i>Send Message</>}
          </Button>
        </Form>
      </Card>

      <Row className="mt-5">
        <Col md={4} className="text-center mb-3">
          <div className="p-3 bg-light rounded">
            <i className="fas fa-envelope fa-2x mb-2 text-secondary"></i>
            <h6>Email</h6>
            <p className="small text-muted mb-0">support@shopsphere.com</p>
          </div>
        </Col>
        <Col md={4} className="text-center mb-3">
          <div className="p-3 bg-light rounded">
            <i className="fas fa-phone fa-2x mb-2 text-secondary"></i>
            <h6>Phone</h6>
            <p className="small text-muted mb-0">+91 98765 43210</p>
          </div>
        </Col>
        <Col md={4} className="text-center mb-3">
          <div className="p-3 bg-light rounded">
            <i className="fas fa-clock fa-2x mb-2 text-secondary"></i>
            <h6>Hours</h6>
            <p className="small text-muted mb-0">Mon–Sat: 9am – 6pm</p>
          </div>
        </Col>
      </Row>
    </FormContainer>
  );
}

export default ContactPage;
