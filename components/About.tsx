import React from 'react';
import { PinnStudioLogo } from './icons/PinnStudioLogo';
import { InfoIcon } from './icons/Icons';

const About: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto bg-[#1C1F26] p-8 rounded-lg shadow-2xl border border-[#4B0082] text-center">
      <div className="flex justify-center mb-4">
        <PinnStudioLogo />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Dikembangkan oleh Pinn Studio</h2>
      <p className="text-[#00E6FF] mb-6">Solusi AI Kreatif</p>

      <div className="text-left space-y-4 text-gray-300">
        <div className="flex items-start space-x-3">
          <InfoIcon className="h-6 w-6 mt-1 text-[#00E6FF] flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg text-white">Tentang Program Ini</h3>
            <p>
              VEO AI Video Generator ini adalah alat canggih yang dirancang untuk mewujudkan ide-ide kreatif Anda. Dengan memanfaatkan model VEO canggih dari Google, aplikasi ini mengubah prompt teks sederhana menjadi video menakjubkan berkualitas tinggi. Baik Anda seorang pembuat konten, pemasar, atau penghobi, aplikasi ini menyediakan antarmuka yang mulus dan intuitif untuk mengotomatiskan alur kerja produksi video Anda.
            </p>
          </div>
        </div>

        <div className="border-t border-[#4B0082] my-6"></div>

        <div>
            <h3 className="font-semibold text-lg text-white mb-2">Fitur Utama:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Pembuatan video batch dari beberapa prompt.</li>
                <li>Pelacakan progres real-time untuk setiap video.</li>
                <li>Pembuat Prompt bertenaga AI untuk memicu kreativitas Anda.</li>
                <li>Penanganan Kunci API yang aman untuk ketenangan pikiran Anda.</li>
            </ul>
        </div>

        <div className="border-t border-[#4B0082] my-6"></div>

        <div className="text-center">
          <p className="text-lg">Butuh solusi AI khusus atau punya pertanyaan?</p>
          <a
            href="https://t.me/pinnxai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 bg-[#FF00A8] text-white font-bold py-2 px-6 rounded-full hover:bg-[#d1008b] transition-all duration-200 shadow-lg hover:shadow-[#FF00A8]/50"
          >
            Hubungi Pengembang di Telegram
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;