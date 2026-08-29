import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No items found', message = 'There are no records matching your request at this time.', action }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center my-6">
      <div className="p-4 bg-indigo-50 text-[#4338CA] rounded-full mb-4">
        <Inbox className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-[#4338CA]">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;
