import React, { useContext, useEffect, useState } from "react";
import { Row, Col, Table, Button, Modal, Form, Tabs, Tab, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import httpService from "../services/httpService";
import UserContext from "../context/userContext";
import Loader from "../components/loader";
import Message from "../components/message";

const emptyBrand = { title: "", description: "" };
const emptyCategory = { title: "", description: "" };

function CrudTable({ title, icon, items, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <Row className="align-items-center mb-3">
        <Col><h4><i className={`${icon} me-2`}></i>{title}</h4></Col>
        <Col className="text-end">
          <Button variant="dark" size="sm" onClick={onAdd}>
            <i className="fas fa-plus me-2"></i>Add {title.replace("Manage ", "")}
          </Button>
        </Col>
      </Row>
      {items.length === 0 ? (
        <Message variant="info">No {title} found. Add one above.</Message>
      ) : (
        <Table responsive hover className="table-sm shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Description</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td><strong>{item.title}</strong></td>
                <td className="text-muted small">{item.description || "—"}</td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-2" onClick={() => onEdit(item)}>
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => onDelete(item)}>
                    <i className="fas fa-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function AdminCatalogPage() {
  const { userInfo, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal state
  const [modal, setModal] = useState({ show: false, type: null, editId: null });
  const [form, setForm] = useState({ title: "", description: "" });
  const [formError, setFormError] = useState("");

  // Delete confirm
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, item: null });

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) { navigate("/"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [b, c] = await Promise.all([
        httpService.get("/api/brands/"),
        httpService.get("/api/category/"),
      ]);
      setBrands(b.data);
      setCategories(c.data);
    } catch (ex) {
      if (ex.response?.status === 403) logout();
      setError("Could not load data.");
    }
    setLoading(false);
  };

  const openAdd = (type) => {
    setModal({ show: true, type, editId: null });
    setForm({ title: "", description: "" });
    setFormError("");
  };

  const openEdit = (type, item) => {
    setModal({ show: true, type, editId: item.id });
    setForm({ title: item.title, description: item.description || "" });
    setFormError("");
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError("Title is required."); return; }
    setSaving(true);
    setFormError("");
    const endpoint = modal.type === "brand" ? "/api/brands/" : "/api/category/";
    try {
      if (modal.editId) {
        const { data } = await httpService.put(`${endpoint}${modal.editId}/`, form);
        if (modal.type === "brand") setBrands(brands.map((b) => b.id === modal.editId ? data : b));
        else setCategories(categories.map((c) => c.id === modal.editId ? data : c));
      } else {
        const { data } = await httpService.post(endpoint, form);
        if (modal.type === "brand") setBrands([...brands, data]);
        else setCategories([...categories, data]);
      }
      setModal({ show: false, type: null, editId: null });
    } catch (ex) {
      setFormError(ex.response?.data?.title?.[0] || "Failed to save. Try again.");
    }
    setSaving(false);
  };

  const confirmDelete = (type, item) => setDeleteModal({ show: true, type, item });

  const handleDelete = async () => {
    const endpoint = deleteModal.type === "brand" ? "/api/brands/" : "/api/category/";
    try {
      await httpService.delete(`${endpoint}${deleteModal.item.id}/`);
      if (deleteModal.type === "brand")
        setBrands(brands.filter((b) => b.id !== deleteModal.item.id));
      else
        setCategories(categories.filter((c) => c.id !== deleteModal.item.id));
    } catch {
      setError("Cannot delete — it may be linked to existing products.");
    }
    setDeleteModal({ show: false, type: null, item: null });
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h2 className="mb-4">
        <i className="fas fa-tags me-2"></i>Manage Catalog
      </h2>

      {error && <Message variant="danger">{error}</Message>}

      <Tabs defaultActiveKey="brands" className="mb-4" fill>
        <Tab
          eventKey="brands"
          title={<><i className="fas fa-trademark me-2"></i>Brands <Badge bg="secondary">{brands.length}</Badge></>}
        >
          <CrudTable
            title="Brands"
            icon="fas fa-trademark"
            items={brands}
            onAdd={() => openAdd("brand")}
            onEdit={(item) => openEdit("brand", item)}
            onDelete={(item) => confirmDelete("brand", item)}
          />
        </Tab>
        <Tab
          eventKey="categories"
          title={<><i className="fas fa-layer-group me-2"></i>Categories <Badge bg="secondary">{categories.length}</Badge></>}
        >
          <CrudTable
            title="Categories"
            icon="fas fa-layer-group"
            items={categories}
            onAdd={() => openAdd("category")}
            onEdit={(item) => openEdit("category", item)}
            onDelete={(item) => confirmDelete("category", item)}
          />
        </Tab>
      </Tabs>

      {/* Add / Edit Modal */}
      <Modal show={modal.show} onHide={() => setModal({ show: false, type: null, editId: null })} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>
            {modal.editId ? "Edit" : "Add"}{" "}
            {modal.type === "brand" ? "Brand" : "Category"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Message variant="danger">{formError}</Message>}
          <Form.Group className="mb-3">
            <Form.Label>Title <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder={modal.type === "brand" ? "e.g. Samsung" : "e.g. Electronics"}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Optional description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModal({ show: false, type: null, editId: null })}>
            Cancel
          </Button>
          <Button variant="dark" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : modal.editId ? "Save Changes" : "Add"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, type: null, item: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{deleteModal.item?.title}</strong>?
          <p className="text-muted small mt-2">
            <i className="fas fa-exclamation-triangle me-1"></i>
            This will fail if products are linked to this {deleteModal.type}.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, type: null, item: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <i className="fas fa-trash me-2"></i>Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminCatalogPage;
