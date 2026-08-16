import React, { createContext, useContext, useState, useEffect } from 'react';

export type DigitMode = 'roman' | 'nepali';

interface LanguageContextType {
  digitMode: DigitMode;
  setDigitMode: (mode: DigitMode) => void;
  toggleDigitMode: () => void;
  formatNumber: (val: number | string) => string;
  formatCurrency: (val: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [digitMode, setDigitModeState] = useState<DigitMode>(() => {
    const saved = localStorage.getItem('bela_digit_mode');
    return (saved === 'nepali' ? 'nepali' : 'roman') as DigitMode;
  });

  const setDigitMode = (mode: DigitMode) => {
    setDigitModeState(mode);
    localStorage.setItem('bela_digit_mode', mode);
  };

  const toggleDigitMode = () => {
    setDigitMode(digitMode === 'roman' ? 'nepali' : 'roman');
  };

  const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

  const formatNumber = (val: number | string): string => {
    const str = String(val);
    if (digitMode === 'nepali') {
      return str.replace(/[0-9]/g, (char) => NEPALI_DIGITS[parseInt(char, 10)]);
    }
    return str;
  };

  const formatCurrency = (val: number | string): string => {
    const num = typeof val === 'string' ? parseFloat(val) || 0 : val;
    const formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    if (digitMode === 'nepali') {
      const nepaliFormatted = formatted.replace(/[0-9]/g, (char) => NEPALI_DIGITS[parseInt(char, 10)]);
      return `रु. ${nepaliFormatted}`;
    }

    return `NPR ${formatted}`;
  };

  return (
    <LanguageContext.Provider value={{ digitMode, setDigitMode, toggleDigitMode, formatNumber, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
