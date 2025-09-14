export enum JobStatus {
  Queueing = 'Dalam Antrian',
  Generating = 'Membuat',
  Completed = 'Selesai',
  Failed = 'Gagal',
  Cancelled = 'Dibatalkan',
}

export interface VideoJob {
  id: string;
  prompt: string;
  status: JobStatus;
  progressMessage: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export enum Tab {
  Dashboard = 'Dasbor',
  PromptGenerator = 'Buat Prompt',
  Setup = 'Pengaturan',
  About = 'Tentang',
}

export interface VideoSettings {
  aspectRatio: '16:9' | '9:16';
}