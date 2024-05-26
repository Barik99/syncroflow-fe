import React, { useEffect, useState } from 'react';
import Directory from './Directory';
import File from './File';
import Navigation from './Navigation';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {Breadcrumb, Card, OverlayTrigger, Toast, Tooltip} from 'react-bootstrap';


interface DirectoryProps {
    path: string;
    children: DirectoryProps[];
    name: string;
    isDirectory: boolean;
}

const FileExplorer: React.FC = () => {
    const [directories, setDirectories] = useState<DirectoryProps | null>(null);
    const [currentDirectory, setCurrentDirectory] = useState<DirectoryProps | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [path, setPath] = useState<string[]>(['Acasă']);
    const [showModal, setShowModal] = useState(false);
    const [directoryName, setDirectoryName] = useState('');
    const [selectedDirectory, setSelectedDirectory] = useState('');
    const [selectedFile, setSelectedFile] = useState('');
    const [showFileModal, setShowFileModal] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [isFileValid, setIsFileValid] = useState(true);
    const [showNoDirectoriesAlert, setShowNoDirectoriesAlert] = useState(true);
    const [showNoFilesAlert, setShowNoFilesAlert] = useState(true);
    const [showDeleteDirectoryModal, setShowDeleteDirectoryModal] = useState(false);
    const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setUploadedFile(event.target.files[0]);
        }
    };

    const handleAddFile = async () => {
        setIsSubmitted(true);
        if (!uploadedFile) {
            setIsFileValid(false);
            return;
        }
        setIsFileValid(true);
        if (!uploadedFile) {
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadedFile);
        const modifiedPath = path.map(dir => dir === 'Acasă' ? 'FileDirectory' : dir).join('/');
        formData.append('path', modifiedPath);

        const response = await fetch('/api/addFile', {
            method: 'POST',
            body: formData,
        });

        const message = await response.text();

        if (response.ok) {
            setShowToast(true);
            setToastMessage(message);

            const updatedData = await fetch('/api/getDirectory')
                .then(response => response.json());

            let newCurrentDirectory = updatedData;
            for (let i = 1; i < path.length; i++) {
                newCurrentDirectory = newCurrentDirectory.children.find((dir: { name: string; }) => dir.name === path[i]) || null;
            }

            setDirectories(updatedData);
            setCurrentDirectory(newCurrentDirectory);
            setShowFileModal(false);
            setUploadedFile(null);
        } else {
            setShowToast(true);
            setToastMessage(`Error: ${message}`);
        }
    };

    const handleAddDirectory = async () => {
        setIsSubmitted(true);
        if (directoryName === '') {
            setIsValid(false);
            return;
        }
        setIsValid(true);
        const parentDirectory = path.map(dir => dir === 'Acasă' ? 'FileDirectory' : dir).join('/');
        const response = await fetch('/api/addDirectory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ directory: directoryName, parentDirectory }),
        });

        const message = await response.text();

        if (response.ok) {
            setShowToast(true);
            setToastMessage(message);

            const updatedData = await fetch('/api/getDirectory')
                .then(response => response.json());

            let newCurrentDirectory = updatedData;
            for (let i = 1; i < path.length; i++) {
                newCurrentDirectory = newCurrentDirectory.children.find((dir: { name: string; }) => dir.name === path[i]) || null;
            }

            setDirectories(updatedData);
            setCurrentDirectory(newCurrentDirectory);
            setShowModal(false); // Close the modal
            setDirectoryName(''); // Clear the name field
        } else {
            setShowToast(true);
            setToastMessage(`Error: ${message}`);
        }
    };

    const handleDeleteDirectoryConfirmation = async () => {
        await handleDeleteDirectory();
        setShowDeleteDirectoryModal(false);
    };

    const handleDeleteDirectory = async () => {
        const directoryToDelete = path.map(dir => dir === 'Acasă' ? 'FileDirectory' : dir).join('/') + '/' + selectedDirectory;
        const response = await fetch(`/api/removeDirectory`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ directory: directoryToDelete }),
        });

        const message = await response.text();

        if (response.ok) {
            setShowToast(true);
            setToastMessage(message);

            const updatedData = await fetch('/api/getDirectory')
                .then(response => response.json());

            let newCurrentDirectory = updatedData;
            for (let i = 1; i < path.length; i++) {
                newCurrentDirectory = newCurrentDirectory.children.find((dir: { name: string; }) => dir.name === path[i]) || null;
            }

            setDirectories(updatedData);
            setCurrentDirectory(newCurrentDirectory);
            setSelectedDirectory('');
        } else {
            setShowToast(true);
            setToastMessage(`Error: ${message}`);
        }
    };

    const handleDeleteFileConfirmation = async () => {
        const fileToDelete = path.map(dir => dir === 'Acasă' ? 'FileDirectory' : dir).join('/') + '/' + selectedFile;
        const response = await fetch(`/api/removeFile`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: fileToDelete }),
        });

        const message = await response.text();

        if (response.ok) {
            setShowToast(true);
            setToastMessage(message);

            const updatedData = await fetch('/api/getDirectory')
                .then(response => response.json());

            let newCurrentDirectory = updatedData;
            for (let i = 1; i < path.length; i++) {
                newCurrentDirectory = newCurrentDirectory.children.find((dir: { name: string; }) => dir.name === path[i]) || null;
            }

            setDirectories(updatedData);
            setCurrentDirectory(newCurrentDirectory);
            setSelectedFile('');
        } else {
            setShowToast(true);
            setToastMessage(`Error: ${message}`);
        }

        setShowDeleteFileModal(false);
    };

    const handleDeleteFile = async () => {
        const fileToDelete = path.map(dir => dir === 'Acasă' ? 'FileDirectory' : dir).join('/') + '/' + selectedFile;
        const response = await fetch(`/api/removeFile`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: fileToDelete }),
        });

        if (response.ok) {
            const updatedData = await fetch('/api/getDirectory')
                .then(response => response.json());

            let newCurrentDirectory = updatedData;
            for (let i = 1; i < path.length; i++) {
                newCurrentDirectory = newCurrentDirectory.children.find((dir: { name: string; }) => dir.name === path[i]) || null;
            }

            setDirectories(updatedData);
            setCurrentDirectory(newCurrentDirectory);
            setSelectedFile('');
        } else {
            console.error('Error:', await response.text());
        }
    };

    useEffect(() => {
        fetch('/api/getDirectory')
            .then(response => response.json())
            .then(data => {
                setDirectories(data);
                setCurrentDirectory(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error:', error);
                setIsLoading(false);
            });
    }, []);

    const handleDirectorySelect = (directoryName: string) => {
    if (directoryName === selectedDirectory) {
        setSelectedDirectory('');
    } else {
        setSelectedDirectory(directoryName);
    }
};

    const handleFileSelect = (fileName: string) => {
        if (fileName === selectedFile) {
            setSelectedFile('');
        } else {
            setSelectedFile(fileName);
        }
    };

    const handleDirectoryClick = (directory: DirectoryProps) => {
        setCurrentDirectory(directory);
        setPath(prevPath => [...prevPath, directory.name]);
        setSelectedDirectory(''); // Deselect the directory
        setSelectedFile(''); // Deselect the file
        setShowNoDirectoriesAlert(true); // Show the alert again
        setShowNoFilesAlert(true); // Show the alert again
    };

    const handlePathClick = (index: number) => {
        const newPath = path.slice(0, index + 1);
        let newCurrentDirectory = directories;
        for (let i = 1; i < newPath.length; i++) {
            newCurrentDirectory = newCurrentDirectory?.children.find(dir => dir.name === newPath[i]) || null;
        }
        setCurrentDirectory(newCurrentDirectory);
        setPath(newPath);

        // If the clicked directory is different from the current directory, deselect the file
        if (newPath[newPath.length - 1] !== path[path.length - 1]) {
            setSelectedDirectory('');
            setSelectedFile('');
        }
        setShowNoDirectoriesAlert(true); // Show the alert again
        setShowNoFilesAlert(true); // Show the alert again
    };

    const renderDirectories = (items: DirectoryProps[]) => {
        const directories = items.filter(item => item.isDirectory);
        if (directories.length === 0  && showNoDirectoriesAlert) {
            return (
                <div className="alert alert-primary d-flex align-items-center" role="alert">
                    <div className="me-auto d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16"
                             role="img" aria-label="Warning:" style={{width: '20px', height: '20px'}}>
                            <path
                                d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </svg>
                        <div>
                            Nu s-au găsit foldere
                        </div>
                    </div>
                    <button type="button" className="btn btn-close"
                            onClick={() => setShowNoDirectoriesAlert(false)}></button>
                </div>
            );
        }

        return (
            <ul className="list-group list-group-flush">
                {directories.map(item => (
                    <li key={item.path} className="list-group-item" onDoubleClick={() => handleDirectoryClick(item)}>
                        <input
                            className="form-check-input me-1"
                            type="checkbox"
                            name="listGroupCheckbox"
                            value={item.name}
                            id={item.name}
                            checked={selectedDirectory === item.name}
                            onChange={() => handleDirectorySelect(item.name)}
                        />
                        <label className="form-check-label" htmlFor={item.name}>
                            {item.name}
                        </label>
                    </li>
                ))}
            </ul>
        );
    };

    const renderFiles = (items: DirectoryProps[]) => {
        const files = items.filter(item => !item.isDirectory);
        if (files.length === 0 && showNoFilesAlert) {
            return (
                <div className="alert alert-primary d-flex align-items-center" role="alert">
                    <div className="me-auto d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             className="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16"
                             role="img" aria-label="Warning:" style={{width: '20px', height: '20px'}}>
                            <path
                                d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                        </svg>
                        <div>
                            Nu s-au găsit fișiere
                        </div>
                    </div>
                    <button type="button" className="btn btn-close" onClick={() => setShowNoFilesAlert(false)}></button>
                </div>
            );
        }

        return (
            <ul className="list-group list-group-flush">
                {files.map(item => (
                    <li key={item.path} className="list-group-item">
                        <input
                            className="form-check-input me-1"
                            type="checkbox"
                            name="listGroupCheckbox"
                            value={item.name}
                            id={item.name}
                            checked={selectedFile === item.name}
                            onChange={() => handleFileSelect(item.name)}
                        />
                        <label className="form-check-label" htmlFor={item.name}>
                            {item.name}
                        </label>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            <Navigation />
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh'}}>
                <div style={{marginRight: '20px'}} className="hide-on-mobile">
    <div style={{marginBottom: '0.5rem'}}>
        <Button variant="primary" onClick={() => setShowModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-folder-plus me-2" viewBox="0 0 16 16">
                <path d="m.5 3 .04.87a2 2 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2m5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19q-.362.002-.683.12L1.5 2.98a1 1 0 0 1 1-.98z"/>
                <path d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5"/>
            </svg>
            Adaugă Folder
        </Button>
    </div>
    <div style={{marginBottom: '0.5rem'}}>
        {!selectedDirectory ? (
            <OverlayTrigger
                placement="left"
                overlay={
                    <Tooltip id="tooltip-disabled">
                        Selectați un folder pentru a-l șterge.
                    </Tooltip>
                }
            >
        <span className="d-inline-block">
            <Button variant="danger" disabled={!selectedDirectory} onClick={handleDeleteDirectory} style={{ pointerEvents: 'none' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-folder-x me-2" viewBox="0 0 16 16">
                    <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0 0 13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91H9v1H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zm6.339-1.577A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                    <path d="M11.854 10.146a.5.5 0 0 0-.707.708L12.293 12l-1.146 1.146a.5.5 0 0 0 .707.708L13 12.707l1.146 1.147a.5.5 0 0 0 .708-.708L13.707 12l1.147-1.146a.5.5 0 0 0-.707-.708L13 11.293z"/>
                </svg>
                Șterge Folder
            </Button>
        </span>
            </OverlayTrigger>
        ) : (
            <Button variant="danger" onClick={() => setShowDeleteDirectoryModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-folder-x me-2" viewBox="0 0 16 16">
                    <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0 0 13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91H9v1H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zm6.339-1.577A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                    <path d="M11.854 10.146a.5.5 0 0 0-.707.708L12.293 12l-1.146 1.146a.5.5 0 0 0 .707.708L13 12.707l1.146 1.147a.5.5 0 0 0 .708-.708L13.707 12l1.147-1.146a.5.5 0 0 0-.707-.708L13 11.293z"/>
                </svg>
                Șterge Folder
            </Button>
        )}
    </div>
    <div style={{marginBottom: '0.5rem'}}>
        <div style={{marginBottom: '0.5rem'}}>
            <Button variant="primary" onClick={() => setShowFileModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                     className="bi bi-file-earmark-plus me-2" viewBox="0 0 16 16">
                    <path
                        d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5"/>
                    <path
                        d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
                </svg>
                Adaugă Fișier
            </Button>
        </div>
    </div>
                    <div style={{marginBottom: '0.5rem'}}>
                        {!selectedFile ? (
                            <OverlayTrigger
                                placement="left"
                                overlay={
                                    <Tooltip id="tooltip-disabled">
                                        Selectați un fișier pentru a-l șterge.
                                    </Tooltip>
                                }
                            >
        <span className="d-inline-block">
            <Button variant="danger" disabled={!selectedFile} onClick={handleDeleteFile}
                    style={{pointerEvents: 'none'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-file-earmark-x me-2" viewBox="0 0 16 16">
                    <path d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708L8 8.293z"/>
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                </svg>
                Șterge Fișier
            </Button>
        </span>
            </OverlayTrigger>
        ) : (
                <Button variant="danger" onClick={() => setShowDeleteFileModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-file-earmark-x me-2" viewBox="0 0 16 16">
                    <path d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .708.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.708-.708L8 8.293z"/>
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                </svg>
                Șterge Fișier
            </Button>
        )}
    </div>
</div>

                <Modal show={showModal} onHide={() => { setShowModal(false); setDirectoryName(''); setIsValid(true); setIsSubmitted(false); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Adaugă folder</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Directorul va fi adaugat la locația: <strong>{path.join('/')}</strong></p>
                        <Form>
                            <Form.Group controlId="formDirectoryName">
                                <Form.Label>Nume folder</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Introduceți numele folderului"
                                    value={directoryName}
                                    onChange={(e) => setDirectoryName(e.target.value)}
                                    isInvalid={!isValid && isSubmitted}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Numele folderului este obligatoriu.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => { setShowModal(false); setDirectoryName(''); setIsValid(true); setIsSubmitted(false); }}>
                            Anulează
                        </Button>
                        <Button variant="primary" onClick={() => { handleAddDirectory(); setDirectoryName(''); }}>
                            Adaugă
                        </Button>
                    </Modal.Footer>
                </Modal>



                <Modal show={showFileModal} onHide={() => { setShowFileModal(false); setUploadedFile(null); setIsFileValid(true); setIsSubmitted(false); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Adaugă fișier</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Fișierul va fi adaugat la locația: <strong>{path.join('/')}</strong></p>
                        <Form>
                            <Form.Group controlId="formFileUpload">
                                <Form.Label>Încărcați fișier</Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={handleFileUpload}
                                    isInvalid={!isFileValid && isSubmitted}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Fișierul este obligatoriu.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => { setShowFileModal(false); setUploadedFile(null); setIsFileValid(true); setIsSubmitted(false); }}>
                            Anulează
                        </Button>
                        <Button variant="primary" onClick={() => { handleAddFile(); setUploadedFile(null); }}>
                            Adaugă
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showDeleteDirectoryModal} onHide={() => setShowDeleteDirectoryModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ștergere Folder</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Sunteți sigur că doriți să ștergeți acest folder?
                        <br/>
                        Locație: <strong>{path.join('/')}/{selectedDirectory}</strong>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteDirectoryModal(false)}>
                            Anulează
                        </Button>
                        <Button variant="danger" onClick={handleDeleteDirectoryConfirmation}>
                            Șterge
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showDeleteFileModal} onHide={() => setShowDeleteFileModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ștergere fișier</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Sunteți sigur că doriți să ștergeți acest fișier?
                        <br/>
                        Locație: <strong>{path.join('/')}/{selectedFile}</strong>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteFileModal(false)}>
                            Anulează
                        </Button>
                        <Button variant="danger" onClick={handleDeleteFileConfirmation}>
                            Șterge
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Toast
                    className={`toast-bottom-left align-items-center text-bg-primary border-0 ${toastMessage.includes('Fișierul a fost șters cu succes!') || 
                    toastMessage.includes('Fișierul a fost încărcat cu succes!') || toastMessage.includes('Folderul a fost creat cu succes!') || 
                    toastMessage.includes('Folderul a fost șters cu succes!') ? 'text-bg-success' : 'text-bg-danger'}`}
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

                <div style={{borderLeft: '1px solid black', paddingLeft: '20px', marginTop: '20px'}}>
                    <div>
                        <Breadcrumb>
                            {path.map((dir, index) => (
                                <Breadcrumb.Item key={index} active={index === path.length - 1}
                                                 onClick={() => handlePathClick(index)}>
                                    {dir}
                                </Breadcrumb.Item>
                            ))}
                        </Breadcrumb>
                    </div>
                    <div className="d-sm-block d-md-none">
                        <Button variant="primary" onClick={() => setShowModal(true)} className="me-3 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                                 className="bi bi-folder-plus me-2" viewBox="0 0 16 16">
                                <path
                                    d="m.5 3 .04.87a2 2 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2m5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19q-.362.002-.683.12L1.5 2.98a1 1 0 0 1 1-.98z"/>
                                <path
                                    d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5"/>
                            </svg>
                            Adaugă Folder
                        </Button>
                        <Button variant="danger" disabled={!selectedDirectory} onClick={() => setShowDeleteDirectoryModal(true)} className="me-4 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                                 className="bi bi-folder-x me-2" viewBox="0 0 16 16">
                                <path
                                    d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.265-2.91A1 1 0 0 0 13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91H9v1H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zm6.339-1.577A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z"/>
                                <path
                                    d="M11.854 10.146a.5.5 0 0 0-.707.708L12.293 12l-1.146 1.146a.5.5 0 0 0 .707.708L13 12.707l1.146 1.147a.5.5 0 0 0 .708-.708L13.707 12l1.147-1.146a.5.5 0 0 0-.707-.708L13 11.293z"/>
                            </svg>
                            Șterge Folder
                        </Button>
                        <Button variant="primary" onClick={() => setShowFileModal(true)} className="me-4 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                                 className="bi bi-file-earmark-plus me-2" viewBox="0 0 16 16">
                                <path
                                    d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5"/>
                                <path
                                    d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                            </svg>
                            Adaugă Fișier
                        </Button>
                        <Button variant="danger" disabled={!selectedFile} onClick={() => setShowDeleteFileModal(true)} className="mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                                 className="bi bi-file-earmark-x me-2" viewBox="0 0 16 16">
                                <path
                                    d="M6.854 7.146a.5.5 0 1 0-.708.708L7.293 9l-1.147 1.146a.5.5 0 0 0 .707.708L8 9.707l1.146 1.147a.5.5 0 0 0 .708-.708L8.707 9l1.147-1.146a.5.5 0 0 0-.707-.708L8 8.293z"/>
                                <path
                                    d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                            </svg>
                            Șterge Fișier
                        </Button>
                    </div>

                    {isLoading ? (
                        <div id="loading">
                            <div className="spinner">
                                <div className="bounce1"></div>
                                <div className="bounce2"></div>
                                <div className="bounce3"></div>
                            </div>
                        </div>
                    ) : (
                        currentDirectory ? (
                            <>
                                <h2 className="text-black">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                                         className="bi bi-folder-fill me-2" viewBox="0 0 16 16"
                                         style={{verticalAlign: 'text-bottom'}}>
                                        <path
                                            d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"/>
                                    </svg>
                                    Foldere
                                </h2>
                                {renderDirectories(currentDirectory.children)}
                                <h2 className="text-black mt-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor"
                                         className="bi bi-file-earmark me-2" viewBox="0 0 16 16"
                                         style={{verticalAlign: 'text-bottom'}}>
                                        <path
                                            d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
                                    </svg>
                                    Fișiere
                                </h2>
                                {renderFiles(currentDirectory.children)}
                            </>
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
}

export default FileExplorer;