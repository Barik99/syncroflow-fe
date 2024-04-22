import React, { useState } from 'react';
import File from './File';

interface DirectoryProps {
    name: string;
    contents: any[];
    onDelete: () => void;
}

const Directory: React.FC<DirectoryProps> = ({ name, contents, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div>
            <button onClick={handleToggle}>{isExpanded ? '-' : '+'}</button>
            {name}
            <button onClick={onDelete}>Delete</button>
            {isExpanded && <div style={{ marginLeft: '20px' }}>{contents}</div>}
        </div>
    );
}

export default Directory;