
import React from 'react';

const Step = ({ number, text }: { number: number; text: string }) => (
    <div className="flex items-center">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-sm mr-2">{number}</span>
        <span className="text-gray-300">{text}</span>
    </div>
);

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-100">Pin<span className="text-rose-500">Made</span></h1>
            <p className="mt-2 text-lg text-gray-400">AI-Powered Pinterest Pin Generator</p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-8 text-sm">
                <Step number={1} text="Enter Topic or URL" />
                <span className="hidden sm:inline text-gray-600">→</span>
                <Step number={2} text="Generate Pins" />
                <span className="hidden sm:inline text-gray-600">→</span>
                <Step number={3} text="Download" />
            </div>
        </header>
    );
};
