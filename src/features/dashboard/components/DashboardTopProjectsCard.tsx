import { formatEUR } from '../../../shared/lib/format';
import { TopProject } from '../types';

type DashboardTopProjectsCardProps = {
  projects: TopProject[];
};

export const DashboardTopProjectsCard = ({ projects }: DashboardTopProjectsCardProps) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
    <h3 className="font-bold text-slate-800 mb-4">ТОП-3 Проекта</h3>
    <div className="flex-1 space-y-4">
      {projects.length > 0 ? (
        projects.map((project, index) => (
          <div key={`${project.name}-${index}`} className="flex justify-between items-center pb-3 border-b border-slate-50 last:border-0">
            <div>
              <p className="font-bold text-sm text-slate-700 truncate w-32 md:w-auto">{project.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{project.team}</span>
                <p className="text-xs text-slate-400">Прибыль: {formatEUR(project.profit)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-600">{project.margin}%</span>
              <p className="text-xs text-slate-400">Маржа</p>
            </div>
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">Нет прибыльных проектов</div>
      )}
    </div>
  </div>
);
