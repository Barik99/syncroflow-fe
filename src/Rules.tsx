import Navigation from "./Navigation";
import React, {useEffect, useState} from "react";
import {Button, Form, Modal, Toast} from "react-bootstrap";

interface Rule {
  id: string;
  name: string;
  action: string;
  active: boolean;
  lastUse: string | null;
  multiUse: boolean;
  sleepTime: number;
  trigger: string;
}

interface Trigger {
  id: string;
  name: string;
  type: string;
}

function Rules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [actions, setActions] = useState<Trigger[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isMultiUse, setIsMultiUse] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [sleepTime, setSleepTime] = useState("");

  const handleClose = () => {
    setShowModal(false);
    // Reset the fields
    setSelectedType("");
    setSelectedAction("");
    setRuleName("");
    setIsActive(false);
    setIsMultiUse(false);
    setFormErrors({});
  };
  const handleShow = () => setShowModal(true);
  const email = window.localStorage.getItem('email');

  useEffect(() => {
    fetchRules();
    fetchTriggers();
    fetchActions();
  }, []);

  const fetchRules = async () => {
    const response = await fetch(`/api/rules/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

      const data = await response.json();
      console.log(data);

      // Check if data is an array before setting it
      if (Array.isArray(data)) {
        setRules(data);
      } else {
        console.error('Error: Expected array from API, received:', data);
      }
    };

  const createRule = async () => {
    let errors = {};

    if (!ruleName.trim()) {
      errors = { ...errors, ruleName: "Rule name is required" };
    }
    if (!selectedType) {
      errors = { ...errors, selectedType: "Trigger name is required" };
    }
    if (!selectedAction) {
      errors = { ...errors, selectedAction: "Action name is required" };
    }
    if (!sleepTime || parseInt(sleepTime) < 1) {
      errors = { ...errors, sleepTime: "Sleep time is required and must be greater than 0" };
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const ruleData = {
      name: ruleName, // Replace with the actual rule name
      trigger: selectedType, // Replace with the actual trigger name
      action: selectedAction, // Replace with the actual action name
      active: isActive, // Replace with the actual active status
      multiUse: isMultiUse, // Replace with the actual multiUse status
      lastUse: null, // Replace with the actual lastUse value
      sleepTime: 1000 // Replace with the actual sleepTime value
    };

    const response = await fetch(`/api/addRule/${email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ruleData)
    });

    const data = await response.text();

    if (data === 'Rule added') {
      handleClose();
      setToastMessage(data);
      setShowToast(true);
      await fetchRules();
    } else {
      setShowToast(true);
      console.error('Error: Rule not added. Received:', data);
    }
  };

  const fetchTriggers = async () => {
    const response = await fetch(`/api/triggers/${email}`, {
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

  const fetchActions = async () => {
    const response = await fetch(`/api/actions/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (Array.isArray(data)) {
      setActions(data);
    } else {
      console.error('Error: Expected array from API, received:', data);
    }
  };

  const handleTypeChange = (selectedOption: string) => {
    setSelectedType(selectedOption);
    validateField('selectedType', selectedOption);
  }

  const handleActionChange = (selectedOption: string) => {
    setSelectedAction(selectedOption);
    validateField('selectedAction', selectedOption);
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    value = value.replace(/[^a-z0-9]/gi, '');
    setRuleName(value);
    validateField('ruleName', value);
  }

  const handleActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsActive(event.target.checked);
  }

  const handleMultiUseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsMultiUse(event.target.checked);
  }

  const handleSleepTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSleepTime(event.target.value);
    validateField('sleepTime', event.target.value);
  }

  const handleDelete = async () => {
    const response = await fetch(`/api/removeRule/${email}/${ruleToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();

    setToastMessage(data); // Set the toast message to the text from the API response
    setShowToast(true); // Show the toast message

    setShowDeleteModal(false);

    await fetchRules();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = e.charCode;
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode >= 48 && charCode <= 57) || charCode === 8) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  };

  const validateField = (fieldName: string, value: string) => {
    let errors = { ...formErrors };

    switch (fieldName) {
      case 'ruleName':
        if (!value.trim()) {
          errors.ruleName = "Rule name is required";
        } else {
          delete errors.ruleName;
        }
        break;
      case 'selectedType':
        if (!value) {
          errors.selectedType = "Trigger name is required";
        } else {
          delete errors.selectedType;
        }
        break;
      case 'selectedAction':
        if (!value) {
          errors.selectedAction = "Action name is required";
        } else {
          delete errors.selectedAction;
        }
        break;
      case 'sleepTime':
        if (!value || parseInt(value) < 1) {
          errors.sleepTime = "Sleep time is required and must be greater than 0";
        } else {
          delete errors.sleepTime;
        }
        break;
      default:
        break;
    }

    setFormErrors(errors);
  };


  return (
      <div>
        <Navigation />
        <div className="container">
          <Toast
              className={`toast-bottom-left align-items-center text-bg-primary border-0 ${toastMessage.includes('Rule removed') || toastMessage.includes('Rule added') ? 'text-bg-success' : 'text-bg-danger'}`}
              onClose={() => setShowToast(false)}
              show={showToast}
              delay={5000}
              autohide
          >
            <div className="d-flex">
              <div className="toast-body">
                {toastMessage}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)} aria-label="Close"></button>
            </div>
          </Toast>
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary my-3" onClick={handleShow}>Create Rule</button>
          </div>
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Delete Rule</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete <strong>{ruleToDelete}</strong>?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </Modal.Footer>
          </Modal>
          <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Create Rule</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form>
                <div className="mb-3">
                  <label htmlFor="ruleName" className="form-label">Name <span
                      className="required">*</span></label>
                  <input type="text" className={`form-control ${formErrors.ruleName ? 'is-invalid' : ''}`} id="ruleName"
                         maxLength={20} placeholder="Enter rule name"
                         onKeyPress={handleKeyPress} onChange={handleNameChange}/>
                  {formErrors.ruleName && <div className="invalid-feedback">{formErrors.ruleName}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="ruleAction" className="form-label">Action Name <span
                      className="required">*</span></label>
                  <Form.Select id="ruleAction" onChange={(e) => handleActionChange(e.target.value)}
                               value={selectedAction} className={formErrors.selectedAction ? 'is-invalid' : ''}>
                    <option value="">Select an action</option>
                    {actions.map((action, index) => (
                        <option key={index} value={action.name}>{action.name} ({action.type})</option>
                    ))}
                  </Form.Select>
                  {formErrors.selectedAction && <div className="invalid-feedback">{formErrors.selectedAction}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="ruleTrigger" className="form-label">Trigger Name <span
                      className="required">*</span></label>
                  <Form.Select id="ruleTrigger" onChange={(e) => handleTypeChange(e.target.value)} value={selectedType} className={formErrors.selectedType ? 'is-invalid' : ''}>
                    <option value="">Select a trigger</option>
                    {triggers.map((trigger, index) => (
                        <option key={index} value={trigger.name}>{trigger.name} ({trigger.type})</option>
                    ))}
                  </Form.Select>
                  {formErrors.selectedType && <div className="invalid-feedback">{formErrors.selectedType}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="ruleLastUse" className="form-label">Last Use</label>
                  <input type="text" className="form-control" id="ruleLastUse" placeholder="Enter last use"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="ruleSleepTime" className="form-label">Sleep Time <span
                      className="required">*</span></label>
                  <input type="number" className={`form-control ${formErrors.sleepTime ? 'is-invalid' : ''}`} id="ruleSleepTime"
                         onChange={handleSleepTimeChange} placeholder="Enter sleep time"/>
                  {formErrors.sleepTime && <div className="invalid-feedback">{formErrors.sleepTime}</div>}
                </div>
                <div className="mb-3 form-check form-check-inline">
                  <input type="checkbox" className="form-check-input" id="ruleActive" checked={isActive}
                         onChange={handleActiveChange}/>
                  <label htmlFor="ruleActive" className="form-check-label">Active</label>
                </div>
                <div className="mb-3 form-check form-check-inline">
                  <input type="checkbox" className="form-check-input" id="ruleMultiUse" checked={isMultiUse}
                         onChange={handleMultiUseChange}/>
                  <label htmlFor="ruleMultiUse" className="form-check-label">Multi Use</label>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={createRule}>
                Create
              </Button>
            </Modal.Footer>
          </Modal>
          {rules.length === 0 ? (
              <p>No rules available at the moment.</p>
          ) : (
              <div className="row">
                {rules.map((rule) => (
                    <div key={rule.id} className="col-lg-3">
                      <div className="card mb-3">
                        <div className="card-body">
                          <h5 className="card-title">{rule.name}</h5>
                          <p className="card-text">Action name: {rule.action}</p>
                          <p className="card-text">Trigger name: {rule.trigger}</p>
                          <p className="card-text">Active: {rule.active ? 'Yes' : 'No'}</p>
                          <p className="card-text">Last Use: {rule.lastUse}</p>
                          <p className="card-text">Multi Use: {rule.multiUse ? 'Yes' : 'No'}</p>
                          <p className="card-text">Sleep Time: {rule.sleepTime}</p>
                          <div className="position-absolute top-0 end-0"> {/* Add this div with classes */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                               className="bi bi-trash cursor-pointer" viewBox="0 0 16 16" onClick={() => {
                            setRuleToDelete(rule.name);
                            setShowDeleteModal(true);
                          }}>
                            <path
                                d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                            <path
                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                          </svg>
                          </div>
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


export default Rules;