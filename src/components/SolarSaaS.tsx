import { useState } from 'react';
import type { ElementType } from 'react';

import { FileText, LayoutGrid, TrendingUp, Users, Wallet, Zap } from 'lucide-react';

import { StatsPage } from '../features/dashboard/components/StatsPage';
import { CrmPage } from '../features/crm/components/CrmPage';
import { PvIntakePage } from '../features/pvIntake/components/PvIntakePage';
import { FinanceDashboardPage } from '../features/finance/components/FinanceDashboardPage';

// --- COMPONENTS ---

// APP SHELL

// ============================================

export default function SolarSaaS() {
  const [activeTab, setActiveTab] = useState<
    'backend-dashboard' | 'crm' | 'pv-intake' | 'finance'
  >(
    'backend-dashboard'
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ id, icon: Icon, label }: { id: string; icon: ElementType; label: string }) => {
    const handleClick = () => {
      setActiveTab(id as 'backend-dashboard' | 'crm' | 'pv-intake' | 'finance');
      setIsMobileMenuOpen(false);
    };

    return (
      <button 
        onClick={handleClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
      >
        <Icon size={20} />
        {label}
      </button>
    );
  };

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
            <NavItem id="backend-dashboard" icon={TrendingUp} label="Статистика" />
            <NavItem id="crm" icon={Users} label="CRM" />
            <NavItem id="pv-intake" icon={FileText} label="PV-Anmeldung" />
            <NavItem id="finance" icon={Wallet} label="Finance" />

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
                 {activeTab === 'crm'
                   ? 'CRM'
                   : activeTab === 'pv-intake'
                     ? 'PV Intake & Anmeldung'
                     : activeTab === 'finance'
                       ? 'Finance Dashboard'
                       : 'Статистика'}
               </h1>

           </div>

           

        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">

            <div className="max-w-7xl mx-auto">

                {activeTab === 'crm' ? (
                  <CrmPage />
                ) : activeTab === 'pv-intake' ? (
                  <PvIntakePage />
                ) : activeTab === 'finance' ? (
                  <FinanceDashboardPage />
                ) : (
                  <StatsPage />
                )}

            </div>

        </div>

      </main>

      

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

    </div>

  );

}

