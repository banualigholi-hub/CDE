import React, { useRef, useState } from 'react';
import { CameraIcon, FileTextIcon } from './icons';

interface WelcomeScreenProps {
  onStart: (payload: {
    files: FileList | null;
    carModel: string;
    manualParts: string;
    useImages: boolean;
    useManualList: boolean;
  }) => void;
}

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; onChange: (enabled: boolean) => void, icon: React.ReactNode }> = ({ label, enabled, onChange, icon }) => (
    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
        <div className="flex items-center">
            {icon}
            <span className="mr-2 font-medium text-gray-700">{label}</span>
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


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
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
  
  const isButtonDisabled = !carModel.trim() || (!useImages && !useManualList) || (useImages && !files);

  return (
    <div className="flex flex-col h-full p-6 space-y-4">
        <div>
            <label htmlFor="carModel" className="block text-sm font-bold text-gray-700 mb-1">
                مدل خودرو*
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

        <div className="space-y-2">
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
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-sm text-center py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        {files && files.length > 0 ? `${files.length} تصویر انتخاب شد` : "انتخاب تصاویر..."}
                    </button>
                </div>
            )}
            
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
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                 />
            )}
        </div>
      
        <div className="mt-auto pt-4">
            <button
                onClick={handleStartClick}
                disabled={isButtonDisabled}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:scale-100"
            >
                شروع تخمین هزینه
            </button>
            <p className="text-xs text-gray-400 mt-4 text-center">
                با ادامه، شما با شرایط و قوانین ما موافقت می‌کنید.
            </p>
        </div>
    </div>
  );
};

export default WelcomeScreen;
