import Navigation from "./Navigation";
import {useEffect, useState} from "react";
import { Button, Form, Modal, Toast } from "react-bootstrap";
import React from "react";
import { Breadcrumb } from 'react-bootstrap';

interface Trigger {
    id: string;
    name: string;
    type: string;
    value: string;
}

interface DirectoryProps {
    name: string;
    children: FileItem[];
}

interface FileItem {
    name: string;
    isDirectory: boolean;
    children?: FileItem[];
    // include other properties of the file item if there are any
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
    const [showFileExplorerModal, setShowFileExplorerModal] = useState(false);
    const [fileExplorerData, setFileExplorerData] = useState<DirectoryProps | null>(null);
    const [selectedFile, setSelectedFile] = React.useState("");
    const [path, setPath] = useState<string[]>(["Home"]);
    const [currentDirectory, setCurrentDirectory] = useState<DirectoryProps | null>(null);
    const [directoryContent, setDirectoryContent] = useState<FileItem[]>([]);
    const [selectedFilePath, setSelectedFilePath] = useState("");
    const [tempTriggerName, setTempTriggerName] = useState("");
    const [tempSelectedType, setTempSelectedType] = useState("");

    const handleClose = () => setShowModal(false);
    const handleShow = () => {
        resetModal();
        setShowModal(true);
    };

    useEffect(() => {
        const fetchRootDirectory = async () => {
            const response = await fetch('http://localhost:8080/getDirectory');
            const data = await response.json();
            setCurrentDirectory(data);
            setDirectoryContent(data.children || []);
        };

        fetchRootDirectory();
    }, []);

    const email = window.localStorage.getItem('email');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(/[^a-z0-9]/gi, '');
        setTriggerName(value);
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

    const handleFileSelect = (fileName: string) => {
        console.log("Selected file:", fileName);
        let filePath = path.join('/') + '/' + fileName;
        filePath = filePath.replace("Home", "FileDirectory"); // Replace "Home" with "FileDirectory"
        setSelectedFilePath(filePath); // Set the selected file path
        if (tempSelectedType === 'File Existence') {
            setTriggerFields(prevFields => ({...prevFields, 'file': filePath}));
        }
        setTriggerName(tempTriggerName); // Restore the trigger name
        setSelectedType(tempSelectedType); // Restore the selected type
        setShowFileExplorerModal(false); // Close the 'Select File' modal
        setShowModal(true); // Re-open the 'Create Trigger' modal
    };
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
        console.log("createTrigger function called");

        if (!triggerName) {
            console.log("triggerName is not set");
            setNameValidation(true);
            return;
        } else {
            setNameValidation(false);
        }

        if (!selectedType) {
            console.log("selectedType is not set");
            setTypeValidation(true);
            return;
        } else {
            setTypeValidation(false);
        }

        let trigger: { [key: string]: any } = {
            name: triggerName,
            type: selectedType,
        };

        console.log("Trigger object after initial setup:", trigger);

        if (selectedType === 'File Existence') {
            console.log("Selected file path:", selectedFilePath);
            if (!selectedFilePath) {
                console.error('Error: No file selected');
                // Display an error message to the user
                setToastMessage('Error: No file selected for File Existence trigger type');
                setShowToast(true);
                // Prevent the creation of the trigger
                return;
            }
            trigger.file = selectedFilePath.replace("Home", "FileDirectory");
        }

        console.log("Trigger object after file existence check:", trigger);

        const fields = triggerTypes[selectedType];
        console.log("Fields:", fields);
        for (const field in fields) {
            console.log(`Field: ${field}, Value: ${triggerFields[field]}`);
            if (!triggerFields[field]) {
                console.log("Field is not set");
                setFieldValidation(prev => ({...prev, [field]: true}));
                return;
            } else {
                console.log("Field is set");
                setFieldValidation(prev => ({...prev, [field]: false}));
            }

            if (fields[field] === "Long") {
                trigger[field] = parseInt(triggerFields[field]);
            } else {
                trigger[field] = triggerFields[field];
            }
        }

        console.log("Trigger object after field setup:", trigger);

