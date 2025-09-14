import React, { useState, useCallback } from 'react';
import { generatePrompts } from '../services/geminiService';
import { LightbulbIcon, SpinnerIcon, ClipboardIcon } from './icons/Icons';

interface PromptGeneratorProps {
    apiKey: string;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ apiKey }) => {
    const [ideas, setIdeas] = useState('');
    const [promptCount, setPromptCount] = useState(5);
    const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        const ideaList = ideas.split('\n').map(i => i.trim()).filter(i => i.length > 0);
        if (ideaList.length === 0 || !apiKey) return;

        setIsLoading(true);
        setError(null);
        setGeneratedPrompts({});
        let newGeneratedPrompts: Record<string, string[]> = {};

        try {
            for (const idea of ideaList) {
                const result = await generatePrompts(idea, promptCount, apiKey);
                newGeneratedPrompts[idea] = result.split('\n').filter(p => p.trim().length > 0);
                setGeneratedPrompts({ ...newGeneratedPrompts });
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [ideas, promptCount, apiKey]);

    const handleCopy = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(prompt);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto bg-[#1C1F26] p-6 rounded-lg shadow-2xl border border-[#4B0082]">
            <div className="text-center mb-6">
                <LightbulbIcon className="mx-auto h-12 w-12 text-[#00E6FF]" />
                <h2 className="text-2xl font-bold mt-4 text-white">AI Pembuat Prompt</h2>
                <p className="text-gray-400 mt-2">Ubah ide sederhana Anda menjadi prompt video sinematik.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                    <label htmlFor="ideas-input" className="block text-sm font-medium text-gray-300 mb-2">Ide Anda (satu per baris)</label>
                    <textarea
                        id="ideas-input"
                        rows={4}
                        value={ideas}
                        onChange={(e) => setIdeas(e.target.value)}
                        placeholder="Contoh: &#10;kucing di luar angkasa&#10;naga di kota cyberpunk"
                        className="w-full bg-gray-800 border border-[#4B0082] rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-[#FF00A8] transition-colors duration-200"
                        disabled={isLoading}
                    />
                </div>
                <div>
                     <label htmlFor="prompt-count" className="block text-sm font-medium text-gray-300 mb-2">Jumlah Prompt</label>
                     <input
                        type="number"
                        id="prompt-count"
                        value={promptCount}
                        onChange={(e) => setPromptCount(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))}
                        min="1"
                        max="10"
                        className="w-full bg-gray-800 border border-[#4B0082] rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-[#FF00A8] transition-colors duration-200"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !ideas.trim() || !apiKey}
                className="w-full mt-4 bg-[#FF00A8] text-white font-bold py-3 px-6 rounded-md flex items-center justify-center space-x-2 hover:bg-[#d1008b] disabled:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-[#FF00A8]/50"
                 title={!apiKey ? "Harap masukkan Kunci API di tab Pengaturan" : ""}
            >
                {isLoading ? <SpinnerIcon className="animate-spin" /> : <LightbulbIcon />}
                <span>{isLoading ? 'Membuat...' : 'Buat Prompt'}</span>
            </button>


            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            
            {Object.keys(generatedPrompts).length > 0 && (
                <div className="mt-8 space-y-6">
                    {Object.entries(generatedPrompts).map(([idea, prompts]) => (
                         <div key={idea}>
                            <h3 className="text-lg font-semibold text-white mb-3">
                                Hasil untuk: <span className="text-[#00E6FF] font-normal">"{idea}"</span>
                            </h3>
                            <div className="space-y-3">
                                {prompts.map((prompt, index) => (
                                    <div key={index} className="bg-gray-800/50 p-4 rounded-md flex justify-between items-start gap-4 border border-[#4B0082]/50">
                                        <p className="text-gray-300">{prompt}</p>
                                        <button onClick={() => handleCopy(prompt)} className="text-gray-400 hover:text-white transition-colors duration-200 p-1 flex-shrink-0 relative">
                                            <ClipboardIcon />
                                            {copiedPrompt === prompt && <span className="text-xs text-green-400 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black px-1 rounded">Disalin!</span>}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromptGenerator;