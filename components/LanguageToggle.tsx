
import React from 'react';
import { Language } from '../types';

interface Props {
  current: Language;
  onChange: (lang: Language) => void;
}

export const LanguageToggle: React.FC<Props> = ({ current, onChange }) => {
  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onChange('en')}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
          current === 'en' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange('bn')}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
          current === 'bn' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
        }`}
      >
        বাংলা
      </button>
    </div>
  );
};
