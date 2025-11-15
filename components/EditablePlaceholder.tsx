import React, { useState, useEffect, useRef } from 'react';

interface EditablePlaceholderProps {
  placeholderKey: string;
  initialValue: string;
  onValueChange: (key: string, value: string) => void;
}

const EditablePlaceholder: React.FC<EditablePlaceholderProps> = ({ placeholderKey, initialValue, onValueChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onValueChange(placeholderKey, value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="bg-slate-700 text-yellow-300 px-1 py-0 rounded outline-none ring-2 ring-cyan-500"
        size={value.length > 10 ? value.length : 15}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="text-yellow-300 font-mono border-b border-dashed border-yellow-400/50 cursor-pointer hover:bg-yellow-400/10 px-1 rounded-sm"
      title={`Click to edit ${placeholderKey}`}
    >
      {`{{${value}}}`}
    </span>
  );
};

export default EditablePlaceholder;