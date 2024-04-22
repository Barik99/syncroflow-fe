import React from 'react';

interface FileProps {
    name: string;
    onDelete: () => void;
}

const File: React.FC<FileProps> = ({ name, onDelete }) => {
    return (
        <div>
            {name}
            <button onClick={onDelete}>Delete</button>
        </div>
    );
}

export default File;