import React, { useState } from 'react';
import { Tab } from './types';
import Dashboard from './components/Dashboard';
import PromptGenerator from './components/PromptGenerator';
import Setup from './components/Setup';
import About from './components/About';
import { PinnStudioLogo } from './components/icons/PinnStudioLogo';
import { DashboardIcon, LightbulbIcon, SettingsIcon, InfoIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [apiKey, setApiKey] = useState<string>('');

  const TabButton = ({ tab, icon, label }: { tab: Tab; icon: JSX.Element; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
        activeTab === tab
          ? 'bg-[#FF00A8] text-white shadow-lg shadow-[#FF00A8]/30'
          : 'text-gray-400 hover:bg-[#1C1F26]/80 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans">
      <div className="container mx-auto p-4 md:p-6">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-[#4B0082]">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <PinnStudioLogo />
            <h1 className="text-2xl font-bold text-white tracking-wider">VEO 2 AUTO GENERATE PINN STUDIO</h1>
          </div>
          <nav className="flex flex-wrap justify-center space-x-2 bg-[#1C1F26]/50 p-2 rounded-lg backdrop-blur-sm border border-[#4B0082]/50">
            <TabButton tab={Tab.Dashboard} icon={<DashboardIcon />} label="Dasbor" />
            <TabButton tab={Tab.PromptGenerator} icon={<LightbulbIcon />} label="Buat Prompt" />
            <TabButton tab={Tab.Setup} icon={<SettingsIcon />} label="Pengaturan" />
            <TabButton tab={Tab.About} icon={<InfoIcon />} label="Tentang" />
          </nav>
        </header>

        <main>
          <div className={activeTab === Tab.Dashboard ? '' : 'hidden'}>
            <Dashboard apiKey={apiKey} />
          </div>
          <div className={activeTab === Tab.PromptGenerator ? '' : 'hidden'}>
            <PromptGenerator apiKey={apiKey} />
          </div>
          <div className={activeTab === Tab.Setup ? '' : 'hidden'}>
            <Setup apiKey={apiKey} setApiKey={setApiKey} />
          </div>
           <div className={activeTab === Tab.About ? '' : 'hidden'}>
            <About />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
