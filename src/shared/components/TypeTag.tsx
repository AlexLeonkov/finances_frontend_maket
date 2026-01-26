type TypeTagProps = {
  type: string;
};

export const TypeTag = ({ type }: TypeTagProps) => {
  let color = 'bg-slate-100 text-slate-600';

  if (type.includes('PV')) color = 'bg-blue-100 text-blue-700';
  if (type.includes('Speicher')) color = 'bg-purple-100 text-purple-700';
  if (type.includes('Wallbox')) color = 'bg-orange-100 text-orange-700';
  if (type.includes('Retrofit')) color = 'bg-amber-100 text-amber-700';

  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${color}`}>{type}</span>;
};