        const response = await fetch(`http://localhost:8080/addTrigger/${email}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trigger)
        });
        if (!response.ok) {
            console.error('Error: HTTP status', response.status);
            const responseText = await response.text();
            console.error('Error: Response text', responseText);
        } else {
            const responseText = await response.text();
            console.log("Successful response text:", responseText);

            // Close the modal and display a success toast message
            handleClose();
            setToastMessage('Trigger added successfully!');
            setShowToast(true);
            await fetchTriggers();
        }
    };

    const handleTypeChange = (selectedOption: string) => {
        setSelectedType(selectedOption);
        if (selectedOption === "Select a type") {
            resetModal();
        } else {
            // Initialize triggerFields with the fields of the selected type
            const fields = triggerTypes[selectedOption];
            let initialTriggerFields: {[key: string]: string} = {};
            for (const field in fields) {
                initialTriggerFields[field] = '';
            }
            setTriggerFields(initialTriggerFields);

            // Reset the selected file path if the 'File Existence' trigger type is selected
            if (selectedOption === 'File Existence') {
                setSelectedFilePath('');
            }
        }
    };

    const [fileContent, setFileContent] = useState("");

    const handleFileChange = async () => {
        const response = await fetch('http://localhost:8080/getDirectory');
        const data = await response.json();
        console.log(data); // Log the data to the console
        setFileExplorerData(data);
        setSelectedFile(""); // Reset the selected file
        setTempTriggerName(triggerName); // Store the current trigger name
        setTempSelectedType(selectedType); // Store the current selected type
        setTriggerName(""); // Clear the trigger name
        setSelectedType(""); // Clear the selected type
        setShowModal(false); // Close the 'Create Trigger' modal
        setShowFileExplorerModal(true); // Open the 'Select File' modal
        setCurrentDirectory(data);
        setDirectoryContent(data.children || []);
        setPath(["Home"]); // Reset the path to "Home"
    };

    const deleteTrigger = async () => {
        const response = await fetch(`http://localhost:8080/removeTrigger/${email}/${triggerToDelete}`, {
            method: 'DELETE',
        });
        const responseText = await response.text();
        if (response.ok) {
            await fetchTriggers();
            setToastMessage(responseText);
            setShowToast(true);
        } else {
            setToastMessage(responseText);
            setShowToast(true);
        }
        setShowDeleteModal(false);
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

    const resetModal = () => {
        setTriggerName("");
        setSelectedType("");
        setTriggerFields({});
        setNameValidation(false);
        setTypeValidation(false);
        setFieldValidation({});
    };

    const handleBreadcrumbClick = (index: number) => {
        const newPath = path.slice(0, index + 1);
        let newCurrentDirectory: DirectoryProps | null = fileExplorerData;

        // Traverse the currentDirectory and its children to find the clicked directory
        for (let i = 1; i < newPath.length; i++) {
            const nextDirectory = newCurrentDirectory?.children.find(dir => dir.name === newPath[i]);

            if (nextDirectory && nextDirectory.isDirectory) {
                newCurrentDirectory = nextDirectory as DirectoryProps;
            } else {
                console.error('Error: Directory not found:', newPath[i]);
                return;
            }
        }

        // Update the states
        setCurrentDirectory(newCurrentDirectory);
        setDirectoryContent(newCurrentDirectory?.children || []);
        setPath(newPath);
        setSelectedFile('');
    };

    const handleDirectoryDoubleClick = (directoryName: string) => {
        if (currentDirectory) {
            const clickedDirectory = currentDirectory.children.find(item => item.name === directoryName);

            if (clickedDirectory && clickedDirectory.isDirectory) {
                // @ts-ignore
                setCurrentDirectory(clickedDirectory);
                setDirectoryContent(clickedDirectory.children || []);
                setPath(prevPath => [...prevPath, clickedDirectory.name]);
                setSelectedFile(''); // Deselect the file
            }
        }
    };

    const renderDirectories = (items: FileItem[]) => {
        return items.filter(item => item.isDirectory).map((item, index) => (
            <div key={index} onDoubleClick={() => handleDirectoryDoubleClick(item.name)}>
                {item.name}
            </div>
        ));
    };

    const renderFiles = (items: FileItem[]) => {
        return items.filter(item => !item.isDirectory).map((item, index) => (
            <li key={item.name} className="list-group-item">
                <input
                    className="form-check-input me-1"
                    type="checkbox"
                    id={item.name}
                    name="file"
                    value={item.name}
                    checked={selectedFile === item.name}
                    onChange={() => handleFileSelect(item.name)}
                />
                <label className="form-check-label" htmlFor={item.name}>{item.name}</label>
            </li>
        ));
    };

    const handleCloseFileExplorerModal = () => {
        setShowFileExplorerModal(false); // Close the 'Select File' modal
        setShowModal(true); // Open the 'Create Trigger' modal
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
                            <Form.Control
                                type="text"
                                placeholder="Enter trigger name"
                                onKeyPress={handleKeyPress}
                                onChange={handleNameChange}
                                value={triggerName} // Set the value to triggerName
                                className={nameValidation ? 'is-invalid' : ''}
                            />
                            {nameValidation && <div className="invalid-feedback">Name is required</div>}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Type</Form.Label>
                            <Form.Select onChange={(e) => handleTypeChange(e.target.value)} className={typeValidation ? 'is-invalid' : ''} value={selectedType}>
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
                                <br/>
                                {selectedType === 'NOT' || selectedType === 'AND' || selectedType === 'OR' ? (
                                    <Form.Select onChange={handleFieldChangeNotOrAnd(field)}
                                                 className={fieldValidation[field] ? 'is-invalid' : ''}>
                                        <option>Select a trigger</option>
                                        {triggers.map((trigger, index) => (
                                            <option key={index} value={trigger.name}>{trigger.name}</option>
                                        ))}
                                    </Form.Select>
                                ) : selectedType === 'Day Of Week' && field === 'day' ? (
                                    <Form.Select onChange={handleFieldChangeForDaysOfWeek(field)}
                                                 className={fieldValidation[field] ? 'is-invalid' : ''}>
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
                                    <div>
                                        <Button variant="primary" onClick={handleFileChange}
                                                className={fieldValidation['file'] ? 'is-invalid' : ''}>
                                            Upload File
                                        </Button>
                                        <div>File chosen: <strong>{selectedFilePath}</strong></div>
                                        {/* Display the selected file path */}
                                    </div>
                                ) : (
                                    <Form.Control type="text" placeholder={`Enter ${field}`}
                                                  onChange={handleFieldChange(field)}
                                                  className={fieldValidation[field] ? 'is-invalid' : ''}/>
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
            <Modal show={showFileExplorerModal} onHide={() => {
                setShowFileExplorerModal(false);
                setShowModal(true);
                setTriggerName(tempTriggerName); // Restore the trigger name
                setSelectedType(tempSelectedType); // Restore the selected type
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>Select a File</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Breadcrumb>
                            {path.map((dir, index) => (
                                <Breadcrumb.Item key={index} active={index === path.length - 1}
                                                 onClick={() => handleBreadcrumbClick(index)}>
                                    {dir}
                                </Breadcrumb.Item>
                            ))}
                        </Breadcrumb>
                        <h3>Directories</h3>
                        {renderDirectories(directoryContent)}
                        <h3>Files</h3>
                        {renderFiles(directoryContent)}
                    </Form>
                </Modal.Body>
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