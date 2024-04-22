import React, { useEffect, useState } from 'react';
import Directory from './Directory';
import File from './File';
import Navigation from './Navigation';

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

    const handleDirectoryClick = (directory: DirectoryProps) => {
        setCurrentDirectory(directory);
        setPath(prevPath => [...prevPath, directory.name]);
    };

    const renderDirectory = (directory: DirectoryProps) => {
        return (
            <div key={directory.path} onClick={() => handleDirectoryClick(directory)}>
                {directory.name}
            </div>
        );
    };

    const renderGrid = (items: DirectoryProps[], isDirectory: boolean) => {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                {items.filter(item => item.isDirectory === isDirectory).map(item => (
                    <div key={item.path}>
                        {isDirectory ? (
                            <div onClick={() => handleDirectoryClick(item)}>
                                {item.name}
                            </div>
                        ) : (
                            <div>
                                {item.name}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
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

    return (
        <div>
            <Navigation />
            <div style={{ display: 'flex' }}>
                <div style={{ marginRight: '20px', marginTop: '20px' }}>
                    <button>Add Directory</button>
                    <br />
                    <button>Add File</button>
                </div>
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
                                {renderGrid(currentDirectory.children, true)}
                                <h2>Files</h2>
                                {renderGrid(currentDirectory.children, false)}
                            </>
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
}

export default FileExplorer;