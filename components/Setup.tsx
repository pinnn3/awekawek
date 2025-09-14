import React, { useState, useEffect } from 'react';
import { SettingsIcon, AlertTriangleIcon, CheckCircleIcon } from './icons/Icons';

interface SetupProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Setup: React.FC<SetupProps> = ({ apiKey, setApiKey }) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    setApiKey(localApiKey);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#1C1F26] p-8 rounded-lg shadow-2xl border border-[#4B0082]">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-[#00E6FF]" />
        <h2 className="text-2xl font-bold text-white">Pengaturan Kunci API</h2>
      </div>

      <div className="space-y-6 text-gray-300">
        <p>
          Untuk menggunakan fitur AI, Anda perlu memasukkan Kunci API Google Gemini Anda. Kunci ini hanya akan disimpan selama sesi ini dan tidak akan dibagikan ke mana pun.
        </p>

        <div className="space-y-2">
            <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300">Kunci API Gemini Anda</label>
            <input
                id="api-key-input"
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Masukkan Kunci API Anda di sini"
                className="w-full bg-gray-800 border border-[#4B0082] rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-[#FF00A8] transition-colors duration-200"
            />
        </div>
        
        <button
            onClick={handleSave}
            className="w-full bg-[#FF00A8] text-white font-bold py-3 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-[#d1008b] disabled:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-[#FF00A8]/50"
        >
            {saveStatus === 'success' ? <CheckCircleIcon /> : <SettingsIcon />}
            <span>{saveStatus === 'success' ? 'Kunci Telah Disimpan!' : 'Simpan Kunci API'}</span>
        </button>


        <div className="bg-[#1C1F26] border border-[#FF00A8]/50 text-yellow-300 p-4 rounded-lg flex items-start space-x-3 mt-4">
          <AlertTriangleIcon className="h-6 w-6 mt-1 flex-shrink-0 text-[#FF00A8]" />
          <div>
            <h3 className="font-semibold text-white">Pemberitahuan Keamanan Penting</h3>
            <p className="text-sm text-gray-400">
              Jangan pernah membagikan Kunci API Anda atau menampilkannya di kode sisi klien (frontend) dalam proyek publik. Aplikasi ini dirancang untuk penggunaan lokal dan pribadi.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Setup;