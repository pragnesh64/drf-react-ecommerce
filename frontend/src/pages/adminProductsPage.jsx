import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Table, Button, Modal, Form, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import httpService from "../services/httpService";
import UserContext from "../context/userContext";
import Loader from "../components/loader";
import Message from "../components/message";

const emptyForm = {
  name: "", description: "", price: "", countInStock: "",
  brand: "", category: "",
};

function AdminProductsPage() {
  const { userInfo, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) { navigate("/"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, b, c] = await Promise.all([
        httpService.get("/api/products/"),
        httpService.get("/api/brands/"),
        httpService.get("/api/category/"),
      ]);
      setProducts(p.data.sort((x, y) => y.id - x.id));
      setBrands(b.data.sort((x, y) => y.id - x.id));
      setCategories(c.data.sort((x, y) => y.id - x.id));
    } catch (ex) {
      if (ex.response?.status === 403) logout();
      setError("Could not load data.");
    }
    setLoading(false);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      countInStock: product.countInStock || "",
      brand: product.brand || "",
      category: product.category || "",
    });
    setFormError("");
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    let errors = {};
    if (!form.name) errors.name = ["Name is required."];
    if (!form.price) errors.price = ["Price is required."];
    if (!form.brand) errors.brand = ["Brand is required."];
    if (!form.category) errors.category = ["Category is required."];
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    setFormError("");
    setFormErrors({});
    try {
      if (editingId) {
        const { data } = await httpService.put(`/api/products/${editingId}/`, form);
        setProducts(products.map((p) => (p.id === editingId ? data : p)));
      } else {
        const { data } = await httpService.post("/api/products/", form);
        setProducts([data, ...products]);
      }
      setShowModal(false);
    } catch (ex) {
      if (ex.response?.status === 400 && ex.response.data) {
        setFormErrors(ex.response.data);
      } else {
        setFormError("Failed to save product.");
      }
    }
    setSaving(false);
  };

  const confirmDelete = (product) => {
    setDeleteTarget(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await httpService.delete(`/api/products/${deleteTarget.id}/`);
      setProducts(products.filter((p) => p.id !== deleteTarget.id));
    } catch {
      setError("Could not delete product.");
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col>
          <h2><i className="fas fa-box me-2"></i>Manage Products</h2>
        </Col>
        <Col className="text-end">
          <Button variant="dark" onClick={openAdd}>
            <i className="fas fa-plus me-2"></i>Add Product
          </Button>
        </Col>
      </Row>

      <Table responsive hover className="table-sm shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, index) => (
            <tr key={p.id}>
              <td>{index + 1}</td>
              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>
                <Badge bg={p.countInStock > 0 ? "success" : "danger"}>
                  {p.countInStock > 0 ? p.countInStock : "Out of Stock"}
                </Badge>
              </td>
              <td>{categories.find((c) => c.id === p.category)?.title || p.category}</td>
              <td>{brands.find((b) => b.id === p.brand)?.title || p.brand}</td>
              <td>
                <Button size="sm" variant="link" className="text-primary p-0 me-3" onClick={() => openEdit(p)}>
                  <i className="fas fa-edit fs-5"></i>
                </Button>
                <Button size="sm" variant="link" className="text-danger p-0" onClick={() => confirmDelete(p)}>
                  <i className="fas fa-trash fs-5"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>{editingId ? "Edit Product" : "Add New Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Message variant="danger">{formError}</Message>}
          {formErrors.non_field_errors && <Message variant="danger">{formErrors.non_field_errors[0]}</Message>}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Product Name *</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Samsung Galaxy S23"
                  isInvalid={!!formErrors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.name && formErrors.name[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Price (₹) *</Form.Label>
                <Form.Control
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 29999"
                  isInvalid={!!formErrors.price}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.price && formErrors.price[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Stock Qty *</Form.Label>
                <Form.Control
                  type="number"
                  value={form.countInStock}
                  onChange={(e) => setForm({ ...form, countInStock: e.target.value })}
                  placeholder="e.g. 10"
                  isInvalid={!!formErrors.countInStock}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.countInStock && formErrors.countInStock[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Brand *</Form.Label>
                <Form.Select
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  isInvalid={!!formErrors.brand}
                >
                  <option value="">-- Select Brand --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.brand && formErrors.brand[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  isInvalid={!!formErrors.category}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.category && formErrors.category[0]}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description..."
              isInvalid={!!formErrors.description}
            />
            <Form.Control.Feedback type="invalid">
              {formErrors.description && formErrors.description[0]}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="dark" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>
            <i className="fas fa-trash me-2"></i>Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminProductsPage;
