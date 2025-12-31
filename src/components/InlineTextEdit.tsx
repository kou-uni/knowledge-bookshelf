'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Save } from '@geist-ui/icons';

interface InlineTextEditProps {
    initialValue: string;
    onSave: (newValue: string) => Promise<void>;
    placeholder?: string;
    className?: string; // For styling font size, weight, underline etc.
    type?: 'text' | 'date';
    style?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
}

export const InlineTextEdit: React.FC<InlineTextEditProps> = ({
    initialValue,
    onSave,
    placeholder = 'Click to edit',
    className = '',
    type = 'text',
    style = {},
    containerStyle = {}
}) => {
    const [value, setValue] = useState(initialValue);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(initialValue);
        setIsDirty(false);
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        setIsDirty(e.target.value !== initialValue);
    };

    const handleSave = async () => {
        if (!isDirty) return;
        setIsSaving(true);
        try {
            await onSave(value);
            setIsDirty(false);
        } catch (error) {
            console.error('Failed to save:', error);
            // Optionally reset or show error
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
            inputRef.current?.blur();
        }
    };

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', ...containerStyle }}>
            <input
                ref={inputRef}
                type={type}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
                style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--accents-2)', // Grey underline as requested
                    outline: 'none',
                    color: 'inherit',
                    font: 'inherit',
                    width: type === 'date' ? 'auto' : '100%',
                    minWidth: '50px',
                    padding: '0 2px',
                    cursor: 'text',
                    ...style // Allow overrides
                }}
            />
            {isDirty && (
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        position: 'absolute',
                        right: '-24px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--accents-5)',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.7,
                        transition: 'opacity 0.2s',
                    }}
                    title="Click to save"
                >
                    <Save size={14} />
                </button>
            )}
        </div>
    );
};
