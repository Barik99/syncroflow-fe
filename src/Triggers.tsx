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
interface TriggerTypeMapping {
    [key: string]: string;
}

const triggerTypeMapping: TriggerTypeMapping = {
    "File Existence": "Existența fișierului",
    "File Size": "Dimensiunea fișierului",
    "External Program": "Program extern",
    "Day Of Month": "Ziua lunii",
    "Time Of Day": "Ora zilei",
    "Day Of Week": "Ziua săptămânii",
    "AND": "ȘI",
    "OR": "SAU",
    "NOT": "NU"
};

interface DayOfWeekMapping {
    [key: string]: string;
}

const dayOfWeekMapping: DayOfWeekMapping = {
    "MONDAY": "Luni",
    "TUESDAY": "Marți",
    "WEDNESDAY": "Miercuri",
    "THURSDAY": "Joi",
    "FRIDAY": "Vineri",
    "SATURDAY": "Sâmbătă",
    "SUNDAY": "Duminică"
};

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
    const [showLoginToast, setShowLoginToast] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [allTriggers, setAllTriggers] = useState<Trigger[]>([]);
    const [searchTriggerType, setSearchTriggerType] = useState("");

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };


    const handleClose = () => setShowModal(false);
    const handleShow = () => {
        resetModal();
        // Reset the firstTrigger and secondTrigger states
        setFirstTrigger('Selectați un declanșator');
        setSecondTrigger('Selectați un declanșator');
        setShowModal(true);
    };

    useEffect(() => {
        if (!email) {
            console.log("User is not logged in. Skipping fetchRootDirectory API call.");
            setShowNotification(true); // Show the login toast
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
    };

    const handleFieldChangeSizeThreshold = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (value.trim() === '') {
            setFieldValidation(prev => ({...prev, 'sizeThreshold': true}));
            setFieldErrorMessage(prev => ({...prev, 'sizeThreshold': 'Acest câmp este obligatoriu'}));
        } else {
            const numValue = parseInt(value);
            if (numValue < 0) {
                setFieldValidation(prev => ({...prev, 'sizeThreshold': true}));
                setFieldErrorMessage(prev => ({...prev, 'sizeThreshold': 'Dimensiunea fișierului trebuie să fie mai mare sau egală cu 0'}));
            } else {
                setFieldValidation(prev => ({...prev, 'sizeThreshold': false}));
                setFieldErrorMessage(prev => ({...prev, 'sizeThreshold': ''}));
                setTriggerFields(prevFields => ({...prevFields, 'sizeThreshold': value}));
            }
        }
    }

    const handleFieldChangeTimeOfDay = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (value.trim() === '') {
            setFieldValidation(prev => ({...prev, [field]: true}));
            setFieldErrorMessage(prev => ({...prev, [field]: 'Acest câmp este obligatoriu'}));
        } else {
            const numValue = parseInt(value);
            if (field === 'hours' && (numValue < 0 || numValue > 23)) {
                setFieldValidation(prev => ({...prev, 'hours': true}));
                setFieldErrorMessage(prev => ({...prev, 'hours': 'Orele trebuie să fie între 0 și 23'}));
            } else if (field === 'minutes' && (numValue < 0 || numValue > 59)) {
                setFieldValidation(prev => ({...prev, 'minutes': true}));
                setFieldErrorMessage(prev => ({...prev, 'minutes': 'Minutele trebuie să fie între 0 și 59'}));
            } else {
                setFieldValidation(prev => ({...prev, [field]: false}));
                setFieldErrorMessage(prev => ({...prev, [field]: ''}));
                setTriggerFields(prevFields => ({...prevFields, [field]: value}));
            }
        }
    };

    const handleFieldChangeNotOrAnd = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setTriggerFields(prevFields => ({...prevFields, [field]: value}));
        if (field === 'firstTrigger') {
            console.log("First trigger:", value);
            console.log("Second trigger:", secondTrigger);
            setFirstTrigger(value);
            setSecondTrigger(secondTrigger);
        } else if (field === 'secondTrigger') {
            console.log("First trigger:", firstTrigger);
            console.log("Second trigger:", value);
            setSecondTrigger(value);
            setFirstTrigger(firstTrigger);
        }
    };

    const handleFieldChangeForDaysOfWeek = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setTriggerFields(prevFields => ({...prevFields, [field]: e.target.value}));
    };

    const [fieldErrorMessage, setFieldErrorMessage] = useState<{[key: string]: string}>({});

    const handleFieldChangeDayOfMonth = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        const numValue = parseInt(value);
        if (numValue < 1 || numValue > 31) {
            setFieldValidation(prev => ({...prev, 'day': true}));
            setFieldErrorMessage(prev => ({...prev, 'day': 'Ziua trebuie să fie între 1 și 31'}));
        } else {
            setFieldValidation(prev => ({...prev, 'day': false}));
            setFieldErrorMessage(prev => ({...prev, 'day': ''}));
            setTriggerFields(prevFields => ({...prevFields, 'day': value}));
        }
    };

    useEffect(() => {
        fetchTriggers();
        fetchTriggerTypes();
    }, []);

    const handleKeyPressExitStatusField = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value + e.key;
        // @ts-ignore
        if (!Number.isInteger(Number(value)) || value < 0) {
            e.preventDefault();
        }
    };

    const handleFileSelect = (fileName: string) => {
        console.log("Selected file:", fileName);
        let filePath = path.join('/') + '/' + fileName;
        filePath = filePath.replace("Acasă", "FileDirectory"); // Replace "Acasă" with "FileDirectory"
        setSelectedFilePath(filePath); // Set the selected file path
        if (tempSelectedType === 'External Program') {
            // Restore the commandLineArguments and exitStatus
            setTriggerFields(prevFields => ({
                ...prevFields,
                'externalProgram': filePath,
                'commandLineArguments': tempCommandLineArguments,
                'exitStatus': tempExitStatus
            }));
            console.log('Restored commandLineArguments:', tempCommandLineArguments); // Log the restored commandLineArguments
            console.log('Restored exitStatus:', tempExitStatus); // Log the restored exitStatus
        } else if (tempSelectedType === 'File Existence') {
            // Set the file field to the selected file path
            setTriggerFields(prevFields => ({
                ...prevFields,
                'file': filePath
            }));
        } else if (tempSelectedType === 'File Size') {
            // Restore the sizeThreshold
            setTriggerFields(prevFields => ({
                ...prevFields,
                'file': filePath,
                'sizeThreshold': tempSizeThreshold
            }));
            console.log('Restored sizeThreshold:', tempSizeThreshold); // Log the restored sizeThreshold
        }
        setTriggerName(tempTriggerName); // Restore the trigger name
        setSelectedType(tempSelectedType); // Restore the selected type
        setShowFileExplorerModal(false); // Close the 'Select File' modal
        setShowModal(true); // Re-open the 'Create Trigger' modal
    };

    const fetchTriggers = async () => {
        if (!email) {
            console.log("User is not logged in. Skipping fetchTriggers API call.");
            return;
        }

        const response = await fetch(`/api/triggers/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
            const sortedRules = data.sort((a, b) => a.name.localeCompare(b.name));
            setTriggers(sortedRules);
            setAllTriggers(sortedRules);
        } else {
            console.error('Error: Expected array from API, received:', data);
        }
    };

    const fetchTriggerTypes = async () => {
        if (!email) {
            console.log("User is not logged in. Skipping fetchTriggerTypes API call.");
            return;
        }

        const response = await fetch('/api/triggerTypes', {
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

        if (selectedType === 'File Existence' || selectedType === 'File Size' || selectedType === 'External Program') {
            console.log("Selected file path:", selectedFilePath);
            if (!selectedFilePath) {
                console.error('Error: No file selected');
                // Display an error message to the user
                setToastMessage('Fișierul nu a fost selectat pentru declanșatorul de tipul ' + selectedType);
                setShowToast(true);
                // Prevent the creation of the trigger
                return;
            }
            trigger.file = selectedFilePath.replace("Acasă", "FileDirectory");
        }

        if (selectedType === 'Day Of Month' && (!triggerFields['day'] || triggerFields['day'].trim() === '')) {
            setFieldValidation(prev => ({...prev, 'day': true}));
            setFieldErrorMessage(prev => ({...prev, 'day': 'Ziua este obligatorie'}));
            return;
        }

        if (selectedType === 'AND' || selectedType === 'OR') {
            if (firstTrigger === 'Selectați un declanșator') {
                setFieldValidation(prev => ({...prev, 'firstTrigger': true}));
                setFieldErrorMessage(prev => ({...prev, 'firstTrigger': 'Acest câmp este obligatoriu'}));
                return;
            } else {
                setFieldValidation(prev => ({...prev, 'firstTrigger': false}));
            }

            if (secondTrigger === 'Selectați un declanșator') {
                setFieldValidation(prev => ({...prev, 'secondTrigger': true}));
                setFieldErrorMessage(prev => ({...prev, 'secondTrigger': 'Acest câmp este obligatoriu'}));
                return;
            } else {
                setFieldValidation(prev => ({...prev, 'secondTrigger': false}));
            }
        } else if (selectedType === 'NOT') {
            if (triggerFields['trigger'] === 'Selectați un declanșator') {
                setFieldValidation(prev => ({...prev, 'trigger': true}));
                setFieldErrorMessage(prev => ({...prev, 'trigger': 'Acest câmp este obligatoriu'}));
                return;
            } else {
                setFieldValidation(prev => ({...prev, 'trigger': false}));
            }
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

        const response = await fetch(`/api/addTrigger/${email}`, {
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
            setToastMessage(responseText);
            setShowToast(true);
            await fetchTriggers();
        }
    };

    const handleTypeChange = (selectedOption: string) => {
        setSelectedType(selectedOption);
        if (selectedOption === "Selectați un tip") {
            resetModal();
        } else if (selectedOption === "AND") {
            // Initialize triggerFields with the fields of the selected type
            const fields = triggerTypes[selectedOption];
            let initialTriggerFields: {[key: string]: string} = {};
            for (const field in fields) {
                initialTriggerFields[field] = triggerFields[field] || '';
            }
            setTriggerFields(initialTriggerFields);
        } else if (selectedOption === "OR") {
            // Initialize triggerFields with the fields of the selected type
            const fields = triggerTypes[selectedOption];
            let initialTriggerFields: {[key: string]: string} = {};
            for (const field in fields) {
                initialTriggerFields[field] = triggerFields[field] || '';
            }
            setTriggerFields(initialTriggerFields);

            // Update the validation state for the firstTrigger and secondTrigger fields
            setFieldValidation(prev => ({...prev, 'firstTrigger': false, 'secondTrigger': false}));
        } else if (selectedOption === "NOT") {
            // Initialize triggerFields with the fields of the selected type
            const fields = triggerTypes[selectedOption];
            let initialTriggerFields: {[key: string]: string} = {};
            for (const field in fields) {
                initialTriggerFields[field] = triggerFields[field] || '';
            }
            setTriggerFields(initialTriggerFields);

            // Reset the firstTrigger and secondTrigger states
            setFirstTrigger('Selectați un declanșator');
            setSecondTrigger('Selectați un declanșator');

            // Update the validation state for the trigger field
            setFieldValidation(prev => ({...prev, 'trigger': false}));
        } else if (selectedOption === "Day Of Month" || selectedOption === "Time Of Day") {
            // Initialize triggerFields with the fields of the selected type
            const fields = triggerTypes[selectedOption];
            let initialTriggerFields: {[key: string]: string} = {};
            for (const field in fields) {
                initialTriggerFields[field] = '';
            }
            setTriggerFields(initialTriggerFields);
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
            } else if (selectedOption === "File Size") {
                // Initialize triggerFields with the fields of the selected type
                const fields = triggerTypes[selectedOption];
                let initialTriggerFields: {[key: string]: string} = {};
                for (const field in fields) {
                    initialTriggerFields[field] = '';
                }
                setTriggerFields(initialTriggerFields);

                // Reset the selected file path if the 'File Size' trigger type is selected
                setSelectedFilePath('');
            } else if (selectedOption === "External Program") {
                setSelectedFilePath(''); // Reset the selected file path
                // Initialize triggerFields with the fields of the selected type
                const fields = triggerTypes[selectedOption];
                let initialTriggerFields: {[key: string]: string} = {};
                for (const field in fields) {
                    initialTriggerFields[field] = '';
                }
                setTriggerFields(initialTriggerFields); // Reset all the fields
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
        if (selectedType === 'External Program') {
            // Store the current commandLineArguments and exitStatus
            setTempCommandLineArguments(triggerFields['commandLineArguments']);
            setTempExitStatus(triggerFields['exitStatus']);
        }
        if (selectedType === 'File Size') {
            setTempSizeThreshold(triggerFields['sizeThreshold']); // Store the current size threshold
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
        const response = await fetch(`/api/removeTrigger/${email}/${triggerToDelete}`, {
            method: 'DELETE',
        });
        const responseText = await response.text();
        if (response.ok) {
            await fetchTriggers();
            setSearchTerm(""); // Reset the search term
            setSearchTriggerType(""); // Reset the search action type
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
        return (
            <ul className="list-group list-group-flush">
                {items.filter(item => item.isDirectory).map((item, index) => (
                    <li key={item.name} className="list-group-item" onClick={() => handleDirectoryDoubleClick(item.name)}>
                        {item.name}
                    </li>
                ))}
            </ul>
        );
    };

    const renderFiles = (items: FileItem[]) => {
        return (
            <ul className="list-group list-group-flush">
                {items.filter(item => !item.isDirectory).map((item, index) => (
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
                ))}
            </ul>
        );
    };

    const handleCloseFileExplorerModal = () => {
        setShowFileExplorerModal(false); // Close the 'Select File' modal
        setShowModal(true); // Open the 'Create Trigger' modal
        setTriggerName(tempTriggerName); // Restore the trigger name
        setSelectedType(tempSelectedType); // Restore the selected type
        if (tempSelectedType === 'File Size') {
            // Restore the sizeThreshold
            setTriggerFields(prevFields => ({
                ...prevFields,
                'sizeThreshold': tempSizeThreshold
            }));
        }
    };

    const handleKeyPressMinutesField = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value + e.key;
        const zeroCount = (value.match(/0/g) || []).length;
        // @ts-ignore
        if (!Number.isInteger(Number(value)) || value < 0 || value > 59 || zeroCount > 2) {
            e.preventDefault();
        }
    };

    const handleKeyPressHoursField = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value + e.key;
        const zeroCount = (value.match(/0/g) || []).length;
        // @ts-ignore
        if (!Number.isInteger(Number(value)) || value < 0 || value > 23 || zeroCount > 2) {
            e.preventDefault();
        }
    };

    const handleKeyPressDayOfMonthField = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value + e.key;
        // @ts-ignore
        if (!Number.isInteger(Number(value)) || value < 1 || value > 31) {
            e.preventDefault();
        }
    };

    const handleSearch = () => {
        const filteredTriggers = allTriggers.filter(trigger =>
            trigger.name.includes(searchTerm) &&
            (searchTriggerType === "" || trigger.type === searchTriggerType)
        );
        setTriggers(filteredTriggers);
    };


    const handleReset = () => {
        setSearchTerm("");
        setSearchTriggerType("");
        fetchTriggers(); // presupunând că aveți o funcție similară cu fetchActions pentru declanșatori
    };

    return (
        <div>
            <Navigation/>
            {showNotification &&
                <div className="alert alert-warning" role="alert">
                    Trebuie să vă conectați pentru a vedea declanșatoarele create.
                </div>
            }
            <Toast
                className={`toast-bottom-left align-items-center text-bg-primary border-0 ${toastMessage.includes('Declașatorul a fost șters cu succes!') || toastMessage.includes('Declașatorul a fost adăugat cu succes!') ? 'text-bg-success' : 'text-bg-danger'}`}
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={5000}
                autohide
            >
                <div className="d-flex">
                    <div className="toast-body">
                        {toastMessage}
                    </div>
                    <button type="button" className="btn-close btn-close-white me-2 m-auto"
                            onClick={() => setShowToast(false)} aria-label="Close"></button>
                </div>
            </Toast>
            <div className="d-flex justify-content-center">
                <div className="search-reset-container">
                    <Form.Control
                        type="search"
                        placeholder="Caută un declanșator"
                        onChange={handleSearchChange}
                        value={searchTerm}
                        className="me-2"
                        onKeyPress={handleKeyPress}
                        maxLength={20}
                    />
                    <Form.Select
                        value={searchTriggerType}
                        onChange={(e) => setSearchTriggerType(e.target.value)}
                        className="me-2"
                    >
                        <option value="">Tip declanșator</option>
                        {Object.keys(triggerTypeMapping).map((type, index) => (
                            <option key={index} value={type}>{triggerTypeMapping[type]}</option>
                        ))}
                    </Form.Select>
                    <Button onClick={handleSearch}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                             className="bi bi-search" viewBox="0 0 16 16">
                            <path
                                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                        </svg>
                    </Button>
                    <Button className="reset-button" onClick={handleReset}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                        </svg>
                    </Button>
                </div>
            </div>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmă ștergerea</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Sunteți sigur că vreți să ștergi regula cu numele <strong>{triggerToDelete}</strong>?
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
                            delay={{show: 250, hide: 400}}
                            overlay={<Tooltip id="button-tooltip">Trebuie să vă conectați pentru a crea un
                                declanșator</Tooltip>}
                        >
                <span className="d-inline-block">
                    <Button className="btn btn-primary my-3" disabled style={{pointerEvents: 'none'}}>
                        Adaugă declanșator
                    </Button>
                </span>
                        </OverlayTrigger>
                    ) : (
                        <Button className="btn btn-primary my-3" onClick={handleShow}>
                            Adaugă declanșator
                        </Button>
                    )}
                </div>
                <Modal show={showModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Adaugă declanșator</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Nume</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Introduceți numele declanșatorului"
                                    onKeyPress={handleKeyPress}
                                    onChange={handleNameChange}
                                    maxLength={20}
                                    value={triggerName} // Set the value to triggerName
                                    className={nameValidation ? 'is-invalid' : ''}
                                />
                                {nameValidation &&
                                    <div className="invalid-feedback">Numele declanșatorului este obligatoriu</div>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Tipul declanșatorului</Form.Label>
                                <Form.Select onChange={(e) => handleTypeChange(e.target.value)}
                                             className={typeValidation ? 'is-invalid' : ''} value={selectedType}>
                                    <option>Selectați un tip</option>
                                    {Object.keys(triggerTypes).map((type, index) => (
                                        <option key={index} value={type}>{triggerTypeMapping[type]}</option>
                                    ))}
                                </Form.Select>
                                {typeValidation &&
                                    <div className="invalid-feedback">Tipul declanșatorului este obligatoriu</div>}
                            </Form.Group>
                            {selectedType && Object.keys(triggerTypes[selectedType]).map((field: string, index: number) => (
                                <Form.Group key={index} className="mb-3">
                                    <Form.Label className="label-spacing">
                                        {selectedType === 'Time Of Day' && field === 'hours' ? 'Ora zilei' :
                                            selectedType === 'Time Of Day' && field === 'minutes' ? 'Minutul zilei' :
                                                selectedType === 'Day Of Week' && field === 'day' ? 'Ziua săptămânii' :
                                                    selectedType === 'NOT' && field === 'trigger' ? 'Declanșatorul negat' :
                                                        selectedType === 'AND' && field === 'firstTrigger' ? 'Al doilea declanșator' :
                                                            selectedType === 'AND' && field === 'secondTrigger' ? 'Primul declanșator' :
                                                                selectedType === 'OR' && field === 'firstTrigger' ? 'Al doilea declanșator' :
                                                                    selectedType === 'OR' && field === 'secondTrigger' ? 'Primul declanșator' :
                                                                        selectedType === 'File Size' && field === 'sizeThreshold' ? 'Dimensiunea fișieului' :
                                                                            selectedType === 'File Size' && field === 'file' ? 'Fișierul de verificat' :
                                                                                selectedType === 'External Program' && field === 'commandLineArguments' ? 'Argumentele liniei de comandă' :
                                                                                    selectedType === 'External Program' && field === 'externalProgram' ? 'Programul extern' :
                                                                                        selectedType === 'External Program' && field === 'exitStatus' ? 'Codul de ieșire' :
                                                                                            selectedType === 'File Existence' && field === 'file' ? 'Fișierul de verificat' :
                                                                                                selectedType === 'Day Of Month' && field === 'day' ? 'Ziua lunii' : field}
                                    </Form.Label>
                                    <br/>
                                    {selectedType === 'NOT' ? (
                                        <Form.Select onChange={handleFieldChangeNotOrAnd('trigger')}
                                                     className={fieldValidation['trigger'] ? 'is-invalid' : ''}
                                                     value={triggerFields['trigger']}>
                                            <option>Selectați un declanșator</option>
                                            {triggers.map((trigger, index) => (
                                                <option key={index}
                                                        value={trigger.name}>{trigger.name} ({trigger.type})</option>
                                            ))}
                                        </Form.Select>
                                    ) : (selectedType === 'AND' && (field === 'firstTrigger' || field === 'secondTrigger')) ||
                                    (selectedType === 'OR' && (field === 'firstTrigger' || field === 'secondTrigger')) ? (
                                        <Form.Select onChange={handleFieldChangeNotOrAnd(field)}
                                                     className={fieldValidation[field] ? 'is-invalid' : ''}
                                                     value={field === 'firstTrigger' ? firstTrigger : secondTrigger}>
                                            <option>Selectați un declanșator</option>
                                            {triggers.filter(trigger => trigger.name !== (field === 'firstTrigger' ?
                                                secondTrigger : firstTrigger)).map((trigger, index) => (
                                                <option key={index}
                                                        value={trigger.name}>{trigger.name} ({trigger.type})</option>
                                            ))}
                                        </Form.Select>
                                    ) : selectedType === 'Day Of Week' && field === 'day' ? (
                                        <Form.Select onChange={handleFieldChangeForDaysOfWeek(field)}
                                                     className={fieldValidation[field] ? 'is-invalid' : ''}>
                                            <option>Selectați o zi</option>
                                            <option value="MONDAY">Luni</option>
                                            <option value="TUESDAY">Marți</option>
                                            <option value="WEDNESDAY">Miercuri</option>
                                            <option value="THURSDAY">Joi</option>
                                            <option value="FRIDAY">Vineri</option>
                                            <option value="SATURDAY">Sâmbătă</option>
                                            <option value="SUNDAY">Duminică</option>
                                        </Form.Select>
                                    ) : selectedType === 'Time Of Day' && field === 'hours' ? (
                                        <div>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                max="59"
                                                placeholder={`Introduceți ora`}
                                                onChange={handleFieldChangeTimeOfDay(field)}
                                                onKeyPress={handleKeyPressHoursField}
                                                className={fieldValidation[field] ? 'is-invalid' : ''}
                                            />
                                            {fieldValidation['hours'] &&
                                                <div className="invalid-feedback">{fieldErrorMessage[field]}</div>}
                                        </div>
                                    ) : selectedType === 'Time Of Day' && field === 'minutes' ? (
                                        <div>
                                            <Form.Control
                                                type="number"
                                                min="0"
                                                max="59"
                                                placeholder={`Introduceți minutele`}
                                                onChange={handleFieldChangeTimeOfDay(field)}
                                                onKeyPress={handleKeyPressMinutesField}
                                                className={fieldValidation[field] ? 'is-invalid' : ''}
                                                value={triggerFields['minutes']}
                                            />
                                            {fieldValidation['minutes'] &&
                                                <div className="invalid-feedback">{fieldErrorMessage[field]}</div>}
                                        </div>
                                    ) : selectedType === 'Day Of Month' && field === 'day' ? (
                                        <div>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                max="31"
                                                placeholder={`Introduceți ziua lunii`}
                                                onChange={handleFieldChangeDayOfMonth}
                                                onKeyPress={handleKeyPressDayOfMonthField}
                                                className={fieldValidation[field] ? 'is-invalid' : ''}
                                                value={triggerFields['day']}
                                            />
                                            {fieldValidation[field] &&
                                                <div className="invalid-feedback">{fieldErrorMessage[field]}</div>}
                                        </div>
                                    ) : selectedType === 'File Size' && field === 'sizeThreshold' ? (
                                        <div>
                                            <Form.Control type="number" min="0"
                                                          placeholder={`Introduceți dimensiunea fișierului`}
                                                          onChange={handleFieldChangeSizeThreshold}
                                                          className={fieldValidation[field] ? 'is-invalid' : ''}
                                                          value={triggerFields['sizeThreshold']}
                                            />
                                            {fieldValidation[field] &&
                                                <div className="invalid-feedback">{fieldErrorMessage[field]}</div>}
                                        </div>
                                    ) : selectedType === 'External Program' && field === 'exitStatus' ? (
                                        <div>
                                            <Form.Control
                                                type="number"
                                                placeholder={`Introduceți codul de ieșire`}
                                                onChange={handleFieldChange(field)}
                                                onKeyPress={handleKeyPressExitStatusField}
                                                className={fieldValidation[field] ? 'is-invalid' : ''}
                                                value={triggerFields['exitStatus']}
                                            />
                                            {fieldValidation[field] &&
                                                <div className="invalid-feedback">{fieldErrorMessage[field]}</div>}
                                        </div>
                                    ) : selectedType === 'External Program' && field === 'commandLineArguments' ? (
                                        <div>
                                            <Form.Control
                                                type="text"
                                                placeholder={`Introduceți argumentele liniei de comandă`}
                                                onChange={handleFieldChange(field)}
                                                className={fieldValidation[field] ? 'is-invalid' : ''}
                                                value={triggerFields['commandLineArguments']}
                                            />
                                            {fieldValidation[field] &&
                                                <div className="invalid-feedback">{fieldErrorMessage[field]}</div>}
                                        </div>
                                    ) : selectedType === 'File Existence' && field === 'file' || selectedType === 'File Size' && field === 'file' || selectedType === 'External Program' && field === 'externalProgram' ? (
                                        <div>
                                            <Button variant="primary" onClick={handleFileChange}
                                                    className={fieldValidation['file'] ? 'is-invalid' : ''}>
                                                Încarcă fișier
                                            </Button>
                                            <div className="file-path-container file-selected-spacing">
                                                <div>Fișierul
                                                    ales: <strong>{selectedFilePath.replace(/FileDirectory/, 'Acasă')}</strong>
                                                </div>
                                            </div>
                                            {/* Display the selected file path */}
                                        </div>
                                    ) : (
                                        <Form.Control type="text" placeholder={`Introduceți ${field}`}
                                                      onChange={handleFieldChange(field)}
                                                      className={fieldValidation[field] ? 'is-invalid' : ''}/>
                                    )}
                                    {fieldValidation[field] &&
                                        <div className="invalid-feedback">{field} este obligatoriu</div>}
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
                <Modal show={showFileExplorerModal} onHide={handleCloseFileExplorerModal}>
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
                            <h3>Foldere</h3>
                            {renderDirectories(directoryContent)}
                            <h3>Fișiere</h3>
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
                                        <p className="card-text">Tip: {triggerTypeMapping[trigger.type]}</p>
                                        <p className="card-text">
                                            Descriere: {
                                            trigger.value
                                                .replace(/(folderul |fișierului |extern ).*(FileDirectory\\)/, '$1Acasă\\')
                                                .split(' ')
                                                .map(word => dayOfWeekMapping[word.toUpperCase()] || word)
                                                .join(' ')
                                        }
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

export default Triggers;