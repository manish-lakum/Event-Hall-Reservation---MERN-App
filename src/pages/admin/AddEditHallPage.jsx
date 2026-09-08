import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { hallService } from '../../services/hallService';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';

const AddEditHallPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { halls, addHall, updateHall, mapHall } = useApp();

  const isEditMode = Boolean(id);
  const existingHall = isEditMode ? halls.find(h => h.id === id) : null;

  const [formData, setFormData] = useState({
    name: '',
    type: 'SEMINAR',
    capacity: 100,
    location: '',
    description: '',
    openingTime: '08:00',
    closingTime: '20:00',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80',
    facilities: ['PROJECTOR', 'MICROPHONE', 'SOUND_SYSTEM', 'WIFI']
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEditingHall = async () => {
      if (isEditMode) {
        if (existingHall) {
          setFormData({
            name: existingHall.name || existingHall.hallName || '',
            type: (existingHall.hallType || existingHall.type || 'SEMINAR').toUpperCase(),
            capacity: existingHall.capacity || 100,
            location: existingHall.location || '',
            description: existingHall.description || '',
            openingTime: existingHall.openingTime || '08:00',
            closingTime: existingHall.closingTime || '20:00',
            image: existingHall.image || '',
            facilities: existingHall.facilities || []
          });
        } else {
          try {
            const res = await hallService.getHallById(id);
            if (res.success && res.data) {
              const mapped = mapHall(res.data);
              setFormData({
                name: mapped.name,
                type: (mapped.hallType || mapped.type || 'SEMINAR').toUpperCase(),
                capacity: mapped.capacity,
                location: mapped.location,
                description: mapped.description,
                openingTime: mapped.openingTime,
                closingTime: mapped.closingTime,
                image: mapped.image,
                facilities: mapped.facilities
              });
            }
          } catch (err) {
            console.error('Failed to load hall specs:', err.message);
          }
        }
      }
    };

    loadEditingHall();
  }, [id, isEditMode, existingHall, mapHall]);

  const allFacilities = [
    'PROJECTOR',
    'MICROPHONE',
    'SOUND_SYSTEM',
    'STAGE',
    'WIFI',
    'AIR_CONDITIONING',
    'SEATING',
    'SMART_BOARD'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      let res;
      if (isEditMode) {
        res = await updateHall(id, formData);
      } else {
        res = await addHall(formData);
      }

      if (res.success) {
        navigate('/admin/halls');
      } else {
        setError(res.message || 'Failed to save hall details.');
      }
    } catch (err) {
      setError(err.message || 'Server error saving hall.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate('/admin/halls')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Hall List
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">
            {isEditMode ? `Edit Hall: ${formData.name}` : 'Add New Campus Hall'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

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
              <option value="AUDITORIUM">Auditorium</option>
              <option value="ASSEMBLY">Assembly Hall</option>
              <option value="SPORTS">Sports Hall</option>
              <option value="SEMINAR">Seminar Hall</option>
              <option value="CONFERENCE">Conference Hall</option>
              <option value="MULTIPURPOSE">Multipurpose Hall</option>
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
            className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-extrabold text-white bg-[#0D9488] hover:bg-teal-700 rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Hall Specifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditHallPage;
