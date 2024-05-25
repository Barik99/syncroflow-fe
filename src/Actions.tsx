import Navigation from "./Navigation";
import {useEffect, useState} from "react";
import {Button, Form, Modal, OverlayTrigger, Toast, Tooltip} from "react-bootstrap";
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

interface ActionTypeMapping {
    [key: string]: string;
}

const actionTypeMapping: ActionTypeMapping = {
    "Paste File": "Lipire fișier",
    "File Size": "Dimensiune fișier",
    "Append String To File": "Adăugare șir la fișier",
    "Start External Program": "Pornire program extern",
    "Delete File": "Ștergere fișier",
    "Combined Actions": "Acțiuni combinate",
    "Move File": "Mutare fișier"
};

function Actions() {
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
    const [path, setPath] = useState<string[]>(["Acasă"]);
    const [currentDirectory, setCurrentDirectory] = useState<DirectoryProps | null>(null);
    const [directoryContent, setDirectoryContent] = useState<FileItem[]>([]);
    const [selectedFilePath, setSelectedFilePath] = useState("");
    const [tempTriggerName, setTempTriggerName] = useState("");
    const [tempSelectedType, setTempSelectedType] = useState("");
    const [firstTrigger, setFirstTrigger] = useState("");
    const [secondTrigger, setSecondTrigger] = useState("");
    const [tempSizeThreshold, setTempSizeThreshold] = useState("");
    const [tempCommandLineArguments, setTempCommandLineArguments] = useState("");
    const [tempExitStatus, setTempExitStatus] = useState("");
    const [showDirectoryExplorerModal, setShowDirectoryExplorerModal] = useState(false);
    const [showDirectoryUploadButton, setShowDirectoryUploadButton] = useState(false);
    const [selectedDirectoryPath, setSelectedDirectoryPath] = useState("");
    const [showNotification, setShowNotification] = useState(false);
    const [tempStringToAppend, setTempStringToAppend] = useState("");

    const handleClose = () => setShowModal(false);
    const handleShow = () => {
        resetModal();
        // Reset the firstTrigger and secondTrigger states
        setFirstTrigger('Selectează un declanșator');
        setSecondTrigger('Selectează un declanșator');
        setShowModal(true);
    };

    useEffect(() => {
        if (!email) {
            console.log("User is not logged in. Skipping fetchRootDirectory API call.");
            setShowNotification(true);
            return;
        }

        const fetchRootDirectory = async () => {
            const response = await fetch('/api/getDirectory');
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
        if (field === 'stringToAppend' && selectedType === 'Append String To File') {
            console.log('stringToAppend:', e.target.value);
        }
        if (field === 'commandLineArguments' && selectedType === 'Start External Program') {
            console.log('commandLineArguments:', e.target.value);
        }
    };

    const handleFieldChangeNotOrAnd = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setTriggerFields(prevFields => ({...prevFields, [field]: value}));
        if (field === 'firstAction') {
            setFirstTrigger(value);
        } else if (field === 'secondAction') {
            setSecondTrigger(value);
        }
    };


    const [fieldErrorMessage, setFieldErrorMessage] = useState<{[key: string]: string}>({});


    useEffect(() => {
        fetchTriggers();
        fetchTriggerTypes();
    }, []);

    const handleFileSelect = (fileName: string) => {
        console.log("Selected file:", fileName);
        let filePath = path.join('/') + '/' + fileName;
        filePath = filePath.replace("Acasă", "FileDirectory"); // Replace "Acasă" with "FileDirectory"
        setSelectedFilePath(filePath); // Set the selected file path
        if (tempSelectedType === 'Start External Program') {
            // Restore the commandLineArguments and exitStatus
            setTriggerFields(prevFields => ({
                ...prevFields,
                'externalProgram': filePath
            }));
            console.log('Restored commandLineArguments:', tempCommandLineArguments); // Log the restored commandLineArguments
        } else if (tempSelectedType === 'Delete File') {
            // Set the fileToDelete field to the selected file path
            setTriggerFields(prevFields => ({
                ...prevFields,
                'fileToDelete': filePath
            }));
        } else if (tempSelectedType === 'Append String To File') {
            // Set the fileToDelete field to the selected file path
            setTriggerFields(prevFields => ({
                ...prevFields,
                'file': filePath
            }));
        } else if (tempSelectedType === 'Paste File') {
            // Set the fileToDelete field to the selected file path
            setTriggerFields(prevFields => ({
                ...prevFields,
                'fileToPaste': filePath
            }));
        } else if (tempSelectedType === 'Move File') {
            // Set the fileToDelete field to the selected file path
            setTriggerFields(prevFields => ({
                ...prevFields,
                'fileToMove': filePath
            }));
        }
        setTriggerName(tempTriggerName); // Restore the trigger name
        setSelectedType(tempSelectedType); // Restore the selected type
        setShowFileExplorerModal(false); // Close the 'Select File' modal
        setShowModal(true); // Re-open the 'Create Trigger' modal
    };

    const fetchTriggers = async () => {
        if (!email) {
            console.log("User is not logged in. Skipping fetchActions API call.");
            return;
        }

        const response = await fetch(`/api/actions/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
            const sortedRules = data.sort((a, b) => a.name.localeCompare(b.name));
            setTriggers(sortedRules);
        } else {
            console.error('Error: Expected array from API, received:', data);
        }
    };

    const fetchTriggerTypes = async () => {
        if (!email) {
            console.log("User is not logged in. Skipping fetchActions API call.");
            return;
        }

        const response = await fetch('/api/actionTypes', {
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

        if (nameValidation || typeValidation || fieldValidation['hours'] || fieldValidation['day'] || fieldValidation['minutes']) {
            return;
        }

        if (selectedType === 'File Size' && (!triggerFields['sizeThreshold'] || triggerFields['sizeThreshold'].trim() === '')) {
            setFieldValidation(prev => ({...prev, 'sizeThreshold': true}));
            setFieldErrorMessage(prev => ({...prev, 'sizeThreshold': 'Dimensiunea fișierului este obligatorie'}));
            return;
        }

        console.log("Trigger object after initial setup:", trigger);

        if (selectedType === 'Delete File' || selectedType === 'Append String To File' ||
            selectedType === 'Start External Program') {
            console.log("Selected file path:", selectedFilePath);
            if (!selectedFilePath) {
                console.error('Error: No file selected');
                // Display an error message to the user
                setToastMessage('Niciun fișier nu a fost selectat pentru acțiunea ' + selectedType);
                setShowToast(true);
                // Prevent the creation of the trigger
                return;
            }
            trigger.file = selectedFilePath.replace("Acasă", "FileDirectory");
        } else if (selectedType === 'Paste File' || selectedType === 'Move File') {
            console.log("Selected directory path:", selectedDirectoryPath);
            if (!selectedDirectoryPath) {
                console.error('Error: No directory selected');
                // Display an error message to the user
                setToastMessage('Niciun fișier nu a fost selectat pentru acțiunea ' + selectedType);
                setShowToast(true);
                // Prevent the creation of the trigger
                return;
            }
            trigger.destinationPath = selectedDirectoryPath.replace("Acasă", "FileDirectory");
            console.log("Trigger object after setting destinationPath:", trigger);
            if (!selectedFilePath) {
                console.error('Error: No file selected');
                // Display an error message to the user
                setToastMessage('Niciun fișier nu a fost selectat pentru acțiunea ' + selectedType);
                setShowToast(true);
                // Prevent the creation of the trigger
                return;
            }
            trigger.file = selectedFilePath.replace("Acasă", "FileDirectory");
        }

        console.log("Action object after file existence check:", trigger);

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

        const response = await fetch(`/api/addAction/${email}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(trigger)
        });
        console.log(JSON.stringify(trigger));
        if (!response.ok) {
            console.error('Error: HTTP status', response.status);
            const responseText = await response.text();
            console.error('Error: Response text', responseText);
        } else {
            const responseText = await response.text();
            console.log("Successful response text:", responseText);

            // Close the modal and display a success toast message
            handleClose();
            setToastMessage(responseText);
            setShowToast(true);
            await fetchTriggers();
        }
    };

    const handleTypeChange = (selectedOption: string) => {
        setSelectedType(selectedOption);
        if (selectedOption === "Alegeți un tip de acțiune") {
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
            if (selectedOption === 'Delete File') {
                setSelectedFilePath('');
            } else if (selectedOption === "Append String To File") {
                    // Initialize triggerFields with the fields of the selected type
                    const fields = triggerTypes[selectedOption];
                    let initialTriggerFields: {[key: string]: string} = {};
                    for (const field in fields) {
                        initialTriggerFields[field] = '';
                    }
                    setTriggerFields(initialTriggerFields);

                    // Reset the selected file path if the 'File Size' trigger type is selected
                    setSelectedFilePath('');
            } else if (selectedOption === "Start External Program") {
                setSelectedFilePath(''); // Reset the selected file path
                // Initialize triggerFields with the fields of the selected type
                const fields = triggerTypes[selectedOption];
                let initialTriggerFields: {[key: string]: string} = {};
                for (const field in fields) {
                    initialTriggerFields[field] = '';
                }
                setTriggerFields(initialTriggerFields); // Reset all the fields
            } else if (selectedOption === "Paste File" || selectedOption === "Move File") {
                setSelectedFilePath(""); // Reset the selected file path
                setSelectedDirectoryPath(""); // Reset the selected directory path
                setShowDirectoryUploadButton(true);
            } else {
                setShowDirectoryUploadButton(false);
            }
        }
    };

    const [fileContent, setFileContent] = useState("");

    const handleFileChange = async () => {
        const response = await fetch('/api/getDirectory');
        const data = await response.json();
        console.log(data); // Log the data to the console
        setFileExplorerData(data);
        setSelectedFile(""); // Reset the selected file
        setTempTriggerName(triggerName); // Store the current trigger name
        setTempSelectedType(selectedType); // Store the current selected type
        if (tempSelectedType === 'Start External Program') {
            // Store the current commandLineArguments and exitStatus
            setTempCommandLineArguments(triggerFields['commandLineArguments']);
        }
        if (selectedType === 'File Size') {
            setTempSizeThreshold(triggerFields['sizeThreshold']); // Store the current size threshold
            setTempSizeThreshold(''); // Clear the size threshold
        }
        if (selectedType === 'Append File To String') {
            setTempSizeThreshold(triggerFields['stringToAppend']); // Store the current string to append
        }
        setTriggerName(""); // Clear the trigger name
        setSelectedType(""); // Clear the selected type
        setShowModal(false); // Close the 'Create Trigger' modal
        setShowFileExplorerModal(true); // Open the 'Select File' modal
        setCurrentDirectory(data);
        setDirectoryContent(data.children || []);
        setPath(["Acasă"]); // Reset the path to "Acasă"
    };

    const deleteTrigger = async () => {
        const response = await fetch(`/api/removeAction/${email}/${triggerToDelete}`, {
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

    const handleDirectorySelect = (directoryName: string) => {
        console.log("Selected directory:", directoryName);
        let directoryPath = path.join('/') + '/' + directoryName;
        directoryPath = directoryPath.replace("Acasă", "FileDirectory"); // Replace "Acasă" with "FileDirectory"
        setSelectedDirectoryPath(directoryPath); // Set the selected directory path
        console.log("Selected directory path:", directoryPath);
        if (tempSelectedType === 'Paste File' || tempSelectedType === 'Move File') {
            // Set the destinationPath field to the selected directory path
            setTriggerFields(prevFields => ({
                ...prevFields,
                'destinationPath': directoryPath
            }));
            console.log('Restored destinationPath:', directoryPath); // Log the restored destinationPath
        }
        setShowDirectoryExplorerModal(false); // Close the 'Select Directory' modal
        setShowModal(true); // Re-open the 'Create Trigger' modal
        setTriggerName(tempTriggerName); // Restore the trigger name
        setSelectedType(tempSelectedType); // Restore the selected type
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

    const renderFilesForDirectories = (items: FileItem[]) => {
        return items.filter(item => !item.isDirectory).map((item, index) => (
            <li key={item.name} className="list-group-item">
                {item.name}
            </li>
        ));
    };

    const handleDirectoryChange = async () => {
        const response = await fetch('/api/getDirectory');
        const data = await response.json();
        console.log(data); // Log the data to the console
        setFileExplorerData(data);
        setSelectedFile(""); // Reset the selected file
        setTempTriggerName(triggerName); // Store the current trigger name
        setTempSelectedType(selectedType); // Store the current selected type
        setShowModal(false); // Close the 'Create Trigger' modal
        setShowDirectoryExplorerModal(true); // Open the 'Select Directory' modal
        setCurrentDirectory(data);
        setDirectoryContent(data.children || []);
        setPath(["Acasă"]); // Reset the path to "Acasă"
    };

    const handleCheckboxClick = (directoryName: string) => {
        let directoryPath = path.join('/') + '/' + directoryName;
        directoryPath = directoryPath.replace("Acasă", "FileDirectory"); // Replace "Acasă" with "FileDirectory"
        setSelectedDirectoryPath(directoryPath); // Set the selected directory path
        setShowDirectoryExplorerModal(false); // Close the 'Select Directory' modal
        setShowModal(true); // Re-open the 'Create Trigger' modal
        setTriggerName(tempTriggerName); // Restore the trigger name
        setSelectedType(tempSelectedType); // Restore the selected type
    };

    const renderDirectoriesForUpload = (items: FileItem[]) => {
        return items.filter(item => item.isDirectory).map((item, index) => (
            <div key={index} className="form-check">
                <input type="checkbox" className="form-check-input" id={item.name} name={item.name} onChange={() => handleDirectorySelect(item.name)}/>
                <label className="form-check-label" htmlFor={item.name}
                       onClick={(e) => e.preventDefault()}
                       onDoubleClick={() => handleDirectoryDoubleClick(item.name)}>{item.name}</label>
            </div>
        ));
    };

    return (
        <div>
            <Navigation />
            {showNotification &&
                <div className="alert alert-warning" role="alert">
                    Trebuie să vă conectați pentru vedea acțiunile.
                </div>
            }
            <Toast
                className={`toast-bottom-left align-items-center text-bg-primary border-0 ${toastMessage.includes('Acțiunea a fost ștearsă cu succes!') || toastMessage.includes('Acțiunea a fost adăugată cu succes!') ? 'text-bg-success' : 'text-bg-danger'}`}
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
                    <Modal.Title>Șterge acțiunea</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Sunteți sigur că doriți să ștergeți acțiunea?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Anulează
                    </Button>
                    <Button variant="danger" onClick={deleteTrigger}>
                        Șterge
                    </Button>
                </Modal.Footer>
            </Modal>
            <div className="container">
                <div className="d-flex justify-content-end">
                    {email === null ? (
                        <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={<Tooltip id="button-tooltip">Trebuie să vă contectați pentru a adăuga o acțiune</Tooltip>}
                        >
                <span className="d-inline-block">
                    <Button className="btn btn-primary my-3" disabled style={{ pointerEvents: 'none' }}>
                        Adaugă acțiune
                    </Button>
                </span>
                        </OverlayTrigger>
                    ) : (
                        <Button className="btn btn-primary my-3" onClick={handleShow}>
                            Adaugă acțiune
                        </Button>
                    )}
                </div>
                <Modal show={showModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Adaugă acțiune</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nume</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter trigger name"
                                    onKeyPress={handleKeyPress}
                                    onChange={handleNameChange}
                                    value={triggerName} // Set the value to triggerName
                                    maxLength={20}
                                    className={nameValidation ? 'is-invalid' : ''}
                                />
                                {nameValidation && <div className="invalid-feedback">Numele acțiunii este obligatoriu</div>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Type</Form.Label>
                                <Form.Select onChange={(e) => handleTypeChange(e.target.value)} className={typeValidation ? 'is-invalid' : ''} value={selectedType}>
                                    <option>Alegeți un tip de acțiune</option>
                                    {Object.keys(triggerTypes).map((type, index) => (
                                        <option key={index} value={type}>{actionTypeMapping[type]}</option>
                                    ))}
                                </Form.Select>
                                {typeValidation && <div className="invalid-feedback">Tipul acțiunii este obligatoriu</div>}
                            </Form.Group>
                            {selectedType && Object.keys(triggerTypes[selectedType]).map((field : string, index : number) => (
                                <Form.Group key={index} className="mb-3">
                                    <Form.Label className="label-spacing">
                                        {selectedType === 'Paste File' && field === 'destinationPath' ? 'Directorul de destinație' :
                                            selectedType === 'Paste File' && field === 'fileToPaste' ? 'Fișierul de lipit' :
                                                selectedType === 'Append String To File' && field === 'stringToAppend' ? 'Șirul de caractere de adăugat' :
                                                    selectedType === 'Append String To File' && field === 'file' ? 'Fișierul la care se adaugă șirul' :
                                                        selectedType === 'Start External Program' && field === 'commandLineArguments' ? 'Argumentele liniei de comandă' :
                                                            selectedType === 'Start External Program' && field === 'externalProgram' ? 'Programul extern' :
                                                                selectedType === 'Delete File' && field === 'fileToDelete' ? 'Fișierul de șters' :
                                                                    selectedType === 'Combined Actions' && field === 'secondAction' ? 'Prima acțiune' :
                                                                        selectedType === 'Combined Actions' && field === 'firstAction' ? 'A doua acțiune' :
                                                                            selectedType === 'Move File' && field === 'destinationPath' ? 'Directorul de destinație' :
                                                                                selectedType === 'Move File' && field === 'fileToMove' ? 'Fișierul de mutat' : field}
                                    </Form.Label>
                                    <br/>
                                    {selectedType === 'Paste File' && field === 'destinationPath' ? (
                                        <div>
                                            <Button variant="primary" onClick={handleDirectoryChange}>
                                                Încarcă director
                                            </Button>
                                            <div className="file-path-container file-selected-spacing">
                                                <div>Directorul ales: <strong>{selectedDirectoryPath.replace(/FileDirectory/, 'Acasă')}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    ) :selectedType === 'Move File' && field === 'destinationPath' ? (
                                        <div>
                                            <Button variant="primary" onClick={handleDirectoryChange}>
                                                Încarcă director
                                            </Button>
                                            <div className="file-path-container file-selected-spacing">
                                                <div>Directorul ales: <strong>{selectedDirectoryPath.replace(/FileDirectory/, 'Acasă')}</strong></div>
                                            </div>
                                        </div>
                                    ) : selectedType === 'Paste File' && field === 'fileToPaste' ? (
                                        <div>
                                            <Button variant="primary" onClick={handleFileChange}
                                                    className={fieldValidation['fileToDelete'] ? 'is-invalid' : ''}>
                                                Încarcă fișier
                                            </Button>
                                            <div className="file-path-container file-selected-spacing">
                                                <div>Fișierul ales: <strong>{selectedFilePath.replace(/FileDirectory/, 'Acasă')}</strong></div>
                                            </div>
                                            {/* Display the selected file path */}
                                        </div>
                                    ) : selectedType === 'Move File' && field === 'fileToMove' ? (
                                        <div>
                                            <Button variant="primary" onClick={handleFileChange}
                                                    className={fieldValidation['fileToDelete'] ? 'is-invalid' : ''}>
                                                Încarcă fișier
                                            </Button>
                                            <div className="file-path-container file-selected-spacing">
                                                <div>Fișierul
                                                    ales: <strong>{selectedFilePath.replace(/FileDirectory/, 'Acasă')}</strong>
                                                </div>
                                            </div>
                                            {/* Display the selected file path */}
                                        </div>
                                    ) : (selectedType === 'Combined Actions' && (field === 'firstAction' || field === 'secondAction')) ? (
                                        <Form.Select onChange={handleFieldChangeNotOrAnd(field)}
                                                     className={fieldValidation[field] ? 'is-invalid' : ''}
                                                     value={field === 'firstAction' ? firstTrigger : secondTrigger}>
                                            <option>Selectează o acțiune</option>
                                            {triggers.filter(trigger => trigger.name !== (field === 'firstAction' ? secondTrigger : firstTrigger)).map((trigger, index) => (
                                                <option key={index} value={trigger.name}>{trigger.name} ({trigger.type})</option>
                                            ))}
                                        </Form.Select>
                                    ) : selectedType === 'Start External Program' && field === 'commandLineArguments' ? (
                                        <div>
                                            <Form.Control
                                                type="text"
                                                placeholder={`Introduceți argumentele liniei de comandă`}
                                                onChange={handleFieldChange(field)}
                                                className={fieldValidation[field] ? 'is-invalid' : ''}
                                                value={triggerFields['commandLineArguments']}
                                            />
                                            {fieldValidation[field] && <div className="invalid-feedback">{fieldErrorMessage[field]}</div>}
                                        </div>
                                    ) : selectedType === 'Append String To File' && field === 'stringToAppend' ? (
                                        <div>
                                            <Form.Control
                                                type="text"
                                                placeholder={`Introduceți șirul de caractere de adăugat`}
                                                onChange={handleFieldChange(field)}
                                                className={fieldValidation[field] ? 'is-invalid' : ''}
                                                value={triggerFields['stringToAppend']}
                                            />
                                            {fieldValidation[field] && <div className="invalid-feedback">{fieldErrorMessage[field]}</div>}
                                        </div>
                                    ) : selectedType === 'Delete File' && field === 'fileToDelete' ||
                                    selectedType === 'Append String To File' && field === 'file' ||
                                    selectedType === 'Start External Program' && field === 'externalProgram' ? (
                                        <div>
                                            <Button variant="primary" onClick={handleFileChange}
                                                    className={fieldValidation['fileToDelete'] ? 'is-invalid' : ''}>
                                                Încarcă fișier
                                            </Button>
                                            <div className="file-path-container file-selected-spacing">
                                                <div>Fișierul ales: <strong>{selectedFilePath.replace(/FileDirectory/, 'Acasă')}</strong>
                                                </div>
                                            </div>
                                            {/* Display the selected file path */}
                                        </div>
                                    ) : (
                                        <Form.Control type="text" placeholder={`Introduceți ${field}`}
                                                      onChange={handleFieldChange(field)}
                                                      className={fieldValidation[field] ? 'is-invalid' : ''}/>
                                    )}
                                    {fieldValidation[field] && <div className="invalid-feedback">{field} este obligatoriu</div>}
                                </Form.Group>
                            ))}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Anulează
                        </Button>
                        <Button variant="primary" onClick={createTrigger}>
                            Adaugă
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal
                    show={showFileExplorerModal}
                    onHide={() => {
                        setShowFileExplorerModal(false); // Close the 'Select File' modal
                        setShowModal(true); // Open the 'Create Trigger' modal
                        setTriggerName(tempTriggerName); // Restore the trigger name
                        setSelectedType(tempSelectedType); // Restore the selected type
                        if (tempSelectedType === 'Append String To File') {
                            // Restore the stringToAppend
                            setTriggerFields(prevFields => ({
                                ...prevFields,
                                'stringToAppend': tempStringToAppend
                            }));
                            console.log("Restored String to Append: ", triggerFields['stringToAppend']);
                        }
                    }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Selectează un fișier</Modal.Title>
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
                            <h3>Directoare</h3>
                            {renderDirectories(directoryContent)}
                            <h3>Fișiere</h3>
                            {renderFiles(directoryContent)}
                        </Form>
                    </Modal.Body>
                </Modal>
                <Modal
                    show={showDirectoryExplorerModal}
                    onHide={() => {
                        setShowDirectoryExplorerModal(false); // Close the 'Select Directory' modal
                        setShowModal(true); // Open the 'Create Trigger' modal
                        setTriggerName(tempTriggerName); // Restore the trigger name
                        setSelectedType(tempSelectedType); // Restore the selected type
                    }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Selectează un director</Modal.Title>
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
                            <h3>Directoare</h3>
                            {renderDirectoriesForUpload(directoryContent)}
                            <h3>Fișiere</h3>
                            {renderFilesForDirectories(directoryContent)}
                        </Form>
                    </Modal.Body>
                </Modal>
                {triggers.length === 0 ? (
                    <p>Nu sunt acțiuni disponibile pentru moment.</p>
                ) : (
                    <div className="row">
                        {triggers.map((trigger) => (
                            <div key={trigger.id} className="col-lg-3">
                                <div className="card mb-3">
                                    <div className="card-body">
                                        <h5 className="card-title">{trigger.name}</h5>
                                        <p className="card-text">Tip: {actionTypeMapping[trigger.type]}</p>
                                        <p className="card-text">Descriere: {trigger.value.replace(/(DestinationPath: ).*(FileDirectory\\)/, '$1Acasă\\')}
                                        </p>
                                            <div
                                            className="position-absolute top-0 end-0"> {/* Add this div with classes */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                 fill="currentColor"
                                                 className="bi bi-trash cursor-pointer" viewBox="0 0 16 16"
                                                 onClick={() => {
                                                     setTriggerToDelete(trigger.name);
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

export default Actions;