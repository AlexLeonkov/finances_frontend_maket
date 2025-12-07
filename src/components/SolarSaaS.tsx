import { useState } from 'react';

import { 

  LayoutGrid, Users, Box, Layers, Plus, 

  AlertTriangle, 

  Filter, Download, MoreHorizontal, 

  ChevronRight, 

  Zap, Battery, Settings,

  ChevronLeft, FileText, Send, Check, RefreshCw,

  Home, Plug, Loader2, AlertCircle, 

  Package

} from 'lucide-react';

import { 

  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,

  BarChart, Bar, AreaChart, Area

} from 'recharts';

// --- CONFIG & CONSTANTS ---

const COLORS = {

  AC01: '#3B82F6', AC02: '#10B981', AC03: '#F59E0B', AC04: '#EC4899',

  bg: '#F5F6FA', card: '#FFFFFF', text: '#1E293B'

};

const TEAMS = [

  { id: 'AC01', name: 'AC01', members: 'Alex + Dima', color: COLORS.AC01, avatar: 'A', stats: { rev: '€ 245k', speed: 'High' } },

  { id: 'AC02', name: 'AC02', members: 'Sergei + Ivan', color: COLORS.AC02, avatar: 'S', stats: { rev: '€ 210k', speed: 'Avg' } },

  { id: 'AC03', name: 'AC03', members: 'Max + Oleg', color: COLORS.AC03, avatar: 'M', stats: { rev: '€ 195k', speed: 'Avg' } },

  { id: 'AC04', name: 'AC04', members: 'Viktor + Andy', color: COLORS.AC04, avatar: 'V', stats: { rev: '€ 192k', speed: 'Low' } },

];

// --- 6 MONTHS MOCK DATA ---

// 1. CHART DATA (May - Oct)

const SIX_MONTH_TREND = [

  { name: 'Mai', AC01: 32000, AC02: 28000, AC03: 15000, AC04: 12000 },

  { name: 'Jun', AC01: 38000, AC02: 35000, AC03: 22000, AC04: 18000 },

  { name: 'Jul', AC01: 45000, AC02: 32000, AC03: 38000, AC04: 25000 },

  { name: 'Aug', AC01: 42000, AC02: 48000, AC03: 41000, AC04: 38000 },

  { name: 'Sep', AC01: 55000, AC02: 45000, AC03: 35000, AC04: 42000 },

  { name: 'Okt', AC01: 62000, AC02: 52000, AC03: 48000, AC04: 51000 },

];

// 2. OPERATIONS / PROJECTS LIST (Rich History)

const MOCK_PROJECTS = [

  { id: 124, name: 'Schmidt Villa (12kWp)', client: 'Enpal GmbH', date: '2023-10-25', team: 'AC01', type: 'PV Complete', revenue: 4200, profit: 1450, margin: 34.5, status: 'paid' },

  { id: 123, name: 'Weber Garage', client: 'Private', date: '2023-10-24', team: 'AC02', type: 'Wallbox', revenue: 850, profit: 320, margin: 37.6, status: 'paid' },

  { id: 122, name: 'Lange Speicher Upgrade', client: '1KOMMA5°', date: '2023-10-23', team: 'AC03', type: 'Speicher', revenue: 2100, profit: -150, margin: -7.1, status: 'overdue' }, // Problem

  { id: 121, name: 'Müller Retrofit', client: 'Enpal GmbH', date: '2023-10-22', team: 'AC04', type: 'Retrofit', revenue: 3200, profit: 800, margin: 25.0, status: 'pending' },

  { id: 120, name: 'Klein Dach', client: 'SolarDirekt', date: '2023-10-21', team: 'AC01', type: 'PV Complete', revenue: 5100, profit: 1500, margin: 29.4, status: 'paid' },

  { id: 119, name: 'Bauer Hof (Gen2)', client: 'Enpal GmbH', date: '2023-10-20', team: 'AC02', type: 'Gen1/Gen2', revenue: 1800, profit: 600, margin: 33.3, status: 'paid' },

  { id: 118, name: 'Fischer EFH', client: 'Private', date: '2023-10-19', team: 'AC03', type: 'PV Complete', revenue: 6500, profit: 2200, margin: 33.8, status: 'pending' },

  { id: 117, name: 'Wagner Wallbox', client: 'Private', date: '2023-10-18', team: 'AC04', type: 'Wallbox', revenue: 750, profit: 250, margin: 33.3, status: 'paid' },

  { id: 116, name: 'Richter AC Montage', client: 'EnergieKonzpt', date: '2023-10-17', team: 'AC01', type: 'PV AC-Only', revenue: 2400, profit: 900, margin: 37.5, status: 'paid' },

  { id: 115, name: 'Wolf Speicher', client: '1KOMMA5°', date: '2023-10-16', team: 'AC02', type: 'Speicher', revenue: 1900, profit: 400, margin: 21.0, status: 'paid' },

  { id: 114, name: 'Neumann Notstrom', client: 'Enpal GmbH', date: '2023-10-15', team: 'AC03', type: 'Retrofit', revenue: 1500, profit: 100, margin: 6.6, status: 'pending' }, // Low margin

];

