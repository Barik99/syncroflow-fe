import Navigation from "./Navigation";
import {useEffect, useState} from "react";
import { Button, Form, Modal, Toast } from "react-bootstrap";

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
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [triggerToDelete, setTriggerToDelete] = useState('');
    const [nameValidation, setNameValidation] = useState(false);
    const [typeValidation, setTypeValidation] = useState(false);
    const [fieldValidation, setFieldValidation] = useState<{[key: string]: boolean}>({});

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);
    const email = window.localStorage.getItem('email');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTriggerName(e.target.value);
    };

    const handleFieldChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setTriggerFields(prevFields => ({...prevFields, [field]: e.target.value}));
    };

    const handleFieldChangeNotOrAnd = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setTriggerFields(prevFields => ({...prevFields, [field]: e.target.value}));
    };

    const handleFieldChangeForDaysOfWeek = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

        if (!triggerName) {
            setNameValidation(true);
            return;
        } else {
            setNameValidation(false);
        }

        if (!selectedType) {
            setTypeValidation(true);
            return;
        } else {
            setTypeValidation(false);
        }

        let trigger: { [key: string]: any } = {
            name: triggerName,
            type: selectedType,
        };

        // Add fields based on the selected type
        const fields = triggerTypes[selectedType];
        for (const field in fields) {
            if (!triggerFields[field]) {
                setFieldValidation(prev => ({...prev, [field]: true}));
                return;
            } else {
                setFieldValidation(prev => ({...prev, [field]: false}));
            }

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

        const responseText = await response.text();

        if (response.ok) {
            fetchTriggers();
            setToastMessage(responseText);
            setShowToast(true);
            handleClose();
        } else {
            setToastMessage('Error: ' + responseText);
            setShowToast(true);
        }
    };

    const handleTypeChange = (selectedOption: string) => {
        setSelectedType(selectedOption);
    };

    const [fileContent, setFileContent] = useState("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            console.log("No file selected");
            return;
        }

        console.log("Selected file:", file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setFileContent(content);
        };
        reader.readAsText(file);
    };

    const deleteTrigger = async () => {
        const response = await fetch(`http://localhost:8080/removeTrigger/${email}/${triggerToDelete}`, {
            method: 'DELETE',
        });
        const responseText = await response.text();
        if (response.ok) {
            fetchTriggers();
            setToastMessage(responseText);
            setShowToast(true);
        } else {
            setToastMessage(responseText);
            setShowToast(true);
        }
        setShowDeleteModal(false);
    };


    return (
    <div>
        <Navigation />
        <Toast
            className={`toast-bottom-left align-items-center text-bg-primary border-0 ${toastMessage.includes('Trigger removed') || toastMessage.includes('Trigger added') ? 'text-bg-success' : 'text-bg-danger'}`}
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
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete this trigger?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={deleteTrigger}>
                    Proceed
                </Button>
            </Modal.Footer>
        </Modal>
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
                            <Form.Control type="text" placeholder="Enter trigger name" onChange={handleNameChange} className={nameValidation ? 'is-invalid' : ''} />
                            {nameValidation && <div className="invalid-feedback">Name is required</div>}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select onChange={(e) => handleTypeChange(e.target.value)} className={typeValidation ? 'is-invalid' : ''}>
                                <option>Select a type</option>
                                {Object.keys(triggerTypes).map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </Form.Select>
                            {typeValidation && <div className="invalid-feedback">Type is required</div>}
                        </Form.Group>
                        {selectedType && Object.keys(triggerTypes[selectedType]).map((field : string, index : number) => (
                            <Form.Group key={index} className="mb-3">
                                <Form.Label>{field}</Form.Label>
                                {selectedType === 'NOT' || selectedType === 'AND' || selectedType === 'OR' ? (
                                    <Form.Select onChange={handleFieldChangeNotOrAnd(field)} className={fieldValidation[field] ? 'is-invalid' : ''}>
                                        <option>Select a trigger</option>
                                        {triggers.map((trigger, index) => (
                                            <option key={index} value={trigger.name}>{trigger.name}</option>
                                        ))}
                                    </Form.Select>
                                ) : selectedType === 'Day Of Week' && field === 'day' ? (
                                    <Form.Select onChange={handleFieldChangeForDaysOfWeek(field)} className={fieldValidation[field] ? 'is-invalid' : ''}>
                                        <option>Select a day</option>
                                        <option value="SUNDAY">SUNDAY</option>
                                        <option value="MONDAY">MONDAY</option>
                                        <option value="TUESDAY">TUESDAY</option>
                                        <option value="WEDNESDAY">WEDNESDAY</option>
                                        <option value="THURSDAY">THURSDAY</option>
                                        <option value="FRIDAY">FRIDAY</option>
                                        <option value="SATURDAY">SATURDAY</option>
                                    </Form.Select>
                                ) : selectedType === 'File Existence' && field === 'file' ? (
                                    <Form.Group className="mb-3">
                                        <Form.Control type="file" onChange={handleFileChange} className={fieldValidation[field] ? 'is-invalid' : ''} />
                                        {fieldValidation[field] && <div className="invalid-feedback">{field} is required</div>}
                                    </Form.Group>
                                    ) : (
                                    <Form.Control type="text" placeholder={`Enter ${field}`} onChange={handleFieldChange(field)} className={fieldValidation[field] ? 'is-invalid' : ''} />
                                )}
                                {fieldValidation[field] && <div className="invalid-feedback">{field} is required</div>}
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
                                    <button onClick={() => {setTriggerToDelete(trigger.name); setShowDeleteModal(true);}}>Delete</button>
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