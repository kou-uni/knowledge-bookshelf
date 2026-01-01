'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Something went wrong!</h2>
            <p style={{ color: '#888', marginBottom: '20px' }}>{error.message}</p>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                style={{
                    padding: '10px 20px',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Try again
            </button>
        </div>
    );
}
