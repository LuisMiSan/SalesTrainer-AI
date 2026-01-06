import React from 'react';

interface IconProps {
    name: string;
    className?: string;
    size?: number;
    filled?: boolean;
}

export const Icon: React.FC<IconProps> = ({ name, className = "", size = 24, filled = true }) => {
    return (
        <span 
            className={`material-symbols-rounded select-none ${className}`}
            style={{ 
                fontSize: `${size}px`,
                fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`
            }}
        >
            {name}
        </span>
    );
};