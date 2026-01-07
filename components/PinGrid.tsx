
import React from 'react';
import type { Pin } from '../types';
import { PinCard } from './PinCard';

interface PinGridProps {
    pins: Pin[];
    isLoading: boolean;
    loadingMessage: string;
}

const LoadingSkeleton = () => (
    <div className="relative w-full aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
    </div>
);

export const PinGrid: React.FC<PinGridProps> = ({ pins, isLoading, loadingMessage }) => {
    if (isLoading) {
        return (
            <div className="mt-10 text-center">
                 <p className="text-gray-400 mb-6">{loadingMessage || 'Generating amazing pins for you...'}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <LoadingSkeleton key={i} />)}
                </div>
            </div>
        );
    }
    
    if (pins.length === 0) {
        return null;
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-100">Your Pins Are Ready!</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                {pins.map(pin => (
                    <PinCard key={pin.id} pin={pin} />
                ))}
            </div>
        </div>
    );
};
