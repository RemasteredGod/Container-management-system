import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Alert,
} from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Inventories = () => {
  // Authentication context
  const { currentUser } = useAuth();

  // State management
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemTypes, setItemTypes] = useState([
    'flamable',
    'inflamable',
    'fragile',
  ]);

  // Form state
  const [currentItem, setCurrentItem] = useState({
    product_name: '',
    quantity: 1,
    height: '',
    weight: '',
    type: '',
  });

  // Alert state
  const [alert, setAlert] = useState({
    show: false,
    variant: '',
    message: '',
  });

  // API URL
  const API_URL = 'http://localhost:5000';

  // Initial data fetching
  useEffect(() => {
    fetchInventory();
    fetchItemTypes();
  }, []);

  // Fetch inventory items from API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/inventory`, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setInventory(Array.isArray(data) ? data : []); // 🛠️ Fixed here
      setError(null);
    } catch (err) {
      setError(`Failed to load inventory: ${err.message}`);
      setAlert({
        show: true,
        variant: 'danger',
        message: `Failed to load inventory: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available item types
  const fetchItemTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inventory/types`, {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const types = await response.json();
        setItemTypes(types);
      }
    } catch (err) {
      console.error('Failed to load item types:', err);
    }
  };

  // Create new inventory item
  const handleAddItem = async () => {
    try {
      const response = await fetch(`${API_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(currentItem),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to add item');
        } catch (jsonError) {
          // If not valid JSON, use text
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const result = await response.json();

      setAlert({
        show: true,
        variant: 'success',
        message: 'Item added successfully!',
      });
      fetchInventory();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setAlert({
        show: true,
        variant: 'danger',
        message: `Error adding item: ${err.message}`,
      });
    }
  };

  // Update existing inventory item
  const handleUpdateItem = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/inventory/${currentItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(currentItem),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to update item');
        } catch (jsonError) {
          // If not valid JSON, use text
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const result = await response.json();

      setAlert({
        show: true,
        variant: 'success',
        message: 'Item updated successfully!',
      });
      fetchInventory();
      setShowEditModal(false);
    } catch (err) {
      setAlert({
        show: true,
        variant: 'danger',
        message: `Error updating item: ${err.message}`,
      });
    }
  };

  // Delete inventory item
  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${API_URL}/api/inventory/${id}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorText = await response.text();
          try {
            // Try to parse as JSON
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || 'Failed to delete item');
          } catch (jsonError) {
            // If not valid JSON, use text
            throw new Error(`Server error: ${response.status}`);
          }
        }

        const result = await response.json();

        setAlert({
          show: true,
          variant: 'success',
          message: 'Item deleted successfully!',
        });
        fetchInventory();
      } catch (err) {
        setAlert({
          show: true,
          variant: 'danger',
          message: `Error deleting item: ${err.message}`,
        });
      }
    }
  };

  // Set item for editing
  const editItem = (item) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  // Reset form values
  const resetForm = () => {
    setCurrentItem({
      product_name: '',
      quantity: 1,
      height: '',
      weight: '',
      type: '',
    });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: name === 'quantity' ? parseInt(value, 10) : value,
    });
  };

  return (
    <Container fluid className="mt-4">
      {/* Header and alert message */}
      <Row className="mb-4">
        <Col>
          <h2>Inventory Management</h2>
          {alert.show && (
            <Alert
              variant={alert.variant}
              onClose={() => setAlert({ ...alert, show: false })}
              dismissible
            >
              {alert.message}
            </Alert>
          )}
        </Col>
      </Row>

      {/* Add item button */}
      <Row className="mb-4">
        <Col className="d-flex justify-content-end">
          <Button
            variant="primary"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <i className="fas fa-plus me-2"></i>
            Add New Item
          </Button>
        </Col>
      </Row>

      {/* Inventory table */}
      <Row>
        <Col>
          <Card>
            <Card.Header as="h5">Inventory Items</Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading inventory...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : inventory.length === 0 ? (
                <div className="text-center my-4">
                  <p>
                    No inventory items found. Click "Add New Item" to add your
                    first item.
                  </p>
                </div>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Product Name</th>
                      <th>Quantity</th>
                      <th>Height</th>
                      <th>Weight (kg)</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.product_name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.height}</td>
                        <td>{item.weight}</td>
                        <td>{item.type}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => editItem(item)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Item Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Inventory Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="product_name"
                value={currentItem.product_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                as="select"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleInputChange}
              >
                {[...Array(100).keys()].map((num) => (
                  <option key={num + 1} value={num + 1}>
                    {num + 1}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Height (m)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="height"
                value={currentItem.height}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="weight"
                value={currentItem.weight}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                name="type"
                value={currentItem.type}
                onChange={handleInputChange}
              >
                <option value="">Select Type</option>
                {itemTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddItem}>
            Add Item
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Item Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Inventory Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="product_name"
                value={currentItem.product_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                as="select"
                name="quantity"
                value={currentItem.quantity}
                onChange={handleInputChange}
              >
                {[...Array(100).keys()].map((num) => (
                  <option key={num + 1} value={num + 1}>
                    {num + 1}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Height (m)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="height"
                value={currentItem.height}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="weight"
                value={currentItem.weight}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                name="type"
                value={currentItem.type}
                onChange={handleInputChange}
              >
                <option value="">Select Type</option>
                {itemTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateItem}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Inventories;
