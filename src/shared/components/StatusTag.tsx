type StatusTagProps = {
  status: string;
};

export const StatusTag = ({ status }: StatusTagProps) => {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-rose-100 text-rose-700',
    ready: 'bg-indigo-100 text-indigo-700',
    sent: 'bg-slate-100 text-slate-700',
  };

  const labels: Record<string, string> = {
    paid: 'Оплачено',
    pending: 'В работе',
    overdue: 'Просрочено',
    ready: 'Ждет счет',
    sent: 'Отправлено',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-slate-100'}`}>
      {labels[status] || status}
    </span>
  );
};
