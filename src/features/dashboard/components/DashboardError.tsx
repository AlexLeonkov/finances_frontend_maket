import { AlertCircle } from 'lucide-react';

type DashboardErrorProps = {
  message: string;
};

export const DashboardError = ({ message }: DashboardErrorProps) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
      <AlertCircle className="text-rose-600 mx-auto mb-4" size={32} />
      <h3 className="font-bold text-rose-800 mb-2">Ошибка загрузки данных</h3>
      <p className="text-rose-600 text-sm">{message}</p>
    </div>
  </div>
);
