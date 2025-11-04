import React, { useRef, useState } from 'react';
import { CameraIcon, FileTextIcon, MessageSquareIcon } from './icons';

interface WelcomeScreenProps {
  onStart: (payload: {
    files: FileList | null;
    carModel: string;
    manualParts: string;
    useImages: boolean;
    useManualList: boolean;
  }) => void;
  hasResults: boolean;
  onGoToResults: () => void;
}

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void, icon: React.ReactNode }> = ({ label, enabled, onChange, icon }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center">
            {icon}
            <span className="mr-3 font-medium text-gray-700">{label}</span>
        </div>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${enabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, hasResults, onGoToResults }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useImages, setUseImages] = useState(true);
  const [useManualList, setUseManualList] = useState(false);
  const [carModel, setCarModel] = useState('');
  const [manualParts, setManualParts] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
      setUseImages(true); // Automatically enable if user selects files
    }
  };

  const handleStartClick = () => {
      onStart({ files, carModel, manualParts, useImages, useManualList });
  };
  
  const isButtonDisabled = !carModel.trim() || (!useImages && !useManualList) || (useImages && (!files || files.length === 0));

  return (
    <div className="flex flex-col h-full p-6">
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg -m-2 mb-6">
            <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full text-white mb-3">
                    <MessageSquareIcon className="w-8 h-8"/>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">تخمین خسارت خودرو</h1>
                <p className="text-sm text-gray-600 mt-1">هزینه تعمیر خودروی خود را هوشمندانه محاسبه کنید</p>
            </div>
        </div>

        <div className="space-y-4">
            <div className="bg-white/80 p-4 rounded-xl shadow-md">
                <label htmlFor="carModel" className="block text-sm font-bold text-gray-700 mb-2">
                    ۱. مدل خودرو*
                </label>
                <input 
                    id="carModel"
                    type="text"
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    placeholder="مثال: پژو ۲۰۶ تیپ ۵"
                    className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div className="bg-white/80 p-4 rounded-xl shadow-md space-y-3">
                 <h2 className="block text-sm font-bold text-gray-700 mb-2">۲. روش شناسایی قطعات</h2>
                <ToggleSwitch 
                    label="تحلیل با تصاویر"
                    icon={<CameraIcon className="w-5 h-5 text-gray-500" />}
                    enabled={useImages}
                    onChange={setUseImages}
                />
                {useImages && (
                    <div className="pl-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                            multiple
                        />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full text-sm text-center py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                            {files && files.length > 0 ? `${files.length} تصویر انتخاب شد` : "انتخاب تصاویر..."}
                        </button>
                    </div>
                )}
                <hr/>
                <ToggleSwitch 
                    label="ورود لیست دستی قطعات"
                    icon={<FileTextIcon className="w-5 h-5 text-gray-500" />}
                    enabled={useManualList}
                    onChange={setUseManualList}
                />
                {useManualList && (
                     <textarea
                        value={manualParts}
                        onChange={(e) => setManualParts(e.target.value)}
                        placeholder="هر قطعه در یک خط جداگانه، مثال:&#10;سپر جلو&#10;چراغ راست"
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                     />
                )}
            </div>
        </div>
      
        <div className="mt-auto pt-4 space-y-2">
            <button
                onClick={handleStartClick}
                disabled={isButtonDisabled}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:scale-100"
            >
                شروع تخمین هزینه
            </button>
            {hasResults && (
                 <button
                    onClick={onGoToResults}
                    className="w-full text-indigo-600 font-semibold py-2 px-4 rounded-full hover:bg-indigo-100 transition-colors"
                >
                    بازگشت به لیست
                </button>
            )}
        </div>
    </div>
  );
};

export default WelcomeScreen;