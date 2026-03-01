import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded ${i18n.language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage('hi')}
                className={`px-3 py-1 rounded ${i18n.language === 'hi' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
                HI
            </button>
            <button
                onClick={() => changeLanguage('mr')}
                className={`px-3 py-1 rounded ${i18n.language === 'mr' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
                MR
            </button>
        </div>
    );
}
