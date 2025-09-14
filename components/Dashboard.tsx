import React, { useState, useCallback, useEffect, useRef } from 'react';
import { VideoJob, JobStatus, VideoSettings } from '../types';
import { generateVideo } from '../services/geminiService';
import { PlayIcon, SpinnerIcon, CheckCircleIcon, XCircleIcon, AlertTriangleIcon, DownloadIcon, SettingsIcon, StopIcon } from './icons/Icons';

const getProgressPercentage = (status: JobStatus, message: string): number => {
    if (status === JobStatus.Completed) return 100;
    if (status === JobStatus.Failed || status === JobStatus.Queueing || status === JobStatus.Cancelled) return 0;

    const progressMap: { [key: string]: number } = {
        'Inisialisasi...': 2,
        'Mengirim permintaan ke model VEO...': 5,
        'Pembuatan video dimulai. Ini mungkin memakan waktu beberapa menit...': 10,
        'Memanaskan kanvas digital...': 20,
        'Mengajari piksel untuk menari...': 35,
        'Merangkai splines...': 50,
        'Menyusun urutan sinematik...': 65,
        'Memoles bingkai akhir...': 80,
        'Hampir selesai, keajaiban sedang terjadi...': 90,
        'Menyelesaikan dan mengambil video...': 95,
        'Membuat thumbnail...': 98,
    };
    
    if (status === JobStatus.Generating) {
        return progressMap[message] ?? 0;
    }

    return 0;
};

