import React, { useState, useRef, useEffect } from 'react';
import { Part, PartSelection } from '../types';
import { LinkIcon, PencilIcon, Trash2Icon } from './icons';

interface PartRowProps {
  part: Part;
  index: number;
  onSelectionChange: (index: number, selection: PartSelection) => void;
  onUpdate: (index: number, field: keyof Part, value: number) => void;
  onDelete: (index: number) => void;
  formatCurrency: (amount: number) => string;
}

const EditablePrice: React.FC<{value: number, onSave: (newValue: number) => void, formatCurrency: (amount: number) => string}> = ({ value, onSave, formatCurrency }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(String(value));
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    const handleSave = () => {
        const numericValue = parseInt(currentValue, 10);
        if (!isNaN(numericValue) && numericValue !== value) {
            onSave(numericValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentValue(String(value));
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="font-semibold text-gray-900 bg-gray-100 rounded-md p-1 w-28 text-left"
                style={{ direction: 'ltr' }}
            />
        );
    }

    return (
        <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors" onClick={() => setIsEditing(true)}>
            {formatCurrency(value)}
        </span>
    );
}


const PartRow: React.FC<PartRowProps> = ({ part, index, onSelectionChange, onUpdate, onDelete, formatCurrency }) => {
  
  const getButtonClass = (selectionType: PartSelection) => {
    return part.selection === selectionType
      ? 'bg-indigo-600 text-white'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-gray-800 text-lg">{part.name}</h4>
        <div className="flex items-center space-i-3 text-gray-500">
            <a
                href={part.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600"
                title="مشاهده در سایت فروشنده"
            >
                <LinkIcon className="w-5 h-5" />
            </a>
            <button
                onClick={() => onDelete(index)}
                className="hover:text-red-600"
                title="حذف قطعه"
            >
                <Trash2Icon className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
        {[
          { label: 'قیمت نو', field: 'newPrice', value: part.newPrice },
          { label: 'قیمت کارکرده', field: 'usedPrice', value: part.usedPrice },
          { label: 'هزینه تعمیر', field: 'repairCost', value: part.repairCost },
        ].map(({label, field, value}) => (
            <div key={field} className="text-gray-600 flex items-center group">
                 {label}:
                <div className="flex items-center mr-auto">
                    <EditablePrice value={value} onSave={(newValue) => onUpdate(index, field as keyof Part, newValue)} formatCurrency={formatCurrency} />
                    <PencilIcon className="w-3 h-3 ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        ))}
      </div>

      <div className="flex items-center justify-start space-i-2">
        <span className="text-sm font-medium text-gray-700 ml-2">انتخاب برای محاسبه:</span>
        <div className="flex rounded-lg p-0.5 bg-gray-100">
          <button
            onClick={() => onSelectionChange(index, PartSelection.NEW)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${getButtonClass(PartSelection.NEW)}`}
          >
            نو
          </button>
          <button
            onClick={() => onSelectionChange(index, PartSelection.USED)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${getButtonClass(PartSelection.USED)}`}
          >
            کارکرده
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartRow;