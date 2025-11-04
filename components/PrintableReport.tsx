import React from 'react';
import { Part, PartSelection } from '../types';

interface PrintableReportProps {
  parts: Part[];
  totalPartsCost: number;
  totalLaborCost: number;
  grandTotal: number;
  formatCurrency: (amount: number) => string;
}

const PrintableReport: React.FC<PrintableReportProps> = ({
  parts,
  totalPartsCost,
  totalLaborCost,
  grandTotal,
  formatCurrency,
}) => {

  const getSelectionText = (selection: PartSelection) => {
    switch (selection) {
      case PartSelection.NEW: return 'نو';
      case PartSelection.USED: return 'کارکرده';
      default: return '-';
    }
  };

  return (
    <div className="p-8 font-['Vazirmatn']">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">گزارش تخمین هزینه تعمیرات خودرو</h1>
        <p className="text-gray-600 mt-2">تاریخ گزارش: {new Date().toLocaleDateString('fa-IR')}</p>
      </header>

      <main>
        <table className="w-full border-collapse text-right text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="p-3 font-bold text-gray-700">نام قطعه</th>
              <th className="p-3 font-bold text-gray-700">قیمت نو</th>
              <th className="p-3 font-bold text-gray-700">قیمت کارکرده</th>
              <th className="p-3 font-bold text-gray-700">هزینه تعمیر/دستمزد</th>
              <th className="p-3 font-bold text-gray-700">انتخاب شده</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((part, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-3 border-gray-200 font-semibold text-gray-800">{part.name}</td>
                <td className="p-3 border-gray-200 text-gray-600">{formatCurrency(part.newPrice)}</td>
                <td className="p-3 border-gray-200 text-gray-600">{formatCurrency(part.usedPrice)}</td>
                <td className="p-3 border-gray-200 text-gray-600">{formatCurrency(part.repairCost)}</td>
                <td className="p-3 border-gray-200 font-medium text-center">{getSelectionText(part.selection)}</td>
              </tr>
            ))}
             {parts.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">هیچ قطعه‌ای برای نمایش وجود ندارد.</td>
                </tr>
            )}
          </tbody>
        </table>
      </main>

      <footer className="mt-8">
        <div className="w-full max-w-xs ml-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-3">خلاصه هزینه کل</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">هزینه کل قطعات:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(totalPartsCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">هزینه کل دستمزد:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(totalLaborCost)}</span>
            </div>
            <hr className="border-gray-200"/>
            <div className="flex justify-between items-center text-base pt-1">
              <span className="font-bold text-gray-800">جمع کل هزینه‌ها:</span>
              <span className="font-bold text-indigo-600 text-lg">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrintableReport;
