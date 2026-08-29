import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, ShieldCheck, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Footer = () => {
  const { settings } = useApp();

  return (
    <footer className="bg-[#4338CA] text-indigo-100 border-t border-indigo-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Institutional Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#0D9488] rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                {settings.collegeName || 'Apex Institute of Technology'}
              </span>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Official Campus Facilities Management & Event Hall Reservation Portal. Designed for seamless academic, seminar, and student activity space bookings.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Internal Campus Management System</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-indigo-600 pb-1.5 inline-block">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/halls" className="hover:text-teal-300 transition">Browse Campus Halls</Link>
              </li>
              <li>
                <Link to="/availability" className="hover:text-teal-300 transition">Check Hall Availability</Link>
              </li>
              <li>
                <Link to="/my-reservations" className="hover:text-teal-300 transition">Track Reservation Status</Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-teal-300 transition">Campus Master Schedule</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-300 transition">Staff & Student Login</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Hall Types */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-indigo-600 pb-1.5 inline-block">
              Available Facilities
            </h3>
            <ul className="space-y-2 text-xs text-indigo-200">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Auditorium Hall (Cap: 800)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Assembly Hall (Cap: 500)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Sports Pavilion (Cap: 300)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Multipurpose Hall (Cap: 250)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Seminar Hall (Cap: 120)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Executive Conference Hall (Cap: 60)
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-indigo-600 pb-1.5 inline-block">
              Campus Helpdesk
            </h3>
            <ul className="space-y-2.5 text-xs text-indigo-200">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Estate Management Cell, Main Administrative Building, Room 104</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{settings.contactEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{settings.contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Mon - Sat: 08:00 AM - 05:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-indigo-700 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-indigo-300">
          <div>
            &copy; {new Date().getFullYear()} {settings.collegeName}. All rights reserved. MCA Academic Project.
          </div>
          <div className="flex items-center gap-6 font-medium">
            <span className="hover:text-white transition">Privacy Policy</span>
            <span className="hover:text-white transition">Terms of Campus Usage</span>
            <span className="hover:text-white transition">Estate Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
