import { GoogleGenAI } from "@google/genai";
import { VideoSettings } from "../types";

const getAiClient = (apiKey: string) => {
  if (!apiKey) {
    throw new Error("Kunci API tidak dikonfigurasi. Silakan atur di tab Pengaturan.");
  }
  return new GoogleGenAI({ apiKey });
};

const generateThumbnail = (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';

    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };

    const onSeeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return reject(new Error('Gagal mendapatkan konteks canvas.'));
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        cleanup();
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } catch (e) {
        cleanup();
        reject(e);
      }
    };

    const onError = (e: Event | string) => {
      cleanup();
      reject(new Error(`Gagal memuat video untuk thumbnail: ${e.toString()}`));
    };

    const onLoadedMetadata = () => {
      video.currentTime = 1; // Seek to 1 second
    };
    
    video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });

    video.src = videoUrl;
    video.load();

    setTimeout(() => {
        reject(new Error('Waktu habis saat membuat thumbnail.'));
    }, 10000);
  });
};


export const generateVideo = async (
  prompt: string,
  apiKey: string,
  onProgress: (message: string) => void,
  settings: VideoSettings
): Promise<{ videoUrl: string; thumbnailUrl: string }> => {
  const ai = getAiClient(apiKey);

  onProgress("Mengirim permintaan ke model VEO...");
  let operation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      aspectRatio: settings.aspectRatio,
    }
  });

  onProgress("Pembuatan video dimulai. Ini mungkin memakan waktu beberapa menit...");
  
  const pollMessages = [
      "Memanaskan kanvas digital...",
      "Mengajari piksel untuk menari...",
      "Merangkai splines...",
      "Menyusun urutan sinematik...",
      "Memoles bingkai akhir...",
      "Hampir selesai, keajaiban sedang terjadi..."
  ];
  let messageIndex = 0;

  while (!operation.done) {
    onProgress(pollMessages[messageIndex % pollMessages.length]);
    messageIndex++;
    await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3 seconds
    try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch(e) {
        console.error("Polling gagal, mencoba lagi...", e);
    }
  }

  onProgress("Menyelesaikan dan mengambil video...");
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error('Pembuatan video selesai, tetapi tidak ada tautan unduhan yang diberikan.');
  }

  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!response.ok) {
    throw new Error(`Gagal mengunduh video: ${response.statusText}`);
  }
  const videoBlob = await response.blob();
  const videoUrl = URL.createObjectURL(videoBlob);

  onProgress("Membuat thumbnail...");
  let thumbnailUrl: string;
  try {
    thumbnailUrl = await generateThumbnail(videoUrl);
  } catch (e) {
    console.error("Gagal membuat thumbnail:", e);
    thumbnailUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // Fallback to transparent pixel
  }

  return { videoUrl, thumbnailUrl };
};

export const generatePrompts = async (idea: string, count: number, apiKey: string): Promise<string> => {
    const ai = getAiClient(apiKey);

    const systemInstruction = `Anda adalah asisten kreatif untuk produser video. Tugas Anda adalah mengambil ide sederhana dari pengguna dan mengembangkannya menjadi ${count} prompt yang detail, kaya visual, dan sinematik untuk model AI text-to-video seperti VEO. Setiap prompt harus berupa satu paragraf deskriptif. Fokus pada aksi, suasana, pencahayaan, dan sudut kamera. Hasilkan hanya prompt, masing-masing di baris baru, tanpa pembukaan atau penomoran.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Ini ide dari pengguna: "${idea}"`,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return response.text;
};