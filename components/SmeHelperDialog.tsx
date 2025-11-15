import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SmeHelperContext } from '../types';
import { geminiService } from '../services/geminiService';
import { LoadingIcon, CloseIcon, SmeHelperIcon } from './icons';

interface SmeHelperDialogProps {
  context: SmeHelperContext | null;
  onClose: () => void;
}

const SmeHelperDialog: React.FC<SmeHelperDialogProps> = ({ context, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [guidance, setGuidance] = useState('');
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 350 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    geminiService.getSmeHelperGuidance(context).then(text => {
      setGuidance(window.marked.parse(text));
      setIsLoading(false);
    });
  }, [context]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current) {
        setIsDragging(true);
        const rect = dialogRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
        setPosition({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
        });
    }
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={dialogRef}
      className="fixed z-50 w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 shadow-2xl shadow-yellow-500/10 animate-fade-in"
      style={{ top: position.y, left: position.x }}
    >
      <div 
        className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
            <SmeHelperIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">SMEPro Helper</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon className="w-5 h-5"/>
        </button>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        {isLoading ? (
            <div className="flex items-center justify-center py-8">
                <LoadingIcon className="w-8 h-8 text-slate-400"/>
            </div>
        ) : (
            <div 
                className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300"
                dangerouslySetInnerHTML={{ __html: guidance }}
            />
        )}
      </div>
    </div>
  );
};

export default SmeHelperDialog;