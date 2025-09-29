import React, { useState, useEffect } from 'react';
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === 'dark'}
      className={`toggle-switch ${theme === 'dark' ? 'dark' : ''}`}
      aria-label="Toggle theme"
    >
      <span className="toggle-switch-track"></span>
      <span className="toggle-switch-thumb">
        <IoMoonOutline
          className={`h-4 w-4 text-gray-600 transition-opacity duration-300 ${
            theme === 'light' ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <IoSunnyOutline
          className={`h-4 w-4 text-yellow-500 absolute transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </span>
    </button>
  );
};