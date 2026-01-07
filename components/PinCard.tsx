
import React from 'react';
import type { Pin } from '../types';

interface PinCardProps {
    pin: Pin;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const PinCard: React.FC<PinCardProps> = ({ pin }) => {
    const fileName = `${pin.prompt.slice(0, 20).replace(/\s/g, '_') || 'generated_pin'}.png`;

    return (
        <div className="group relative rounded-lg overflow-hidden shadow-lg bg-gray-800 border border-gray-700">
            <div className="w-full aspect-[9/16]">
                <img src={pin.url} alt={pin.prompt} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end p-2">
                 <a
                    href={pin.url}
                    download={fileName}
                    className="w-full text-center py-2 px-3 rounded-md text-sm font-semibold bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-700 transform group-hover:scale-105"
                >
                    <DownloadIcon />
                    Download
                </a>
            </div>
        </div>
    );
};
