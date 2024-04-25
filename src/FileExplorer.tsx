import React, { useEffect, useState } from 'react';
import Directory from './Directory';
import File from './File';
import Navigation from './Navigation';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import {Breadcrumb, Card, OverlayTrigger, Tooltip} from 'react-bootstrap';


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
    const [path, setPath] = useState<string[]>(['home']);
    const [showModal, setShowModal] = useState(false);
    const [directoryName, setDirectoryName] = useState('');
    const [selectedDirectory, setSelectedDirectory] = useState('');
    const [selectedFile, setSelectedFile] = useState('');
    const [showFileModal, setShowFileModal] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [isFileValid, setIsFileValid] = useState(true);

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
        const modifiedPath = path.map(dir => dir === 'home' ? 'FileDirectory' : dir).join('/');
        formData.append('path', modifiedPath);

        const response = await fetch('http://localhost:8080/addFile', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            // ... handle successful file upload
            setShowFileModal(false);
            setUploadedFile(null);
            console.log(uploadedFile);
        } else {
            console.error('Error:', await response.text());
        }
    };

    const handleAddDirectory = async () => {
        setIsSubmitted(true);
        if (directoryName === '') {
            setIsValid(false);
            return;
        }
        setIsValid(true);
        const parentDirectory = path.map(dir => dir === 'home' ? 'FileDirectory' : dir).join('/');
        const response = await fetch('http://localhost:8080/addDirectory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ directory: directoryName, parentDirectory }),
        });

        if (response.ok) {
            const updatedData = await fetch('http://localhost:8080/getDirectory')
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
            console.error('Error:', await response.text());
        }
    };

    const handleDeleteDirectory = async () => {
        const directoryToDelete = path.map(dir => dir === 'home' ? 'FileDirectory' : dir).join('/') + '/' + selectedDirectory;
        const response = await fetch(`http://localhost:8080/removeDirectory`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ directory: directoryToDelete }),
        });

        if (response.ok) {
            const updatedData = await fetch('http://localhost:8080/getDirectory')
                .then(response => response.json());

            let newCurrentDirectory = updatedData;
            for (let i = 1; i < path.length; i++) {
                newCurrentDirectory = newCurrentDirectory.children.find((dir: { name: string; }) => dir.name === path[i]) || null;
            }

            setDirectories(updatedData);
            setCurrentDirectory(newCurrentDirectory);
            setSelectedDirectory('');
        } else {
            console.error('Error:', await response.text());
        }
    };

    const handleDeleteFile = async () => {
        const fileToDelete = path.map(dir => dir === 'home' ? 'FileDirectory' : dir).join('/') + '/' + selectedFile;
        const response = await fetch(`http://localhost:8080/removeFile`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: fileToDelete }),
        });

        if (response.ok) {
            const updatedData = await fetch('http://localhost:8080/getDirectory')
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
        fetch('http://localhost:8080/getDirectory')
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
    };

    const renderDirectories = (items: DirectoryProps[]) => {
        const directories = items.filter(item => item.isDirectory);
        if (directories.length === 0) {
            return (
                <Card bg="light" text="dark" style={{ width: '18rem' }}>
                    <Card.Header>Notice</Card.Header>
                    <Card.Body>
                        <Card.Title>No Directories Found</Card.Title>
                        <Card.Text>
                            There are currently no directories in this path. Please create a new directory.
                        </Card.Text>
                    </Card.Body>
                </Card>
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
    if (files.length === 0) {
        return (
            <Card bg="light" text="dark" style={{ width: '18rem' }}>
                <Card.Header>Notice</Card.Header>
                <Card.Body>
                    <Card.Title>No Files Found</Card.Title>
                    <Card.Text>
                        There are currently no files in this directory. Please add a new file.
                    </Card.Text>
                </Card.Body>
            </Card>
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
                <div style={{marginRight: '20px'}}>
    <div style={{marginBottom: '0.5rem'}}>
        <Button variant="primary" onClick={() => setShowModal(true)}>Add Directory</Button>
    </div>
    <div style={{marginBottom: '0.5rem'}}>
        {!selectedDirectory ? (
    <OverlayTrigger
        placement="left"
        overlay={
            <Tooltip id="tooltip-disabled">
                You need to select a directory to delete first.
            </Tooltip>
        }
    >
        <span className="d-inline-block">
            <Button variant="secondary" disabled={!selectedDirectory} onClick={handleDeleteDirectory} style={{ pointerEvents: 'none' }}>
                Delete Directory
            </Button>
        </span>
    </OverlayTrigger>
) : (
    <Button variant="outline-danger" onClick={handleDeleteDirectory}>
        Delete Directory
    </Button>
)}
    </div>
    <div style={{marginBottom: '0.5rem'}}>
        <Button variant="primary" onClick={() => setShowFileModal(true)}>Add File</Button>
    </div>
    <div style={{marginBottom: '0.5rem'}}>
        {!selectedFile ? (
    <OverlayTrigger
        placement="left"
        overlay={
            <Tooltip id="tooltip-disabled">
                You need to select a file to delete first.
            </Tooltip>
        }
    >
        <span className="d-inline-block">
            <Button variant="secondary" disabled={!selectedFile} onClick={handleDeleteFile} style={{ pointerEvents: 'none' }}>
                Delete File
            </Button>
        </span>
    </OverlayTrigger>
) : (
    <Button variant="outline-danger" onClick={handleDeleteFile}>
        Delete File
    </Button>
)}
    </div>
</div>
                <Modal show={showModal} onHide={() => { setShowModal(false); setDirectoryName(''); setIsValid(true); setIsSubmitted(false); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Directory</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form>
    <Form.Group controlId="formDirectoryName">
        <Form.Label>Directory Name</Form.Label>
        <Form.Control
            type="text"
            placeholder="Enter directory name"
            value={directoryName}
            onChange={(e) => setDirectoryName(e.target.value)}
            isInvalid={!isValid && isSubmitted}
        />
        <Form.Control.Feedback type="invalid">
            Directory name is required.
        </Form.Control.Feedback>
    </Form.Group>
</Form>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => { setShowModal(false); setDirectoryName(''); setIsValid(true); setIsSubmitted(false); }}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => { handleAddDirectory(); setDirectoryName(''); }}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showFileModal} onHide={() => { setShowFileModal(false); setUploadedFile(null); setIsFileValid(true); setIsSubmitted(false); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add File</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
    <Form.Group controlId="formFileUpload">
        <Form.Label>Upload File</Form.Label>
        <Form.Control
            type="file"
            onChange={handleFileUpload}
            isInvalid={!isFileValid && isSubmitted}
        />
        <Form.Control.Feedback type="invalid">
            File is required.
        </Form.Control.Feedback>
    </Form.Group>
</Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => { setShowFileModal(false); setUploadedFile(null); setIsFileValid(true); setIsSubmitted(false); }}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={() => { handleAddFile(); setUploadedFile(null); }}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
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
                                <h2>Directories</h2>
                                {renderDirectories(currentDirectory.children)}
                                <h2>Files</h2>
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