// 3. WAREHOUSE (Realistic Cable & Components)

const WAREHOUSE_DATA = [

  { id: 'w1', name: 'NYM-J 5x10 mm²', cat: 'Kabel AC', stock: 320, unit: 'm', max: 500, min: 50, status: 'ok' },

  { id: 'w2', name: 'NYM-J 5x6 mm²', cat: 'Kabel AC', stock: 25, unit: 'm', max: 200, min: 40, status: 'warning' }, 

  { id: 'w3', name: 'H1Z2Z2-K 6mm² (Solar)', cat: 'Kabel DC', stock: 850, unit: 'm', max: 1000, min: 200, status: 'ok' },

  { id: 'w4', name: 'SLS Schalter E35A', cat: 'Schutz', stock: 2, unit: 'stk', max: 20, min: 4, status: 'critical' }, 

  { id: 'w5', name: 'ÜSS Weidmüller DC', cat: 'Schutz', stock: 14, unit: 'stk', max: 30, min: 5, status: 'ok' },

  { id: 'w6', name: 'Huawei SmartMeter 3-phase', cat: 'Komponenten', stock: 8, unit: 'stk', max: 15, min: 2, status: 'ok' },

  { id: 'w7', name: 'Sungrow Hybrid SH10RT', cat: 'Inverter', stock: 3, unit: 'stk', max: 5, min: 1, status: 'ok' },

  { id: 'w8', name: 'MC4 Stecker (Paar)', cat: 'Kleinteile', stock: 120, unit: 'paar', max: 200, min: 50, status: 'ok' },

];

// 4. INVOICE QUEUE

const MOCK_INVOICE_QUEUE = [

  { id: 205, client: 'Enpal GmbH', address: 'Berlin, Hauptstr. 12', type: 'PV Complete', planDate: '2023-10-26', status: 'ready', team: 'AC01' },

  { id: 204, client: '1KOMMA5°', address: 'Potsdam, Lindenweg 4', type: 'Speicher', planDate: '2023-10-25', status: 'sent', team: 'AC02' },

  { id: 203, client: 'Dr. Müller (Private)', address: 'Bernau, Feldstr. 88', type: 'Wallbox', planDate: '2023-10-24', status: 'paid', team: 'AC03' },

  { id: 202, client: 'Enpal GmbH', address: 'Oranienburg, See 2', type: 'PV Complete', planDate: '2023-10-27', status: 'ready', team: 'AC01' },

  { id: 201, client: 'SolarDirekt', address: 'Falkensee, Ring 10', type: 'Gen1/Gen2', planDate: '2023-10-23', status: 'sent', team: 'AC04' },

];

const JOB_TEMPLATES = [

  { id: 'pv_ac_dc', name: 'PV Complete (AC+DC)', price: 2400, icon: Zap, desc: 'Полный монтаж до 10 kWp' },

  { id: 'pv_dc', name: 'PV DC Only', price: 1500, icon: Home, desc: 'Только крышные работы' },

  { id: 'speicher', name: 'Speicher Installation', price: 850, icon: Battery, desc: 'Установка аккумулятора' },

  { id: 'retrofit', name: 'Retrofit / Wechsel', price: 1200, icon: RefreshCw, desc: 'Замена инвертора/системы' },

  { id: 'wallbox', name: 'Wallbox', price: 650, icon: Plug, desc: 'Монтаж зарядной станции' },

  { id: 'service', name: 'Wartung / Service', price: 250, icon: Settings, desc: 'Выезд сервисной бригады' },

];

// --- UTILS ---

const formatEUR = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

// --- COMPONENTS ---

