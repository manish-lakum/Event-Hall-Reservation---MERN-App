import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import HallCard from '../../components/cards/HallCard';
import EmptyState from '../../components/common/EmptyState';
import { Search, Filter, Building2, SlidersHorizontal } from 'lucide-react';

const BrowseHallsPage = () => {
  const { halls } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCapacity, setSelectedCapacity] = useState('All');

  const filteredHalls = useMemo(() => {
    return halls.filter((hall) => {
      const matchesSearch =
        hall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hall.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'All' || hall.type.toLowerCase() === selectedType.toLowerCase();

      let matchesCap = true;
      if (selectedCapacity === '<100') matchesCap = hall.capacity < 100;
      else if (selectedCapacity === '100-300') matchesCap = hall.capacity >= 100 && hall.capacity <= 300;
      else if (selectedCapacity === '300-600') matchesCap = hall.capacity > 300 && hall.capacity <= 600;
      else if (selectedCapacity === '>600') matchesCap = hall.capacity > 600;

      return matchesSearch && matchesType && matchesCap;
    });
  }, [halls, searchQuery, selectedType, selectedCapacity]);

  return (
    <div className="space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Campus Infrastructure</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Browse College Halls</h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore internal university venues, view equipment specifications, and request reservations.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs w-fit">
          Showing <strong className="text-[#4338CA]">{filteredHalls.length}</strong> of {halls.length} halls
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hall by name, location, or facility..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
          />
        </div>

        {/* Hall Type Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
          >
            <option value="All">All Hall Types</option>
            <option value="Auditorium">Auditorium</option>
            <option value="Assembly">Assembly Hall</option>
            <option value="Sports">Sports Hall</option>
            <option value="Seminar">Seminar Hall</option>
            <option value="Conference">Conference Hall</option>
            <option value="Multipurpose">Multipurpose Hall</option>
          </select>
        </div>

        {/* Capacity Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedCapacity}
            onChange={(e) => setSelectedCapacity(e.target.value)}
            className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
          >
            <option value="All">All Capacity Ranges</option>
            <option value="<100">Small (&lt; 100 capacity)</option>
            <option value="100-300">Medium (100 - 300 capacity)</option>
            <option value="300-600">Large (300 - 600 capacity)</option>
            <option value=">600">Grand (&gt; 600 capacity)</option>
          </select>
        </div>
      </div>

      {/* Halls Grid */}
      {filteredHalls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHalls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Halls Match Filter Criteria"
          message="Try adjusting your search query, hall type, or capacity range filters."
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('All');
                setSelectedCapacity('All');
              }}
              className="bg-[#0D9488] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-teal-700 transition"
            >
              Reset Filters
            </button>
          }
        />
      )}
    </div>
  );
};

export default BrowseHallsPage;
