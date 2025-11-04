import React, { useState, useCallback, useEffect } from 'react';
import { AppScreen, Part, PartSelection } from './types';
import { analyzeCarDamage, getPartsDetails } from './services/geminiService';
import WelcomeScreen from './components/WelcomeScreen';
import ResultsScreen from './components/ResultsScreen';
import Spinner from './components/Spinner';

interface StartAnalysisPayload {
    files: FileList | null;
    carModel: string;
    manualParts: string;
    useImages: boolean;
    useManualList: boolean;
}

const STORAGE_KEY = 'car_damage_estimator_parts';

const App: React.FC = () => {
  const [parts, setParts] = useState<Part[]>(() => {
    try {
      const savedParts = window.localStorage.getItem(STORAGE_KEY);
      return savedParts ? JSON.parse(savedParts) : [];
    } catch (error) {
      console.error("Failed to load parts from storage", error);
      return [];
    }
  });

  const [screen, setScreen] = useState<AppScreen>(() => {
    const savedParts = window.localStorage.getItem(STORAGE_KEY);
    return savedParts && JSON.parse(savedParts).length > 0 ? AppScreen.RESULTS : AppScreen.WELCOME;
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
    } catch (error) {
      console.error("Failed to save parts to storage", error);
    }
  }, [parts]);


  const handleStart = useCallback(async (payload: StartAnalysisPayload) => {
    const { files, carModel, manualParts, useImages, useManualList } = payload;
    
    if (!carModel.trim()) {
        setError("لطفا مدل خودرو را وارد کنید.");
        setScreen(AppScreen.ERROR);
        return;
    }
    if (!useImages && !useManualList) {
        setError("لطفا حداقل یک منبع (تصویر یا لیست دستی) برای تحلیل انتخاب کنید.");
        setScreen(AppScreen.ERROR);
        return;
    }
    if (useImages && (!files || files.length === 0)) {
        setError("برای تحلیل با تصویر، لطفا حداقل یک عکس بارگذاری کنید.");
        setScreen(AppScreen.ERROR);
        return;
    }

    setScreen(AppScreen.LOADING);
    setError(null);

    try {
        let detectedPartNames: string[] = [];

        if (useImages && files) {
            const imageFiles = Array.from(files);
            detectedPartNames = await analyzeCarDamage(imageFiles, carModel);
        }

        if (useManualList) {
            const manualPartNames = manualParts.split('\n').map(p => p.trim()).filter(Boolean);
            detectedPartNames = [...new Set([...detectedPartNames, ...manualPartNames])];
        }

        if (detectedPartNames.length === 0) {
            setParts([]);
            setScreen(AppScreen.RESULTS);
            return;
        }

        const partDetails = await getPartsDetails(detectedPartNames, carModel);
        const initialParts: Part[] = partDetails.map((detail: any) => ({
            ...detail,
            selection: PartSelection.NEW,
        }));
        setParts(initialParts);
        setScreen(AppScreen.RESULTS);
    } catch (err) {
      console.error(err);
      setError("خطایی در پردازش رخ داد. لطفا دوباره تلاش کنید.");
      setScreen(AppScreen.ERROR);
    }
  }, []);
  
  const handleAddManualPart = useCallback(async (partName: string) => {
    try {
        // We assume the car model from the initial state is still valid
        // In a more complex app, we might need to pass it around
        const partDetails = await getPartsDetails([partName], "خودرو"); // Using a generic model for manual add
        if(partDetails && partDetails.length > 0) {
            const newPart: Part = { ...partDetails[0], selection: PartSelection.NEW };
            setParts(prevParts => [...prevParts, newPart]);
        }
    } catch (err) {
        console.error("Failed to fetch details for manual part:", err);
    }
  }, []);

  const handlePartSelectionChange = useCallback((index: number, selection: PartSelection) => {
    setParts(prevParts => 
        prevParts.map((part, i) => i === index ? { ...part, selection } : part)
    );
  }, []);

  const handleUpdatePart = useCallback((index: number, field: keyof Part, value: number) => {
    setParts(prevParts => 
        prevParts.map((part, i) => i === index ? { ...part, [field]: value } : part)
    );
  }, []);

  const handleDeletePart = useCallback((index: number) => {
    setParts(prevParts => prevParts.filter((_, i) => i !== index));
  }, []);

  const handleReset = useCallback(() => {
    setParts([]);
    setError(null);
    window.localStorage.removeItem(STORAGE_KEY);
    setScreen(AppScreen.WELCOME);
  }, []);

  const handleGoToResults = useCallback(() => {
    setScreen(AppScreen.RESULTS);
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case AppScreen.WELCOME:
        return <WelcomeScreen onStart={handleStart} hasResults={parts.length > 0} onGoToResults={handleGoToResults} />;
      case AppScreen.LOADING:
        return (
          <div className="flex flex-col items-center justify-center text-white h-full">
            <Spinner />
            <p className="mt-4 text-lg">در حال تحلیل...</p>
            <p className="text-sm opacity-80">این فرآیند ممکن است کمی طول بکشد</p>
          </div>
        );
      case AppScreen.RESULTS:
        return (
          <ResultsScreen
            parts={parts}
            onPartSelectionChange={handlePartSelectionChange}
            onAddManualPart={handleAddManualPart}
            onUpdatePart={handleUpdatePart}
            onDeletePart={handleDeletePart}
            onReset={handleReset}
          />
        );
       case AppScreen.ERROR:
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <h2 className="text-2xl font-bold text-red-500 mb-4">خطا</h2>
                <p className="text-gray-600 mb-8">{error}</p>
                <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                >
                    شروع مجدد
                </button>
            </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-400 to-indigo-600 min-h-screen w-full flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="w-full max-w-sm h-[90vh] max-h-[900px] bg-white/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col print:shadow-none print:rounded-none print:h-auto print:max-h-none print:max-w-none print:bg-white">
          { screen !== AppScreen.WELCOME && (
              <div className="bg-white/50 p-4 border-b border-gray-200 print:hidden">
                  <h1 className="text-center text-xl font-bold text-gray-800">نتایج تخمین هزینه</h1>
              </div>
          )}
        <div className="flex-grow overflow-y-auto">
            {renderScreen()}
        </div>
      </div>
    </div>
  );
};

export default App;