const Sparkline = ({ data, color }: { data: any[], color: string }) => (

  <div className="h-12 w-24">

    <ResponsiveContainer width="100%" height="100%">

      <AreaChart data={data}>

        <defs>

          <linearGradient id={`grad_${color}`} x1="0" y1="0" x2="0" y2="1">

            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>

            <stop offset="95%" stopColor={color} stopOpacity={0}/>

          </linearGradient>

        </defs>

        <Area type="monotone" dataKey="val" stroke={color} strokeWidth={2} fill={`url(#grad_${color})`} />

      </AreaChart>

    </ResponsiveContainer>

  </div>

);

const StatusTag = ({ status }: { status: string }) => {

  const styles: any = {

    paid: 'bg-emerald-100 text-emerald-700',

    pending: 'bg-amber-100 text-amber-700',

    overdue: 'bg-rose-100 text-rose-700',

    ready: 'bg-indigo-100 text-indigo-700',

    sent: 'bg-slate-100 text-slate-700',

  };

  const labels: any = {

    paid: 'Оплачено', pending: 'В работе', overdue: 'Просрочено', ready: 'Ждет счет', sent: 'Отправлено'

  };

  return (

    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-slate-100'}`}>

      {labels[status] || status}

    </span>

  );

};

const TypeTag = ({ type }: { type: string }) => {

  let color = 'bg-slate-100 text-slate-600';

  if(type.includes('PV')) color = 'bg-blue-100 text-blue-700';

  if(type.includes('Speicher')) color = 'bg-purple-100 text-purple-700';

  if(type.includes('Wallbox')) color = 'bg-orange-100 text-orange-700';

  if(type.includes('Retrofit')) color = 'bg-amber-100 text-amber-700';

  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${color}`}>{type}</span>

}

// ============================================

// PAGE: DASHBOARD (6 MONTH VIEW)

// ============================================

const Dashboard = () => {

  // Aggregate mock data for KPIs

  const kpiData = [

    { label: 'Выручка (6 мес)', val: 842500, trend: '+15%', sub: 'Стабильный рост', chart: [{val:60}, {val:65}, {val:75}, {val:72}, {val:85}, {val:90}], color: '#4F46E5' },

    { label: 'Чистая Прибыль', val: 215400, trend: '+8%', sub: 'Маржа 25.5%', chart: [{val:20}, {val:22}, {val:25}, {val:24}, {val:28}, {val:30}], color: '#10B981' },

    { label: 'Дебиторка (Долг)', val: 28400, trend: '+2%', sub: '5 клиентов', chart: [{val:10}, {val:12}, {val:15}, {val:20}, {val:18}, {val:28}], color: '#F59E0B' },

    { label: 'Всего объектов', val: 284, trend: '+12', sub: '47 за Октябрь', chart: [{val:30}, {val:35}, {val:40}, {val:42}, {val:45}, {val:47}], color: '#6366F1' },

  ];

  return (

    <div className="space-y-6 animate-in fade-in duration-500">

      

      {/* KPI GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {kpiData.map((kpi, i) => (

          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-end hover:shadow-md transition-shadow">

            <div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>

              <h3 className="text-2xl font-bold text-slate-800 tabular-nums">{kpi.label.includes('объектов') ? kpi.val : formatEUR(kpi.val)}</h3>

              <div className="flex items-center gap-2 mt-2">

                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>

                  {kpi.trend}

                </span>

                <span className="text-xs text-slate-400">{kpi.sub}</span>

              </div>

            </div>

            <Sparkline data={kpi.chart} color={kpi.color} />

          </div>

        ))}

      </div>

      {/* WARNINGS BLOCK */}

      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div className="flex items-center gap-3">

            <div className="bg-white p-2 rounded-full text-rose-600 shadow-sm"><AlertTriangle size={20}/></div>

            <div>

                <h4 className="font-bold text-rose-800 text-sm">Внимание: 2 убыточных проекта</h4>

                <p className="text-xs text-rose-600">"Lange Speicher" (-€150) и "Neumann Retrofit" (Маржа 6%)</p>

            </div>

        </div>

        <div className="flex gap-2">

            <button className="text-xs font-bold bg-white text-rose-700 px-3 py-2 rounded-lg border border-rose-200 hover:bg-rose-100">Подробнее</button>

        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          

          {/* MAIN CHART (6 MONTHS) */}

          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

             <div className="flex justify-between items-center mb-6">

                <div>

                    <h3 className="font-bold text-slate-800">Рост выручки (Полгода)</h3>

                    <p className="text-sm text-slate-400">Сравнение эффективности команд</p>

                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">

                    <button className="text-xs font-bold px-3 py-1 bg-white shadow-sm rounded text-slate-800">Выручка</button>

                    <button className="text-xs font-bold px-3 py-1 text-slate-500 hover:text-slate-800">Маржа %</button>

                </div>

             </div>

             <div className="h-72">

                <ResponsiveContainer width="100%" height="100%">

                    <LineChart data={SIX_MONTH_TREND}>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>

                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#94A3B8'}} dy={10} />

                        <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#94A3B8'}} tickFormatter={(val) => `€${val/1000}k`}/>

                        <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />

                        <Line type="monotone" dataKey="AC01" stroke={COLORS.AC01} strokeWidth={3} dot={{r:4}} />

                        <Line type="monotone" dataKey="AC02" stroke={COLORS.AC02} strokeWidth={3} dot={{r:4}} />

                        <Line type="monotone" dataKey="AC03" stroke={COLORS.AC03} strokeWidth={3} dot={{r:4}} />

                        <Line type="monotone" dataKey="AC04" stroke={COLORS.AC04} strokeWidth={3} dot={{r:4}} />

                    </LineChart>

                </ResponsiveContainer>

             </div>

          </div>

          {/* TOP PROJECTS LIST */}

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">

              <h3 className="font-bold text-slate-800 mb-4">ТОП-3 Проекта (Октябрь)</h3>

              <div className="flex-1 space-y-4">

                  {[

                      { name: 'Schmidt Villa 12kWp', margin: 34.5, profit: 1450, team: 'AC01' },

                      { name: 'Fischer EFH PV', margin: 33.8, profit: 2200, team: 'AC03' },

                      { name: 'Weber Wallbox', margin: 37.6, profit: 320, team: 'AC02' },

                  ].map((p, i) => (

                      <div key={i} className="flex justify-between items-center pb-3 border-b border-slate-50 last:border-0">

                          <div>

                              <p className="font-bold text-sm text-slate-700 truncate w-32 md:w-auto">{p.name}</p>

                              <div className="flex items-center gap-2">

                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{p.team}</span>

                                <p className="text-xs text-slate-400">Прибыль: €{p.profit}</p>

                              </div>

                          </div>

                          <div className="text-right">

                              <span className="text-sm font-bold text-emerald-600">{p.margin}%</span>

                          </div>

                      </div>

                  ))}

              </div>

              <button className="mt-auto w-full py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg border border-dashed border-slate-300 transition-colors">

                  Показать убыточные проекты

              </button>

          </div>

      </div>

    </div>

  );

};

// ============================================

// PAGE: TEAMS

// ============================================

const Teams = () => {

    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

    if (!selectedTeam) return (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">

            {TEAMS.map(team => (

                <div key={team.id} onClick={() => setSelectedTeam(team.id)} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden">

                    <div className={`absolute top-0 left-0 w-1 h-full`} style={{backgroundColor: team.color}}></div>

                    <div className="flex justify-between items-start mb-6">

                        <div className="flex items-center gap-4">

                            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md" style={{backgroundColor: team.color}}>

                                {team.avatar}

                            </div>

                            <div>

                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{team.name}</h3>

                                <p className="text-sm text-slate-500">{team.members}</p>

                            </div>

                        </div>

                        <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />

                    </div>

                    

                    <div className="grid grid-cols-2 gap-4">

                        <div className="bg-slate-50 p-3 rounded-lg">

                            <p className="text-[10px] text-slate-400 uppercase font-bold">Выручка (6 мес)</p>

                            <p className="text-lg font-bold text-slate-800">{team.stats.rev}</p>

                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg">

                            <p className="text-[10px] text-slate-400 uppercase font-bold">Скорость</p>

                            <p className={`text-lg font-bold ${team.stats.speed === 'High' ? 'text-emerald-600' : 'text-amber-600'}`}>{team.stats.speed}</p>

                        </div>

                    </div>

                </div>

            ))}

        </div>

    );

    return (

        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">

            <button onClick={() => setSelectedTeam(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-2">

                <ChevronLeft size={16}/> Назад к списку

            </button>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                <div className="flex items-center gap-4">

                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md" style={{backgroundColor: TEAMS.find(t => t.id === selectedTeam)?.color}}>

                        {TEAMS.find(t => t.id === selectedTeam)?.avatar}

                    </div>

                    <div>

                        <h1 className="text-2xl font-bold text-slate-800">{TEAMS.find(t => t.id === selectedTeam)?.name}</h1>

                        <p className="text-slate-500 text-sm flex items-center gap-2"><Users size={14}/> {TEAMS.find(t => t.id === selectedTeam)?.members}</p>

                    </div>

                </div>

            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

                <h3 className="font-bold text-slate-800 mb-4">История эффективности (Последние 30 дней)</h3>

                <div className="h-64">

                    <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={[

                            {d:'1-5', v:4200}, {d:'6-10', v:3500}, {d:'11-15', v:5100}, {d:'16-20', v:2400}, {d:'21-25', v:4800}, {d:'26-30', v:3900}

                        ]}>

                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>

                             <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fontSize:12}} />

                             <Tooltip cursor={{fill: '#F1F5F9'}} />

                             <Bar dataKey="v" fill={TEAMS.find(t => t.id === selectedTeam)?.color} radius={[4,4,0,0]} />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </div>

    );

}

// ============================================

// PAGE: WAREHOUSE (Detailed)

// ============================================

const Warehouse = () => {

    return (

        <div className="space-y-6 animate-in fade-in">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="col-span-2 bg-indigo-600 text-white p-6 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-200 relative overflow-hidden">

                    <div className="relative z-10">

                        <h3 className="text-xl font-bold mb-1">Склад заполнен на 82%</h3>

                        <p className="text-indigo-200 text-sm">Стоимость остатков: € 68,240</p>

                    </div>

                    <div className="flex gap-3 relative z-10">

                        <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50">Инвентаризация</button>

                    </div>

                    <Package className="absolute right-4 bottom-4 text-slate-700 w-24 h-24 opacity-20" />

                </div>

                <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm flex flex-col justify-center">

                    <h4 className="font-bold text-rose-600 flex items-center gap-2 mb-2"><AlertCircle size={18}/> Критические (2)</h4>

                    <ul className="space-y-2">

                        <li className="flex justify-between text-sm text-slate-700"><span>SLS E35A</span> <span className="font-bold text-rose-600">2 шт</span></li>

                        <li className="flex justify-between text-sm text-slate-700"><span>NYM 5x6</span> <span className="font-bold text-amber-500">25 м</span></li>

                    </ul>

                </div>

            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                 {WAREHOUSE_DATA.map(item => {

                     const pct = (item.stock / item.max) * 100;

                     let statusColor = 'bg-indigo-500';

                     if(item.status === 'critical') statusColor = 'bg-rose-500';

                     else if(item.status === 'warning') statusColor = 'bg-amber-500';

                     return (

                         <div key={item.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors group">

                             <div className="flex justify-between items-start mb-4">

                                 <div>

                                     <span className="text-[10px] font-bold text-slate-400 uppercase">{item.cat}</span>

                                     <h4 className="font-bold text-slate-800">{item.name}</h4>

                                 </div>

                                 <span className={`text-lg font-bold tabular-nums ${item.status === 'critical' ? 'text-rose-600' : 'text-slate-700'}`}>

                                     {item.stock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>

                                 </span>

                             </div>

                             <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">

                                 <div className={`h-full ${statusColor} transition-all duration-500`} style={{width: `${pct}%`}}></div>

                             </div>

                             <div className="flex gap-2">

                                 <button className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100">-</button>

                                 <button className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100">+</button>

                             </div>

                         </div>

                     )

                 })}

            </div>

        </div>

    )

}

// ============================================

// PAGE: OPERATIONS / PROJECTS LIST

// ============================================

const Operations = () => {

    return (

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">

            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">

                <div className="flex items-center gap-2">

                    <button className="px-3 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg shadow-sm">Все</button>

                    <button className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Неоплаченные</button>

                    <button className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 flex items-center gap-1"><AlertCircle size={12}/> Проблемные</button>

                </div>

                <div className="flex gap-2">

                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg border border-slate-200"><Filter size={16}/></button>

                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg border border-slate-200"><Download size={16}/></button>

                </div>

            </div>

            <div className="overflow-x-auto">

                <table className="w-full text-sm">

                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">

                        <tr>

                            <th className="px-6 py-3 text-left">Статус</th>

                            <th className="px-6 py-3 text-left">Проект / Дата</th>

                            <th className="px-6 py-3 text-left">Команда</th>

                            <th className="px-6 py-3 text-right">Выручка</th>

                            <th className="px-6 py-3 text-right">Прибыль</th>

                            <th className="px-6 py-3 text-right">Маржа</th>

                            <th className="px-6 py-3"></th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                        {MOCK_PROJECTS.map(p => (

                            <tr key={p.id} className="hover:bg-slate-50 transition-colors group">

                                <td className="px-6 py-4"><StatusTag status={p.status} /></td>

                                <td className="px-6 py-4">

                                    <div className="font-bold text-slate-800">{p.name}</div>

                                    <div className="flex items-center gap-2 mt-1">

                                        <TypeTag type={p.type} />

                                        <span className="text-xs text-slate-400">{p.date}</span>

                                    </div>

                                </td>

                                <td className="px-6 py-4">

                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">

                                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[p.team as keyof typeof COLORS]}}></span>

                                        {p.team}

                                    </span>

                                </td>

                                <td className="px-6 py-4 text-right font-medium tabular-nums">{formatEUR(p.revenue)}</td>

                                <td className={`px-6 py-4 text-right font-bold tabular-nums ${p.profit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>

                                    {formatEUR(p.profit)}

                                </td>

                                <td className="px-6 py-4 text-right">

                                    <span className={`text-xs font-bold px-2 py-1 rounded ${p.margin > 20 ? 'bg-emerald-50 text-emerald-700' : p.margin > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>

                                        {p.margin}%

                                    </span>

                                </td>

                                <td className="px-6 py-4 text-center">

                                    <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={16}/></button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    )

}

// ============================================

// PAGE: INVOICES (With Data)

// ============================================

const Invoices = () => {

  const [view, setView] = useState<'list' | 'create'>('list');

  const [selectedClient, setSelectedClient] = useState<any>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [isSending, setIsSending] = useState(false);

  // CREATE INVOICE VIEW

  if (view === 'create' && selectedClient) {

    const handleSend = () => {

      setIsSending(true);

      setTimeout(() => { setIsSending(false); setView('list'); }, 1500);

    };

    return (

      <div className="animate-in slide-in-from-right duration-300 max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-6">

          <button onClick={() => setView('list')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500"><ChevronLeft size={24} /></button>

          <div><h2 className="text-2xl font-bold text-slate-800">Создать счет</h2><p className="text-slate-500">для {selectedClient.client}</p></div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers size={18} className="text-indigo-600"/> 1. Тип работ</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {JOB_TEMPLATES.map(tpl => {

                    const Icon = tpl.icon;

                    return (

                    <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${selectedTemplate?.id === tpl.id ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>

                      <div className={`p-3 rounded-lg ${selectedTemplate?.id === tpl.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 shadow-sm'}`}><Icon size={24} /></div>

                      <div><h4 className={`font-bold ${selectedTemplate?.id === tpl.id ? 'text-indigo-900' : 'text-slate-800'}`}>{tpl.name}</h4><p className="text-sm font-bold text-slate-900 mt-2">€ {tpl.price}</p></div>

                      {selectedTemplate?.id === tpl.id && <div className="ml-auto text-indigo-600"><Check size={20}/></div>}

                    </div>

                  )})}

                </div>

             </div>

          </div>

          <div className="space-y-6">

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg sticky top-6">

                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-6">Предпросмотр</h3>

                <div className="space-y-4 mb-8">

                  <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 text-sm">Клиент</span><span className="font-bold text-slate-800 text-right">{selectedClient.client}<br/><span className="text-xs font-normal text-slate-400">{selectedClient.address}</span></span></div>

                  <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 text-sm">Работа</span><span className="font-medium text-slate-800">{selectedTemplate ? selectedTemplate.name : '-'}</span></div>

                  <div className="flex justify-between items-center pt-2"><span className="text-slate-800 font-bold">Итого (Netto)</span><span className="text-2xl font-black text-indigo-600">€ {selectedTemplate ? selectedTemplate.price : 0}</span></div>

                </div>

                <button disabled={!selectedTemplate || isSending} onClick={handleSend} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${!selectedTemplate ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{isSending ? (<><Loader2 className="animate-spin" /> Отправка...</>) : (<><Send size={18} /> Отправить в LexOffice</>)}</button>

             </div>

          </div>

        </div>

      </div>

    );

  }

  // INVOICE LIST

  return (

    <div className="space-y-6 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">

        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">

           <button className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-800 rounded-md">Все</button>

           <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-md">Готовы к счету</button>

        </div>

        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"><Plus size={16}/> Добавить клиента</button>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <table className="w-full text-sm text-left">

          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">

            <tr>

              <th className="px-6 py-4">Клиент</th>

              <th className="px-6 py-4">Адрес объекта</th>

              <th className="px-6 py-4">План монтажа</th>

              <th className="px-6 py-4">Тип</th>

              <th className="px-6 py-4">Статус</th>

              <th className="px-6 py-4 text-right">Действие</th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {MOCK_INVOICE_QUEUE.map((item) => (

              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">

                <td className="px-6 py-4 font-bold text-slate-800">{item.client}</td>

                <td className="px-6 py-4 text-slate-600">{item.address}</td>

                <td className="px-6 py-4 font-medium text-slate-800">{item.planDate}</td>

                <td className="px-6 py-4"><TypeTag type={item.type}/></td>

                <td className="px-6 py-4"><StatusTag status={item.status} /></td>

                <td className="px-6 py-4 text-right">

                  {item.status === 'ready' ? (

                    <button onClick={() => { setSelectedClient(item); setView('create'); setSelectedTemplate(null); }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"><FileText size={14}/> Счет</button>

                  ) : (<span className="text-slate-400 text-xs flex items-center justify-end gap-1"><Check size={14}/> Готово</span>)}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

// ============================================

// APP SHELL

// ============================================

export default function SolarSaaS() {

  const [activeTab, setActiveTab] = useState('dashboard');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ id, icon: Icon, label }: any) => (

    <button 

      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}

      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}

    >

      <Icon size={20} />

      {label}

    </button>

  );

  return (

    <div className="flex h-screen bg-[#F5F6FA] font-sans text-slate-900 overflow-hidden">

      

      {/* SIDEBAR */}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#F5F6FA] border-r border-slate-200 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex flex-col`}>

        <div className="p-6 flex items-center gap-3">

          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-400/50">

            <Zap size={20} fill="currentColor"/>

          </div>

          <span className="font-bold text-xl tracking-tight text-slate-800">Solar<span className="text-indigo-600">SaaS</span></span>

        </div>

        <nav className="flex-1 px-4 space-y-1 py-4">

            <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2">Основное</p>

            <NavItem id="dashboard" icon={LayoutGrid} label="Дашборд" />

            <NavItem id="teams" icon={Users} label="Команды" />

            <NavItem id="operations" icon={Layers} label="Операции" />

            <NavItem id="warehouse" icon={Box} label="Склад" />

            <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2 mt-6">Финансы</p>

            <NavItem id="invoices" icon={FileText} label="Счета" />

        </nav>

      </aside>

      {/* MAIN CONTENT */}

      <main className="flex-1 flex flex-col overflow-hidden relative">

        <header className="h-16 flex items-center justify-between px-6 bg-[#F5F6FA]/80 backdrop-blur-md sticky top-0 z-30">

           <div className="flex items-center gap-4">

               <button className="md:hidden p-2 bg-white rounded-lg shadow-sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>

                   <LayoutGrid size={20}/>

               </button>

               <h1 className="text-xl font-bold text-slate-800 capitalize">

                   {activeTab === 'invoices' ? 'Управление счетами' : activeTab === 'dashboard' ? 'Обзор компании' : activeTab}

               </h1>

           </div>

           

           <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95">

                <Plus size={18} />

                <span className="hidden sm:inline">Операция</span>

            </button>

        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">

            <div className="max-w-7xl mx-auto">

                {activeTab === 'dashboard' && <Dashboard />}

                {activeTab === 'teams' && <Teams />}

                {activeTab === 'warehouse' && <Warehouse />}

                {activeTab === 'operations' && <Operations />}

                {activeTab === 'invoices' && <Invoices />}

            </div>

        </div>

        {/* Placeholder Modal for Add Operation */}

        {isModalOpen && (

            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

                <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">

                    <h2 className="text-xl font-bold mb-4">Добавить операцию</h2>

                    <p className="text-slate-500 mb-6">Эта форма подключается к базе данных операций.</p>

                    <div className="flex justify-end gap-2">

                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-slate-500">Отмена</button>

                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">ОК</button>

                    </div>

                </div>

            </div>

        )}

      </main>

      

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

    </div>

  );

}