const VideoCard: React.FC<{ job: VideoJob }> = ({ job }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const prevStatusRef = useRef(job.status);

  useEffect(() => {
    if (prevStatusRef.current !== job.status) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 700);
      prevStatusRef.current = job.status;
      return () => clearTimeout(timer);
    }
  }, [job.status]);

  const getStatusColor = () => {
    switch (job.status) {
      case JobStatus.Queueing:
        return 'border-gray-600';
      case JobStatus.Generating:
        return 'border-[#00E6FF] animate-pulse';
      case JobStatus.Completed:
        return 'border-green-500';
      case JobStatus.Failed:
        return 'border-red-500';
      case JobStatus.Cancelled:
        return 'border-yellow-600';
    }
  };

  const getStatusIcon = () => {
    switch (job.status) {
      case JobStatus.Queueing:
        return <SpinnerIcon className="animate-spin text-gray-400" />;
      case JobStatus.Generating:
        return <SpinnerIcon className="animate-spin text-[#00E6FF]" />;
      case JobStatus.Completed:
        return <CheckCircleIcon className="text-green-400" />;
      case JobStatus.Failed:
        return <XCircleIcon className="text-red-400" />;
      case JobStatus.Cancelled:
        return <AlertTriangleIcon className="text-yellow-400" />;
    }
  };

  const progress = getProgressPercentage(job.status, job.progressMessage);

  return (
    <div className={`bg-[#1C1F26]/50 border ${getStatusColor()} rounded-lg shadow-xl p-4 flex flex-col space-y-3 transition-all duration-300 card-fade-in ${isFlashing ? 'status-change-flash' : ''}`}>
      <p className="text-gray-400 text-sm break-words flex-grow">"{job.prompt}"</p>
      <div className="border-t border-[#4B0082]/50 pt-3">
        {job.status === JobStatus.Generating ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="font-semibold uppercase tracking-wider">{job.status}</span>
              </div>
              <span className="font-medium text-[#00E6FF]">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#00E6FF] to-[#FF00A8] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-xs text-center truncate" title={job.progressMessage}>{job.progressMessage}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs min-h-[52px]">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-semibold uppercase tracking-wider">{job.status}</span>
            </div>
            <p className="text-gray-500 text-right truncate" title={job.progressMessage}>{job.progressMessage}</p>
          </div>
        )}
        
        {job.error && <p className="text-red-400 text-xs mt-2">{job.error}</p>}
        {job.status === JobStatus.Completed && job.videoUrl && (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg overflow-hidden border border-[#4B0082] relative aspect-video bg-black flex items-center justify-center group">
              {!showVideo && job.thumbnailUrl ? (
                <>
                  <img src={job.thumbnailUrl} alt={`Thumbnail untuk prompt: ${job.prompt}`} className="w-full h-full object-cover" />
                  <div
                    className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity duration-300 opacity-70 group-hover:opacity-100"
                    onClick={() => setShowVideo(true)}
                    aria-label="Putar video pratinjau"
                  >
                    <PlayIcon className="w-16 h-16 text-white/80 group-hover:text-white group-hover:scale-110 transition-transform duration-200" />
                  </div>
                </>
              ) : (
                <video src={job.videoUrl} controls autoPlay className="w-full h-full block" />
              )}
            </div>
            <a
              href={job.videoUrl}
              download={`veo2-pinnstudio${job.id}.mp4`}
              className="w-full bg-[#00E6FF] text-black font-bold py-2 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-[#00c5dd] transition-all duration-200"
              aria-label={`Unduh video untuk prompt: ${job.prompt}`}
            >
              <DownloadIcon />
              <span>Unduh Video</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

interface DashboardProps {
  apiKey: string;
}

const Dashboard: React.FC<DashboardProps> = ({ apiKey }) => {
  const [prompts, setPrompts] = useState<string>('');
  const [videoJobs, setVideoJobs] = useState<VideoJob[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const stopRequested = useRef(false);
  const videoJobsRef = useRef(videoJobs);
  
  useEffect(() => {
    videoJobsRef.current = videoJobs;
  }, [videoJobs]);
  
  const [settings, setSettings] = useState<VideoSettings>({
    aspectRatio: '16:9',
  });

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('veoVideoSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
            aspectRatio: parsed.aspectRatio === '9:16' ? '9:16' : '16:9'
        });
      }
    } catch (error) {
      console.error("Gagal memuat pengaturan dari localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('veoVideoSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Gagal menyimpan pengaturan ke localStorage", error);
    }
  }, [settings]);

  const handleSettingChange = (key: keyof VideoSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value as any }));
  };

  const updateJob = (id: string, updates: Partial<VideoJob>) => {
    setVideoJobs(prev => prev.map(job => job.id === id ? { ...job, ...updates } : job));
  };
  
  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Do not revoke object URL immediately, as the video player might still be using it.
    // In a larger app, we'd manage this lifecycle more carefully.
  };

  const handleStopGeneration = () => {
    stopRequested.current = true;
  };

  const handleStartGeneration = useCallback(async () => {
    if (!apiKey) {
      alert("Harap masukkan Kunci API Anda di tab Pengaturan terlebih dahulu.");
      return;
    }
    const promptList = prompts.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    if (promptList.length === 0 || isProcessing) return;

    setIsProcessing(true);
    stopRequested.current = false;
    setPrompts('');
    
    const newJobs: VideoJob[] = promptList.map((prompt, index) => ({
      id: `${Date.now()}-${index}`,
      prompt,
      status: JobStatus.Queueing,
      progressMessage: 'Menunggu di antrian...'
    }));

    setVideoJobs(prev => [...newJobs.reverse(), ...prev]);

    for (const job of newJobs) {
      if (stopRequested.current) {
        break;
      }
      try {
        updateJob(job.id, { status: JobStatus.Generating, progressMessage: 'Inisialisasi...' });
        const { videoUrl, thumbnailUrl } = await generateVideo(job.prompt, apiKey, (message) => {
          updateJob(job.id, { progressMessage: message });
        }, settings);
        updateJob(job.id, { status: JobStatus.Completed, videoUrl, thumbnailUrl, progressMessage: 'Selesai' });
        triggerDownload(videoUrl, `veo2-pinnstudio${job.id}.mp4`);
      } catch (error: any) {
        if (stopRequested.current) break;
        console.error('Pembuatan video gagal untuk prompt:', job.prompt, error);
        
        // Return the prompt to the list
        setPrompts(prev => {
            const currentPrompts = prev.trim();
            return currentPrompts ? `${currentPrompts}\n${job.prompt}` : job.prompt;
        });
        
        // Remove the failed job from the dashboard
        setVideoJobs(prev => prev.filter(j => j.id !== job.id));
      }
    }

    // Cleanup: After the loop finishes (normally or by stopping), remove any jobs still in the queue.
    const latestJobs = videoJobsRef.current;
    const queuedJobs = latestJobs.filter(j => j.status === JobStatus.Queueing);
    
    if (queuedJobs.length > 0) {
        const promptsToReturn = queuedJobs.map(j => j.prompt).reverse();

        setPrompts(prev => {
            const currentPrompts = prev.trim();
            const returnedPrompts = promptsToReturn.join('\n');
            return currentPrompts ? `${returnedPrompts}\n${currentPrompts}` : returnedPrompts;
        });
        
        setVideoJobs(prev => prev.filter(j => j.status !== JobStatus.Queueing));
    }
    
    setIsProcessing(false);
  }, [prompts, isProcessing, apiKey, settings]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-[#1C1F26] p-6 rounded-lg shadow-2xl border border-[#4B0082] flex flex-col">
        <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Prompt Video</h2>
            <p className="text-gray-400 text-sm mb-4">
            Masukkan satu prompt per baris. Program akan membuat video untuk setiap prompt secara berurutan.
            </p>
            <textarea
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
            placeholder="Contoh: Seekor singa gagah mengaum di tebing saat matahari terbenam, pencahayaan sinematik..."
            className="w-full h-48 bg-gray-800 border border-[#4B0082] rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-[#FF00A8] focus:border-[#FF00A8] transition-colors duration-200"
            disabled={isProcessing}
            />
        </div>

        <div className="mt-4 border-t border-[#4B0082]/50 pt-4">
            <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                <SettingsIcon />
                Pengaturan Video
            </h3>
            <div className="text-sm">
                <div>
                    <label htmlFor="aspectRatio" className="block text-gray-400 mb-1">Rasio Aspek</label>
                    <select
                    id="aspectRatio"
                    value={settings.aspectRatio}
                    onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
                    className="w-full bg-gray-800 border border-[#4B0082] rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-[#FF00A8] focus:border-[#FF00A8] transition-colors duration-200"
                    disabled={isProcessing}
                    >
                    <option value="16:9">16:9 (Lanskap)</option>
                    <option value="9:16">9:16 (Potret)</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="mt-auto pt-4 space-y-3">
          <button
            onClick={handleStartGeneration}
            disabled={isProcessing || prompts.trim().length === 0 || !apiKey}
            className="w-full bg-[#FF00A8] text-white font-bold py-3 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-[#d1008b] disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-[#FF00A8]/50"
            title={!apiKey ? "Harap masukkan Kunci API di tab Pengaturan" : ""}
            >
                <PlayIcon />
                <span>Start Creating Video</span>
            </button>
            <button
                onClick={handleStopGeneration}
                disabled={!isProcessing}
                className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-red-600/50"
            >
                <StopIcon />
                <span>Stop All Processes</span>
            </button>
            {!apiKey && (
                <div className="!mt-4 text-xs text-yellow-400 flex items-center gap-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded-md">
                    <AlertTriangleIcon className="w-8 h-8"/>
                    <span>Kunci API belum diatur. Silakan pergi ke tab <strong>Pengaturan</strong> untuk memasukkan kunci Anda.</span>
                </div>
            )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold mb-4 text-white">Video Dihasilkan</h2>
        {videoJobs.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-[#1C1F26]/50 border-2 border-dashed border-[#4B0082] rounded-lg">
            <p className="text-gray-500">Video yang Anda buat akan muncul di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
            {videoJobs.map(job => (
              <VideoCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;