import React, { useEffect, useState } from 'react';
import Directory from './Directory';
import File from './File';
import Navigation from './Navigation';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


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

    const handleAddDirectory = async () => {
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
    };

    const handlePathClick = (index: number) => {
        const newPath = path.slice(0, index + 1);
        let newCurrentDirectory = directories;
        for (let i = 1; i < newPath.length; i++) {
            newCurrentDirectory = newCurrentDirectory?.children.find(dir => dir.name === newPath[i]) || null;
        }
        setCurrentDirectory(newCurrentDirectory);
        setPath(newPath);
    };

    const renderDirectories = (items: DirectoryProps[]) => {
        return (
            <ul className="list-group list-group-flush">
                {items
                    .filter(item => item.isDirectory)
                    .map(item => (
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
    return (
        <ul className="list-group list-group-flush">
            {items
                .filter(item => !item.isDirectory)
                .map(item => (
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
            <div style={{ display: 'flex' }}>
                <div style={{marginRight: '20px', marginTop: '20px'}}>
                    <button onClick={() => setShowModal(true)}>Add Directory</button>
                    <br/>
                    <button onClick={handleDeleteDirectory} disabled={!selectedDirectory}>Delete Directory</button>
                    <br/>
                    <button onClick={handleDeleteFile} disabled={!selectedFile}>Delete File</button>
                    <br/>
                    <button>Add File</button>
                </div>
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                        <Modal.Title>Add Directory</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formDirectoryName">
                                <Form.Label>Directory Name</Form.Label>
                                <Form.Control type="text" placeholder="Enter directory name" value={directoryName} onChange={(e) => setDirectoryName(e.target.value)} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleAddDirectory}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
                <div style={{ borderLeft: '1px solid black', paddingLeft: '20px', marginTop: '20px' }}>
                    <div>
                        {path.map((dir, index) => (
                            <span key={index} onClick={() => handlePathClick(index)}>
                        {dir}
                                {index < path.length - 1 && " / "}
                    </span>
                        ))}
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