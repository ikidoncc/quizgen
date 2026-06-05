import React, { useState, useEffect, useRef } from 'react';
import type { Theme } from '../types';

interface ThemeSelectProps {
  value: Theme;
  onChange: (value: Theme) => void;
}

const THEMES: { value: Theme; label: string; emoji: string }[] = [
  { value: 'light', label: 'Light', emoji: '🌞' },
  { value: 'dark', label: 'Dark', emoji: '🌙' },
  { value: 'auto', label: 'Auto', emoji: '💻' },
];

export const ThemeSelect: React.FC<ThemeSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTheme = THEMES.find(t => t.value === value) || THEMES[2];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center sm:justify-between w-10 sm:w-32 bg-surface border border-overlay text-main text-xs rounded-lg p-2 outline-none cursor-pointer hover:bg-overlay transition-all active:scale-95"
      >
        <span className="flex items-center">
          {selectedTheme.emoji}
          <span className="hidden sm:inline ml-1">{selectedTheme.label}</span>
        </span>
        <svg
          className={`w-4 h-4 ml-1 hidden sm:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-surface border border-overlay rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          {THEMES.map((theme) => (
            <div
              key={theme.value}
              className={`px-4 py-2 text-xs text-main hover:bg-overlay cursor-pointer flex items-center transition-colors ${
                value === theme.value ? 'bg-overlay/50 font-bold' : ''
              }`}
              onClick={() => {
                onChange(theme.value);
                setIsOpen(false);
              }}
            >
              {theme.emoji} <span className="ml-2">{theme.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
