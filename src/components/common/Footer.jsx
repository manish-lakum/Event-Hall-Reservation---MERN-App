import React from 'react';
import { Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Footer = () => {
  const { settings } = useApp();

  return (
    <footer className="bg-[#4338CA] text-indigo-100 border-t border-indigo-700 mt-auto py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#0D9488] rounded-lg shadow-xs">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">
            {settings.collegeName || 'Sardar Vallabhbhai Global University (SVGU)'}
          </span>
        </div>

        <div className="text-indigo-200 font-medium text-center sm:text-right">
          &copy; {new Date().getFullYear()} {settings.collegeName || 'SVGU'}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
