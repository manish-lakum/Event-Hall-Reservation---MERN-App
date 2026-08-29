import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import HallCard from '../../components/cards/HallCard';
import {
  Building2,
  CalendarCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Search,
  FileSpreadsheet,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const { halls } = useApp();

  const featuredHalls = halls.slice(0, 3);

  const steps = [
    {
      step: '01',
      title: 'Explore & Check Availability',
      desc: 'Browse internal college halls, check live capacity, equipment specs, and real-time slot availability.',
      icon: Search
    },
    {
      step: '02',
      title: 'Submit Reservation Request',
      desc: 'Provide event details, participant estimates, and specific facility requirements (projector, mics, stage).',
      icon: FileSpreadsheet
    },
    {
      step: '03',
      title: 'Admin Verification & Approval',
      desc: 'Estate admin reviews request against campus calendar rules and approves or sends official remarks.',
      icon: ShieldCheck
    },
    {
      step: '04',
      title: 'Host Your Campus Event',
      desc: 'Access your reserved hall at the scheduled time with complete facility readiness guaranteed.',
      icon: CalendarCheck
    }
  ];

  const features = [
    {
      title: 'Conflict-Free Scheduling',
      desc: 'Built-in slot overlap detection ensures no two college events clash in the same hall or timeframe.'
    },
    {
      title: 'Maintenance Block Awareness',
      desc: 'System automatically hides halls scheduled for university exam evaluation or HVAC maintenance.'
    },
    {
      title: 'Facility Customization',
      desc: 'Specify exact equipment needs such as audio systems, smart podiums, Wi-Fi tokens, and extra chairs.'
    },
    {
      title: 'Role-Based Access',
      desc: 'Tailored permissions for Students, Faculty, Department Heads, and Estate Maintenance Administrators.'
    }
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative bg-[#4338CA] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800 text-teal-300 text-xs font-semibold border border-indigo-600">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Official Campus Facility Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Reserve Campus Spaces with Ease
            </h1>

            <p className="text-base sm:text-lg text-indigo-100 max-w-2xl leading-relaxed font-normal">
              Find available college halls, submit reservation requests, and manage your academic seminars, workshops, and student activities from one centralized system.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/halls"
                className="bg-[#0D9488] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-teal-700 transition shadow-md flex items-center gap-2 text-sm"
              >
                <span>Explore Campus Halls</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/login"
                className="bg-indigo-800 text-white hover:bg-indigo-900 border border-indigo-600 font-semibold px-6 py-3.5 rounded-xl transition text-sm flex items-center gap-2"
              >
                <span>Member Sign In</span>
              </Link>
            </div>

            {/* Institutional Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-indigo-700/80">
              <div>
                <div className="text-2xl font-black text-teal-300">6+</div>
                <div className="text-xs text-indigo-200 font-medium">Campus Halls</div>
              </div>
              <div>
                <div className="text-2xl font-black text-teal-300">2,000+</div>
                <div className="text-xs text-indigo-200 font-medium">Seating Capacity</div>
              </div>
              <div>
                <div className="text-2xl font-black text-teal-300">100%</div>
                <div className="text-xs text-indigo-200 font-medium">Digital Approval</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-indigo-500/30">
              <img
                src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80"
                alt="College Auditorium"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="bg-[#0D9488] text-white text-xs font-bold px-2.5 py-1 rounded w-fit mb-1">
                  Featured Venue
                </span>
                <h3 className="text-lg font-bold text-white">Central Auditorium Hall</h3>
                <p className="text-xs text-slate-200">800 Seating • Full Stage Audio & Lighting</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Campus Halls Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Internal Facilities</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Available Campus Halls</h2>
          </div>
          <Link
            to="/halls"
            className="text-xs font-bold text-[#0D9488] hover:text-teal-800 flex items-center gap-1 hover:underline"
          >
            <span>View All Halls ({halls.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredHalls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      </section>

      {/* How Reservation Works Section */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Simple Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">How Reservation Works</h2>
            <p className="text-xs text-slate-500">
              A structured 4-step process designed for faculty, department leads, and student council organizers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200 relative group hover:border-[#0D9488] transition">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-indigo-400 bg-indigo-50 px-2.5 py-1 rounded">
                      {s.step}
                    </span>
                    <div className="p-2.5 bg-[#4338CA] text-white rounded-lg group-hover:bg-[#0D9488] transition">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[#4338CA] mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features & System Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">System Governance</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Built for Academic Efficiency</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="p-3 bg-teal-50 text-[#0D9488] rounded-xl shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#4338CA]">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
