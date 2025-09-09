import React from 'react';

interface RatingStarsProps {
    rating: number;
    className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    className = ''
}) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className={`flex items-center ${className}`}>
            {Array.from({ length: fullStars }, (_, i) => (
                <span key={`full-${i}`} className='text-yellow-400'>
                    ★
                </span>
            ))}
            {hasHalfStar && <span className='text-yellow-400'>☆</span>}
            {Array.from({ length: emptyStars }, (_, i) => (
                <span key={`empty-${i}`} className='text-gray-300'>
                    ☆
                </span>
            ))}
            <span className='ml-2 text-sm text-gray-600'>({rating})</span>
        </div>
    );
};
