import Navigation from "./Navigation";
import {useEffect, useState} from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface Trigger {
  id: string;
  name: string;
  type: string;
  value: string;
}

function Triggers() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [triggerTypes, setTriggerTypes] = useState<any>({});
  const [triggerName, setTriggerName] = useState("");
  const [triggerFields, setTriggerFields] = useState<{[key: string]: string}>({});

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  const email = window.localStorage.getItem('email');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTriggerName(e.target.value);
  };

  const handleFieldChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setTriggerFields(prevFields => ({...prevFields, [field]: e.target.value}));
  };

  useEffect(() => {
    fetchTriggers();
    fetchTriggerTypes();
  }, []);

  const fetchTriggers = async () => {
    const response = await fetch(`http://localhost:8080/triggers/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (Array.isArray(data)) {
      setTriggers(data);
    } else {
      console.error('Error: Expected array from API, received:', data);
    }
  };

  const fetchTriggerTypes = async () => {
    const response = await fetch('http://localhost:8080/triggerTypes', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (typeof data === 'object') {
        setTriggerTypes(data);
    } else {
        console.error('Error: Expected object from API, received:', data);
    }
  };

    const createTrigger = async () => {
        let trigger: { [key: string]: any } = {
            name: triggerName,
            type: selectedType,
        };

        // Add fields based on the selected type
        const fields = triggerTypes[selectedType];
        for (const field in fields) {
            if (fields[field] === "Long") {
                trigger[field] = parseInt(triggerFields[field]);
            } else {
                trigger[field] = triggerFields[field];
            }
        }

        const response = await fetch(`http://localhost:8080/addTrigger/${email}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trigger)
        });

        if (response.ok) {
            fetchTriggers();
            handleClose();
        } else {
            console.error('Error: Could not create trigger');
        }
    };

  const handleTypeChange = (selectedOption: string) => {
    setSelectedType(selectedOption);
  };

  return (
    <div>
      <Navigation />
      <div className="container">
        <div className="d-flex justify-content-end">
          <button className="btn btn-primary my-3" onClick={handleShow}>Create Trigger</button>
        </div>
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create Trigger</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Enter trigger name" onChange={handleNameChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select onChange={(e) => handleTypeChange(e.target.value)}>
                  <option>Select a type</option>
                  {Object.keys(triggerTypes).map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              {selectedType && Object.keys(triggerTypes[selectedType]).map((field : string, index : number) => (
                <Form.Group key={index} className="mb-3">
                  <Form.Label>{field}</Form.Label>
                  <Form.Control type="text" placeholder={`Enter ${field}`} onChange={handleFieldChange(field)} />
                </Form.Group>
              ))}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={createTrigger}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
        {triggers.length === 0 ? (
            <p>No triggers available at the moment.</p>
        ) : (
            <div className="row">
              {triggers.map((trigger) => (
                  <div key={trigger.id} className="col-lg-3">
                    <div className="card mb-3">
                      <div className="card-body">
                        <h5 className="card-title">{trigger.name}</h5>
                        <p className="card-text">Type: {trigger.type}</p>
                        <p className="card-text">Description: {trigger.value}</p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default Triggers;