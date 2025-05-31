import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  Tabs,
  Tab,
  Alert,
  Badge,
} from 'react-bootstrap';
import './CreateContainerModal.css';

const CreateContainerModal = ({
  show,
  handleClose,
  handleSave,
  container: existingContainer,
}) => {
  // Basic container state - use existing container data if editing
  const [container, setContainer] = useState({
    id: '',
    container_id: '',
    type: '20GP',
    status: 'In Yard',
    contents: '',
    priority: 'Normal',
    fill_percentage: 50,
    major_hub: '',
    hub: '',
    pickup_lat: '',
    pickup_lng: '',
    drop_lat: '',
    drop_lng: '',
    address: '',
    longitude: '',
    latitude: '',
    ...(existingContainer || {}),
  });

  // Form tabs and validation
  const [activeTab, setActiveTab] = useState('basic');
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options for dropdowns
  const containerTypes = [
    { value: '20GP', label: '20GP (General Purpose)' },
    { value: '40GP', label: '40GP (General Purpose)' },
    { value: '40HC', label: '40HC (High Cube)' },
    { value: '20FR', label: '20FR (Flat Rack)' },
    { value: '40FR', label: '40FR (Flat Rack)' },
    { value: '20OT', label: '20OT (Open Top)' },
    { value: '40OT', label: '40OT (Open Top)' },
    { value: '20RF', label: '20RF (Refrigerated)' },
    { value: '40RF', label: '40RF (Refrigerated)' },
  ];

  const statusOptions = [
    { value: 'In Yard', label: 'In Yard' },
    { value: 'In Transit', label: 'In Transit' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Delayed', label: 'Delayed' },
    { value: 'Maintenance', label: 'Maintenance' },
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Normal', label: 'Normal' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' },
  ];

  // Mock major hub data - in real app this would come from API
  const majorHubs = [
    { value: 'mumbai_hub', label: 'Mumbai Container Terminal' },
    { value: 'delhi_hub', label: 'Delhi Inland Container Depot' },
    { value: 'chennai_hub', label: 'Chennai Port Terminal' },
    { value: 'kolkata_hub', label: 'Kolkata Container Facility' },
    { value: 'bangalore_hub', label: 'Bangalore Logistics Park' },
  ];

  // Secondary hubs would typically be filtered based on major hub selection
  const [hubOptions, setHubOptions] = useState([]);

  // Sample predefined locations for quick selection
  const predefinedLocations = {
    pickup: [
      { name: 'Mumbai Port', lat: 18.922, lng: 72.8347 },
      { name: 'Chennai Port', lat: 13.1082, lng: 80.2921 },
      { name: 'Kolkata Port', lat: 22.5414, lng: 88.3435 },
      { name: 'Visakhapatnam Port', lat: 17.6868, lng: 83.2185 },
    ],
    drop: [
      { name: 'Delhi ICD', lat: 28.7041, lng: 77.1025 },
      { name: 'Bangalore ICD', lat: 12.9716, lng: 77.5946 },
      { name: 'Hyderabad ICD', lat: 17.385, lng: 78.4867 },
      { name: 'Pune Logistics Park', lat: 18.5204, lng: 73.8567 },
    ],
  };

  // Load secondary hubs based on major hub selection
  useEffect(() => {
    // Reset hub selection when major hub changes
    if (container.major_hub !== existingContainer?.major_hub) {
      setContainer((prev) => ({
        ...prev,
        hub: '', // Reset hub when major hub changes
      }));
    }

    if (!container.major_hub) {
      setHubOptions([]);
      return;
    }

    // Mock API call to get hubs for the selected major hub
    // This would be replaced with an actual API call in production
    const fetchHubOptions = () => {
      const mockHubData = {
        mumbai_hub: [
          { value: 'mumbai_north', label: 'Mumbai North Terminal' },
          { value: 'mumbai_south', label: 'Mumbai South Terminal' },
          { value: 'navi_mumbai', label: 'Navi Mumbai Terminal' },
        ],
        delhi_hub: [
          { value: 'delhi_tughlakabad', label: 'Tughlakabad ICD' },
          { value: 'delhi_patparganj', label: 'Patparganj ICD' },
          { value: 'ghaziabad', label: 'Ghaziabad Terminal' },
        ],
        chennai_hub: [
          { value: 'chennai_port', label: 'Chennai Port' },
          { value: 'ennore', label: 'Ennore Terminal' },
          { value: 'kattupalli', label: 'Kattupalli Port' },
        ],
        kolkata_hub: [
          { value: 'kolkata_dock', label: 'Kolkata Dock System' },
          { value: 'haldia', label: 'Haldia Terminal' },
        ],
        bangalore_hub: [
          { value: 'whitefield', label: 'Whitefield ICD' },
          { value: 'bangalore_city', label: 'Bangalore City Terminal' },
        ],
      };

      return mockHubData[container.major_hub] || [];
    };

    setHubOptions(fetchHubOptions());
  }, [container.major_hub, existingContainer?.major_hub]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for major_hub to reset hub
    if (name === 'major_hub') {
      setContainer({
        ...container,
        [name]: value,
        hub: '', // Reset hub when major hub changes
      });
    } else {
      setContainer({
        ...container,
        [name]: value,
      });
    }
  };

  // Handle coordinate input changes with validation
  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;

    // Allow empty value for resetting or "-" for negative coordinates
    if (value === '' || value === '-') {
      setContainer({
        ...container,
        [name]: value,
      });
      return;
    }

    // Validate as floating point number
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      // Check for valid coordinate ranges
      if (
        (name.includes('lat') && Math.abs(floatValue) <= 90) ||
        (name.includes('lng') && Math.abs(floatValue) <= 180)
      ) {
        setContainer({
          ...container,
          [name]: value,
        });
      }
    }
  };

  // Apply preset location coordinates
  const applyPresetLocation = (locationType, preset) => {
    if (locationType === 'pickup') {
      setContainer({
        ...container,
        pickup_lat: preset.lat.toString(),
        pickup_lng: preset.lng.toString(),
      });
    } else {
      setContainer({
        ...container,
        drop_lat: preset.lat.toString(),
        drop_lng: preset.lng.toString(),
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    const newErrors = {};
    setValidated(true);

    // Custom validation
    if (!container.container_id) {
      newErrors.container_id = 'Container ID is required';
    } else if (!/^[A-Za-z]{4}\d{7}$/.test(container.container_id)) {
      newErrors.container_id = 'Container ID must be in format ABCD1234567';
    }

    if (!container.contents) {
      newErrors.contents = 'Please specify container contents';
    }

    // Validate major hub and hub are selected
    if (activeTab === 'location') {
      if (!container.major_hub) {
        newErrors.major_hub = 'Please select a major hub';
      }

      if (container.major_hub && !container.hub) {
        newErrors.hub = 'Please select a hub';
      }

      // Validate pickup coordinates
      if (!container.pickup_lat || !container.pickup_lng) {
        newErrors.pickup_coordinates = 'Please enter valid pickup coordinates';
      } else {
        const pickupLat = parseFloat(container.pickup_lat);
        const pickupLng = parseFloat(container.pickup_lng);

        if (isNaN(pickupLat) || Math.abs(pickupLat) > 90) {
          newErrors.pickup_lat = 'Latitude must be between -90 and 90';
        }

        if (isNaN(pickupLng) || Math.abs(pickupLng) > 180) {
          newErrors.pickup_lng = 'Longitude must be between -180 and 180';
        }
      }
    }

    if (activeTab === 'dropoff') {
      // Validate drop-off coordinates
      if (!container.drop_lat || !container.drop_lng) {
        newErrors.drop_coordinates = 'Please enter valid drop-off coordinates';
      } else {
        const dropLat = parseFloat(container.drop_lat);
        const dropLng = parseFloat(container.drop_lng);

        if (isNaN(dropLat) || Math.abs(dropLat) > 90) {
          newErrors.drop_lat = 'Latitude must be between -90 and 90';
        }

        if (isNaN(dropLng) || Math.abs(dropLng) > 180) {
          newErrors.drop_lng = 'Longitude must be between -180 and 180';
        }
      }
    }

    setErrors(newErrors);

    // If the form is valid
    if (form.checkValidity() && Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);

      // Format the container object for saving
      const containerToSave = {
        ...container,
        // Generate a random ID if not provided
        id: container.id || `CONT${Math.floor(Math.random() * 100000)}`,
      };

      // Call the save handler from parent component
      handleSave(containerToSave);

      // Reset form state
      setValidated(false);
      setContainer({
        id: '',
        container_id: '',
        type: '20GP',
        status: 'In Yard',
        contents: '',
        priority: 'Normal',
        fill_percentage: 50,
        major_hub: '',
        hub: '',
        pickup_lat: '',
        pickup_lng: '',
        drop_lat: '',
        drop_lng: '',
        address: '',
        longitude: '',
        latitude: '',
      });

      // Close modal
      handleClose();
    }
  };

  // Generate a container ID suggestion
  const generateContainerId = () => {
    const prefix = 'MAEU'; // Shipping line code (e.g., Maersk)
    const uniqueNum = Math.floor(1000000 + Math.random() * 9000000).toString();

    setContainer({
      ...container,
      container_id: `${prefix}${uniqueNum}`,
    });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      backdrop="static"
      className="container-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {existingContainer ? 'Edit Container' : 'Create New Container'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="container-modal-body">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab
            eventKey="basic"
            title={
              <span>
                <i className="fas fa-info-circle me-2"></i>Basic Info
              </span>
            }
          >
            <Form noValidate validated={validated}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="container-id">
                    <Form.Label>
                      Container ID{' '}
                      <Badge bg="danger" className="ms-1" pill>
                        Required
                      </Badge>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        name="container_id"
                        value={container.container_id}
                        onChange={handleChange}
                        placeholder="ABCD1234567"
                        required
                        isInvalid={!!errors.container_id}
                      />
                      <Button
                        variant="outline-danger"
                        onClick={generateContainerId}
                        title="Generate Container ID"
                      >
                        <i className="fas fa-magic"></i>
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        {errors.container_id ||
                          'Valid container ID is required'}
                      </Form.Control.Feedback>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Standard format: 4 letters followed by 7 numbers
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="container-type">
                    <Form.Label>Container Type</Form.Label>
                    <Form.Select
                      name="type"
                      value={container.type}
                      onChange={handleChange}
                      required
                    >
                      {containerTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="container-status">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={container.status}
                      onChange={handleChange}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="container-contents">
                    <Form.Label>
                      Contents{' '}
                      <Badge bg="danger" className="ms-1" pill>
                        Required
                      </Badge>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="contents"
                      value={container.contents}
                      onChange={handleChange}
                      placeholder="Describe container contents"
                      required
                      isInvalid={!!errors.contents}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.contents || 'Please specify container contents'}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="container-priority">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      name="priority"
                      value={container.priority}
                      onChange={handleChange}
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="container-fill">
                    <Form.Label>
                      Fill Percentage:{' '}
                      <strong>{container.fill_percentage}%</strong>
                    </Form.Label>
                    <Form.Range
                      name="fill_percentage"
                      value={container.fill_percentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                    />
                    <div className="progress fill-progress">
                      <div
                        className={`progress-bar ${
                          container.fill_percentage > 90
                            ? 'bg-danger'
                            : container.fill_percentage > 75
                            ? 'bg-warning'
                            : 'bg-success'
                        }`}
                        role="progressbar"
                        style={{ width: `${container.fill_percentage}%` }}
                        aria-valuenow={container.fill_percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Tab>

          <Tab
            eventKey="location"
            title={
              <span>
                <i className="fas fa-map-marker-alt me-2"></i>Locations
              </span>
            }
          >
            <Form noValidate validated={validated}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="container-major-hub">
                    <Form.Label>
                      Major Hub{' '}
                      <Badge bg="danger" className="ms-1" pill>
                        Required
                      </Badge>
                    </Form.Label>
                    <Form.Select
                      name="major_hub"
                      value={container.major_hub}
                      onChange={handleChange}
                      isInvalid={!!errors.major_hub}
                    >
                      <option value="">Select Major Hub</option>
                      {majorHubs.map((hub) => (
                        <option key={hub.value} value={hub.value}>
                          {hub.label}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.major_hub}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3" controlId="container-hub">
                    <Form.Label>
                      Hub{' '}
                      <Badge bg="danger" className="ms-1" pill>
                        Required
                      </Badge>
                    </Form.Label>
                    <Form.Select
                      name="hub"
                      value={container.hub}
                      onChange={handleChange}
                      disabled={!container.major_hub}
                      isInvalid={!!errors.hub}
                    >
                      <option value="">Select Hub</option>
                      {hubOptions.map((hub) => (
                        <option key={hub.value} value={hub.value}>
                          {hub.label}
                        </option>
                      ))}
                    </Form.Select>
                    {!container.major_hub && (
                      <Form.Text className="text-muted">
                        Select a major hub first
                      </Form.Text>
                    )}
                    <Form.Control.Feedback type="invalid">
                      {errors.hub}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="coordinates-container">
                <Row>
                  {/* Pickup Location Column */}
                  <Col md={6}>
                    <div className="location-inputs">
                      <h5>
                        <i className="fas fa-map-marker-alt me-2"></i>Pickup
                        Location
                      </h5>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Latitude{' '}
                              <Badge bg="danger" className="ms-1" pill>
                                Required
                              </Badge>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="pickup_lat"
                              value={container.pickup_lat}
                              onChange={handleCoordinateChange}
                              placeholder="e.g., 20.2961"
                              isInvalid={
                                !!errors.pickup_lat ||
                                !!errors.pickup_coordinates
                              }
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.pickup_lat || errors.pickup_coordinates}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                              Enter a value between -90 and 90
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Longitude{' '}
                              <Badge bg="danger" className="ms-1" pill>
                                Required
                              </Badge>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="pickup_lng"
                              value={container.pickup_lng}
                              onChange={handleCoordinateChange}
                              placeholder="e.g., 85.8245"
                              isInvalid={
                                !!errors.pickup_lng ||
                                !!errors.pickup_coordinates
                              }
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.pickup_lng || errors.pickup_coordinates}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                              Enter a value between -180 and 180
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Label>
                        <i className="fas fa-bolt me-2"></i>Quick Select
                      </Form.Label>
                      <div className="quick-select-container">
                        {predefinedLocations.pickup.map((location, index) => (
                          <Button
                            key={index}
                            variant="outline-danger"
                            size="sm"
                            className="w-100 text-start btn-coordinate-action mb-2"
                            onClick={() =>
                              applyPresetLocation('pickup', location)
                            }
                          >
                            <i className="fas fa-map-marker-alt me-2"></i>
                            {location.name}{' '}
                            <span className="text-muted d-block text-truncate small">
                              ({location.lat.toFixed(4)},{' '}
                              {location.lng.toFixed(4)})
                            </span>
                          </Button>
                        ))}
                      </div>

                      {container.pickup_lat && container.pickup_lng && (
                        <Alert variant="info" className="mt-3 mb-0">
                          <small>
                            <strong>
                              <i className="fas fa-check-circle me-1"></i>{' '}
                              Selected Coordinates:
                            </strong>{' '}
                            {container.pickup_lat}, {container.pickup_lng}
                          </small>
                        </Alert>
                      )}
                    </div>
                  </Col>

                  {/* Drop-off Location Column */}
                  <Col md={6}>
                    <div className="location-inputs">
                      <h5>
                        <i className="fas fa-flag-checkered me-2"></i>Drop-off
                        Location
                      </h5>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Latitude{' '}
                              <Badge bg="danger" className="ms-1" pill>
                                Required
                              </Badge>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="drop_lat"
                              value={container.drop_lat}
                              onChange={handleCoordinateChange}
                              placeholder="e.g., 18.5204"
                              isInvalid={
                                !!errors.drop_lat || !!errors.drop_coordinates
                              }
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.drop_lat || errors.drop_coordinates}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                              Enter a value between -90 and 90
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              Longitude{' '}
                              <Badge bg="danger" className="ms-1" pill>
                                Required
                              </Badge>
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="drop_lng"
                              value={container.drop_lng}
                              onChange={handleCoordinateChange}
                              placeholder="e.g., 73.8567"
                              isInvalid={
                                !!errors.drop_lng || !!errors.drop_coordinates
                              }
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.drop_lng || errors.drop_coordinates}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                              Enter a value between -180 and 180
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Label>
                        <i className="fas fa-bolt me-2"></i>Quick Select
                      </Form.Label>
                      <div className="quick-select-container">
                        {predefinedLocations.drop.map((location, index) => (
                          <Button
                            key={index}
                            variant="outline-danger"
                            size="sm"
                            className="w-100 text-start btn-coordinate-action mb-2"
                            onClick={() =>
                              applyPresetLocation('drop', location)
                            }
                          >
                            <i className="fas fa-map-marker-alt me-2"></i>
                            {location.name}{' '}
                            <span className="text-muted d-block text-truncate small">
                              ({location.lat.toFixed(4)},{' '}
                              {location.lng.toFixed(4)})
                            </span>
                          </Button>
                        ))}
                      </div>

                      {container.drop_lat && container.drop_lng && (
                        <Alert variant="info" className="mt-3 mb-0">
                          <small>
                            <i className="fas fa-check-circle me-1"></i>{' '}
                            <strong>Selected Coordinates:</strong>{' '}
                            {container.drop_lat}, {container.drop_lng}
                          </small>
                        </Alert>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleClose}>
          <i className="fas fa-times me-1"></i> Cancel
        </Button>
        <Button
          variant="danger"
          onClick={
            activeTab === 'location'
              ? handleSubmit
              : () => setActiveTab('location')
          }
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span
              className="spinner-border spinner-border-sm me-1"
              role="status"
              aria-hidden="true"
            ></span>
          ) : activeTab === 'location' ? (
            <>
              <i className="fas fa-save me-1"></i>
            </>
          ) : (
            <>
              <i className="fas fa-arrow-right me-1"></i>
            </>
          )}
          {activeTab === 'location'
            ? existingContainer
              ? 'Update Container'
              : 'Create Container'
            : 'Next Step'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateContainerModal;
