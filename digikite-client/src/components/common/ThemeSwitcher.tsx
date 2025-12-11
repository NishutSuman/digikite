import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FiSun, FiMoon, FiMonitor, FiChevronDown } from 'react-icons/fi';

interface ThemeSwitcherProps {
  variant?: 'icon' | 'dropdown' | 'toggle';
  className?: string;
}

export default function ThemeSwitcher({ variant = 'dropdown', className = '' }: ThemeSwitcherProps) {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { value: 'light' as const, label: 'Light', icon: FiSun },
    { value: 'dark' as const, label: 'Dark', icon: FiMoon },
    { value: 'system' as const, label: 'System', icon: FiMonitor },
  ];

  const currentThemeConfig = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentThemeConfig.icon;

  // Simple toggle variant
  if (variant === 'toggle') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors ${
          actualTheme === 'dark'
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${className}`}
        aria-label="Toggle theme"
      >
        {actualTheme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
      </button>
    );
  }

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg transition-colors ${
            actualTheme === 'dark'
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          aria-label="Change theme"
        >
          <CurrentIcon className="h-5 w-5" />
        </button>

        {isOpen && (
          <div
            className={`absolute right-0 mt-2 w-36 rounded-lg shadow-lg border z-50 ${
              actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTheme(t.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                  theme === t.value
                    ? actualTheme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : actualTheme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant (default)
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          actualTheme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <CurrentIcon className="h-4 w-4" />
        <span className="text-sm">{currentThemeConfig.label}</span>
        <FiChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-full min-w-[140px] rounded-lg shadow-lg border z-50 ${
            actualTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTheme(t.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg ${
                theme === t.value
                  ? actualTheme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-600'
                  : actualTheme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
