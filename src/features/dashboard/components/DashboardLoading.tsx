import { Loader2 } from 'lucide-react';

export const DashboardLoading = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
          <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  </div>
);
