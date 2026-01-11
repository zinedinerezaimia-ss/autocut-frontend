import React, { useState, useRef, useEffect } from 'react';

// ⚠️ CHANGE THIS TO YOUR RENDER URL AFTER DEPLOYMENT
const API_URL = import.meta.env.VITE_API_URL || 'https://autocut-back-end.onrender.com';

const STYLES = {
  tiktok: { name: 'TikTok', desc: 'Sous-titres centrés, animation pop', color: '#00f2ea' },
  youtube: { name: 'YouTube', desc: 'Sous-titres en bas, style clean', color: '#ff0000' },
  mrbeast: { name: 'MrBeast', desc: 'Gros texte jaune, ultra punchy', color: '#ffbe0b' },
  minimal: { name: 'Minimal', desc: 'Discret et élégant', color: '#888888' }
};

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [style, setStyle] = useState('tiktok');
  const [subtitles, setSubtitles] = useState('');
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef();

  // Poll status
  useEffect(() => {
    if (!jobId || status?.status === 'completed' || status?.status === 'failed') return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/status/${jobId}`);
        const data = await res.json();
        setStatus(data);
      } catch (e) {
        console.error(e);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [jobId, status?.status]);

  const handleFile = (f) => {
    if (f && f.type.startsWith('video/')) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setError(null);
      setJobId(null);
      setStatus(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('style', style);
    formData.append('subtitles_text', subtitles);
    
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      setJobId(data.job_id);
      setStatus({ status: 'pending', progress: 0, message: 'Starting...' });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDownload = () => {
    if (jobId) {
      window.open(`${API_URL}/download/${jobId}`, '_blank');
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setJobId(null);
    setStatus(null);
    setError(null);
    setSubtitles('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center font-bold">
            A
          </div>
          <span className="text-xl font-bold">Auto<span className="gradient-text">Cut</span></span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Montage vidéo <span className="gradient-text">automatique</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Upload ta vidéo, choisis ton style, récupère le résultat
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left - Upload */}
          <div className="space-y-6">
            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`upload-zone rounded-2xl p-12 text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFile(e.target.files[0])}
                  className="hidden"
                />
                <div className="text-5xl mb-4">📁</div>
                <p className="text-lg font-medium">Glisse ta vidéo ici</p>
                <p className="text-gray-500 text-sm mt-1">ou clique pour parcourir</p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black">
                <video src={preview} controls className="w-full aspect-video object-contain" />
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Subtitles Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Texte des sous-titres (optionnel)
              </label>
              <textarea
                value={subtitles}
                onChange={(e) => setSubtitles(e.target.value)}
                placeholder="Une ligne par sous-titre...&#10;Ligne 1&#10;Ligne 2&#10;Ligne 3"
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-none"
              />
              <p className="text-gray-500 text-xs mt-1">Laisse vide pour des sous-titres de démo</p>
            </div>

            {/* Status */}
            {status && (
              <div className={`rounded-xl p-4 ${
                status.status === 'completed' ? 'bg-green-500/20 border border-green-500/30' :
                status.status === 'failed' ? 'bg-red-500/20 border border-red-500/30' :
                'bg-white/5 border border-white/10'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {status.status === 'completed' ? (
                    <span className="text-green-400 text-xl">✓</span>
                  ) : status.status === 'failed' ? (
                    <span className="text-red-400 text-xl">✗</span>
                  ) : (
                    <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span className="font-medium">
                    {status.status === 'completed' ? 'Terminé !' :
                     status.status === 'failed' ? 'Erreur' : 'Traitement...'}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{status.message}</p>
                
                {status.status !== 'completed' && status.status !== 'failed' && (
                  <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full progress-bar transition-all duration-500"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                )}
                
                {status.status === 'completed' && (
                  <button
                    onClick={handleDownload}
                    className="mt-4 w-full py-3 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-colors"
                  >
                    ⬇️ Télécharger la vidéo
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Right - Styles */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Choisis ton style</h2>
            
            <div className="space-y-3">
              {Object.entries(STYLES).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => setStyle(key)}
                  className={`style-card w-full p-4 rounded-xl bg-white/5 text-left ${style === key ? 'selected' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: s.color + '20' }}
                    >
                      {key === 'tiktok' ? '🎵' : key === 'youtube' ? '▶️' : key === 'mrbeast' ? '🔥' : '✨'}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {s.name}
                        {style === key && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />}
                      </div>
                      <div className="text-sm text-gray-400">{s.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!file || (status && status.status !== 'completed' && status.status !== 'failed')}
              className="btn-primary w-full py-4 rounded-xl font-semibold text-lg"
            >
              {status && status.status !== 'completed' && status.status !== 'failed' 
                ? '⏳ Traitement en cours...' 
                : '🚀 Lancer le montage'}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 mt-12">
        <div className="max-w-5xl mx-auto text-center text-gray-500 text-sm">
          AutoCut — Propulsé par FFmpeg
        </div>
      </footer>
    </div>
  );
}

export default App;
