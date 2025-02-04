import React, { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  disabled?: boolean;
  inputClassName?: string;
  placeholder?: string;
  autoEdit?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  className = '',
  disabled = false,
  inputClassName = '',
  placeholder = 'Enter text...',
  autoEdit = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update text when value prop changes
  useEffect(() => {
    setText(value);
  }, [value]);

  // Handle autoEdit prop changes
  useEffect(() => {
    if (autoEdit && !disabled && !isEditing) {
      setIsEditing(true);
    }
  }, [autoEdit, disabled, isEditing]);

  // Auto-focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEditing &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleSubmit();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  const handleSubmit = () => {
    if (disabled) return;
    
    const trimmedText = text.trim();
    // Always call onSave with the current text, even if unchanged
    onSave(trimmedText || value);
    setIsEditing(false);
    setText(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setText(value);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && !isEditing) {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <div ref={containerRef} className="relative" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSubmit}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            bg-gray-700 text-white rounded-md px-3 py-1.5
            border-2 border-indigo-500
            outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50
            shadow-lg shadow-indigo-500/20
            transition-all duration-200
            w-full min-w-[120px]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${inputClassName}
          `}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} onClick={handleClick}>
      <h3
        className={`
          cursor-pointer
          hover:bg-gray-700/50 
          rounded px-2 py-1 -mx-2
          transition-colors duration-200
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${className}
        `}
      >
        {value}
      </h3>
    </div>
  );
};