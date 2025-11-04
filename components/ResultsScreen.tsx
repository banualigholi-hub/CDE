import React, { useState, useMemo } from 'react';
import { Part, PartSelection } from '../types';
import { PlusCircleIcon, ArrowLeftIcon, DownloadIcon } from './icons';
import PartRow from './PartRow';

interface ResultsScreenProps {
  parts: Part[];
  onPartSelectionChange: (index: number, selection: PartSelection) => void;
  onAddManualPart: (partName: string) => Promise<void>;
  onUpdatePart: (index: number, field: keyof Part, value: number) => void;
  onDeletePart: (index: number) => void;
  onBack: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ parts, onPartSelectionChange, onAddManualPart, onUpdatePart, onDeletePart, onBack }) => {
  const [manualPartName, setManualPartName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = async () => {
    if (manualPartName.trim()) {
      setIsAdding(true);
      await onAddManualPart(manualPartName.trim());
      setManualPartName('');
      setIsAdding(false);
    }
  };

  const { totalPartsCost, totalLaborCost, grandTotal } = useMemo(() => {
    const totalPartsCost = parts.reduce((sum, part) => {
        if (part.selection === PartSelection.NEW) return sum + part.newPrice;
        if (part.selection === PartSelection.USED) return sum + part.usedPrice;
        return sum;
    }, 0);

    const totalLaborCost = parts.reduce((sum, part) => {
        // Labor cost is added if the part is being replaced
        if (part.selection === PartSelection.NEW || part.selection === PartSelection.USED) {
            return sum + part.repairCost;
        }
        return sum;
    }, 0);

    const grandTotal = totalPartsCost + totalLaborCost;

    return { totalPartsCost, totalLaborCost, grandTotal };
  }, [parts]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <div id="results-content" className="p-4 flex flex-col h-full bg-gray-50 print:bg-white print:p-0">
       <button onClick={onBack} className="absolute top-5 right-5 text-gray-600 hover:text-gray-900 z-10 print:hidden">
            <ArrowLeftIcon className="w-6 h-6 transform scale-x-[-1]" />
        </button>
      
      {/* Manual Part Input */}
      <div className="mb-4 print:hidden">
        <label htmlFor="manual-part" className="block text-sm font-medium text-gray-700 mb-1">
          افزودن قطعه دستی
        </label>
        <div className="flex items-center space-i-2">
          <input
            id="manual-part"
            type="text"
            value={manualPartName}
            onChange={(e) => setManualPartName(e.target.value)}
            placeholder="مثال: آینه بغل چپ"
            className="flex-grow p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isAdding}
          />
          <button
            onClick={handleAddClick}
            className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-full disabled:opacity-50"
            disabled={isAdding || !manualPartName.trim()}
          >
            {isAdding ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <PlusCircleIcon className="w-6 h-6"/>}
          </button>
        </div>
      </div>
      
      {/* Results Table */}
      <div className="flex-grow overflow-y-auto -mx-4 px-4 print:overflow-visible print:m-0 print:p-0">
        <h2 className="text-xl font-bold text-gray-800 mb-3 hidden print:block text-center">گزارش تخمین هزینه تعمیر خودرو</h2>
        {parts.length > 0 ? (
             <div className="space-y-3 print:space-y-2">
             {parts.map((part, index) => (
               <PartRow
                 key={`${part.name}-${index}`}
                 part={part}
                 index={index}
                 onSelectionChange={onPartSelectionChange}
                 onUpdate={onUpdatePart}
                 onDelete={onDeletePart}
                 formatCurrency={formatCurrency}
               />
             ))}
           </div>
        ) : (
            <div className="text-center text-gray-500 pt-10 print:hidden">
                <p>هیچ قطعه آسیب‌دیده‌ای شناسایی نشد.</p>
                <p>می‌توانید قطعات را به صورت دستی اضافه کنید.</p>
            </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-auto pt-4 border-t border-gray-200 bg-white -mx-4 -mb-4 px-4 pb-4 rounded-b-3xl shadow-inner print:shadow-none print:border-t-2 print:rounded-none print:m-0 print:mt-6 print:bg-gray-50">
        <h3 className="text-lg font-bold text-gray-800 mb-3">خلاصه هزینه کل</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">هزینه کل قطعات</span>
            <span className="font-semibold text-gray-800">{formatCurrency(totalPartsCost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">هزینه کل دستمزد</span>
            <span className="font-semibold text-gray-800">{formatCurrency(totalLaborCost)}</span>
          </div>
          <hr className="my-1"/>
          <div className="flex justify-between items-center text-base">
            <span className="font-bold text-gray-700">جمع کل هزینه‌ها</span>
            <span className="font-bold text-indigo-700">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
        <button
            onClick={handlePrint}
            className="w-full mt-4 bg-gray-700 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center space-i-2 print:hidden"
        >
            <DownloadIcon className="w-5 h-5"/>
            <span>دریافت خروجی محاسبات (PDF)</span>
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;