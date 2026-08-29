import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Building2, Save, ArrowLeft, CheckSquare } from 'lucide-react';

const AddEditHallPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { halls, addHall, updateHall } = useApp();

  const isEditMode = Boolean(id);
  const existingHall = isEditMode ? halls.find(h => h.id === id) : null;

  const [formData, setFormData] = useState({
    name: '',
    type: 'Seminar',
    capacity: 100,
    location: '',
    description: '',
    openingTime: '08:00',
    closingTime: '20:00',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
    facilities: ['Projector', 'Microphone', 'Sound System', 'Wi-Fi']
  });

  useEffect(() => {
    if (isEditMode && existingHall) {
      setFormData(existingHall);
    }
  }, [isEditMode, existingHall]);

  const allFacilities = [
    'Projector',
    'Microphone',
    'Sound System',
    'Stage',
    'Wi-Fi',
    'Air Conditioning',
    'Seating',
    'Smart Board'
  ];

  const handleFacilityToggle = (fac) => {
    setFormData(prev => {
      const exists = prev.facilities.includes(fac);
      if (exists) {
        return { ...prev, facilities: prev.facilities.filter(f => f !== fac) };
      } else {
        return { ...prev, facilities: [...prev.facilities, fac] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      updateHall(id, formData);
    } else {
      addHall(formData);
    }
    navigate('/admin/halls');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate('/admin/halls')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Hall List
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">
            {isEditMode ? `Edit Hall: ${existingHall?.name}` : 'Add New Campus Hall'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Hall Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Executive Technology Conference Hall"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Hall Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
            >
              <option value="Auditorium">Auditorium</option>
              <option value="Assembly">Assembly Hall</option>
              <option value="Sports">Sports Hall</option>
              <option value="Seminar">Seminar Hall</option>
              <option value="Conference">Conference Hall</option>
              <option value="Multipurpose">Multipurpose Hall</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Max Seating Capacity *</label>
            <input
              type="number"
              min={10}
              max={2000}
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Campus Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Academic Block B, 2nd Floor"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Hall Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe venue features, acoustics, seating layout..."
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Daily Opening Time</label>
            <input
              type="time"
              value={formData.openingTime}
              onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Daily Closing Time</label>
            <input
              type="time"
              value={formData.closingTime}
              onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Hall Showcase Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Facilities Checklist */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="block font-bold text-[#4338CA] uppercase tracking-wider">Available Facilities</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allFacilities.map((fac) => {
              const checked = formData.facilities.includes(fac);
              return (
                <label
                  key={fac}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer font-semibold transition ${
                    checked
                      ? 'bg-teal-50 border-[#0D9488] text-teal-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleFacilityToggle(fac)}
                    className="rounded text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span>{fac}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/admin/halls')}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#0D9488] hover:bg-teal-700 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save Hall Specifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditHallPage;
