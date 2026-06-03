import React, { useState, useEffect, useRef } from 'react';
import { Settings, X, Upload, Check, Copy, ExternalLink, Terminal, ChevronRight, AlertCircle } from 'lucide-react';

const LOADING_MESSAGES = [
  "Initializing hacking sequence...",
  "Bribing the DNS servers...",
  "Unspooling the spaghetti code...",
  "Navigating redirect purgatory...",
  "Interrogating the servers...",
  "Following the white rabbit...",
  "Decrypting URL headers...",
  "Almost there..."
];

const FONTS = {
  mono: 'font-mono',
  sans: 'font-sans',
  serif: 'font-serif',
  comic: 'font-comic', // Will fallback to standard cursive/comic-sans in CSS
};

export default function App() {
  // App State
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [font, setFont] = useState('mono');
  const [bgImage, setBgImage] = useState(null);
  const [bgError, setBgError] = useState('');
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('unshortener_theme') || 'dark';
    const savedFont = localStorage.getItem('unshortener_font') || 'mono';
    const savedBg = localStorage.getItem('unshortener_bg');
    
    setTheme(savedTheme);
    setFont(savedFont);
    if (savedBg) setBgImage(savedBg);
  }, []);

  // Cycle loading messages
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Handle URL Submission
  const handleUnshorten = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch(`https://myschoolstory--url-unshortener-api-fastapi-app.modal.run/unshorten?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail?.[0]?.msg || "Failed to validate the URL format.");
      }
      
      if (!data.success) {
        throw new Error(data.error || "Failed to unshorten the URL.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Image upload and WebP optimization
  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (8MB limit)
    if (file.size > 8 * 1024 * 1024) {
      setBgError("File exceeds 8MB limit.");
      return;
    }

    setBgError("Processing and optimizing image...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        // Scale down to fit standard max dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP with heavy compression to fit nicely in localStorage (usually ~5MB quota)
        const webpDataUrl = canvas.toDataURL('image/webp', 0.6);
        
        try {
          localStorage.setItem('unshortener_bg', webpDataUrl);
          setBgImage(webpDataUrl);
          setBgError('');
        } catch (err) {
          setBgError("Image is still too large to save in browser storage. Try a simpler image.");
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const saveSetting = (key, value) => {
    localStorage.setItem(key, value);
    if (key === 'unshortener_theme') setTheme(value);
    if (key === 'unshortener_font') setFont(value);
  };

  const clearBackground = () => {
    localStorage.removeItem('unshortener_bg');
    setBgImage(null);
  };

  const copyToClipboard = () => {
    if (result?.final_url) {
      // Create a temporary textarea to handle copy cross-environment seamlessly
      const textArea = document.createElement("textarea");
      textArea.value = result.final_url;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const appFontClass = FONTS[font] || 'font-mono';

  return (
    <div className={`${theme} min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30`}>
      {/* Dynamic Comic Sans Fallback Styling */}
      <style>{`
        .font-comic { font-family: "Comic Sans MS", "Comic Sans", cursive; }
      `}</style>

      {/* Background Image / Gradient */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: bgImage 
            ? `url(${bgImage})` 
            : theme === 'dark' 
              ? 'linear-gradient(to bottom right, #0f172a, #000000)' 
              : 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)'
        }}
      />

      {/* Content Wrapper */}
      <div className={`relative z-10 min-h-screen flex flex-col transition-colors duration-300 ${appFontClass} text-slate-800 dark:text-slate-200`}>
        
        {/* Header */}
        <header className="p-6 flex justify-end">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg hover:bg-white/20 dark:hover:bg-white/10 transition-all hover:rotate-90 group"
          >
            <Settings className="w-6 h-6 text-slate-700 dark:text-cyan-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-300" />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-3xl mx-auto">
          
          {/* Glassmorphic Terminal Card */}
          <div className="w-full backdrop-blur-xl bg-white/30 dark:bg-black/50 border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 relative">
            
            {/* Terminal Window Controls */}
            <div className="bg-white/40 dark:bg-black/40 px-4 py-3 flex items-center border-b border-white/30 dark:border-white/10">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
              </div>
              <div className="mx-auto flex items-center space-x-2 opacity-70">
                <Terminal className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-widest">TRACE_ROUTE.EXE</span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleUnshorten} className="mb-8">
                <label className="flex items-center text-lg font-bold mb-4 dark:text-cyan-400 text-slate-800">
                  <ChevronRight className="w-6 h-6 mr-1" />
                  Target URL to decrypt:
                </label>
                <div className="flex flex-col md:flex-row gap-4 relative group">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://bit.ly/..."
                    required
                    className="flex-1 bg-white/40 dark:bg-black/40 border border-white/50 dark:border-cyan-500/30 rounded-xl px-5 py-4 outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-600 dark:text-cyan-50"
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-slate-800 dark:bg-cyan-600 hover:bg-slate-700 dark:hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/20 active:scale-95"
                  >
                    {loading ? 'Processing...' : 'Unshorten'}
                  </button>
                </div>
              </form>

              {/* Loading State */}
              {loading && (
                <div className="animate-pulse space-y-4 py-8">
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-1/2 animate-[progress_1.5s_ease-in-out_infinite]" style={{
                        animation: "progress 1.5s ease-in-out infinite alternate"
                    }}></div>
                  </div>
                  <style>{`
                    @keyframes progress {
                        0% { transform: translateX(-100%); width: 50%; }
                        100% { transform: translateX(200%); width: 100%; }
                    }
                  `}</style>
                  <p className="text-center font-semibold text-cyan-600 dark:text-cyan-400 animate-bounce">
                    {LOADING_MESSAGES[loadingMsgIdx]}
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start space-x-3 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
                  <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold">Execution Failed</h3>
                    <p className="text-sm opacity-90">{error}</p>
                  </div>
                </div>
              )}

              {/* Result State */}
              {result && !loading && (
                <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                  <div className="bg-white/40 dark:bg-cyan-950/20 border border-white/50 dark:border-cyan-500/20 rounded-xl p-5 shadow-inner">
                    
                    {/* Metrics row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/50 dark:bg-black/40 p-3 rounded-lg border border-white/30 dark:border-white/5">
                        <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Time Elapsed</p>
                        <p className="text-xl font-bold dark:text-cyan-400 text-slate-800">
                          {result.time_taken_seconds.toFixed(2)}s
                        </p>
                      </div>
                      <div className="bg-white/50 dark:bg-black/40 p-3 rounded-lg border border-white/30 dark:border-white/5">
                        <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Hops Tracked</p>
                        <p className="text-xl font-bold dark:text-cyan-400 text-slate-800">
                          {result.redirect_count || 0}
                        </p>
                      </div>
                      <div className="bg-white/50 dark:bg-black/40 p-3 rounded-lg border border-white/30 dark:border-white/5 col-span-2 md:col-span-1">
                        <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Status</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center">
                          <Check className="w-5 h-5 mr-1" /> Success
                        </p>
                      </div>
                    </div>

                    {/* Final URL output */}
                    <div>
                      <p className="text-sm font-bold opacity-70 mb-2">Decoded Destination:</p>
                      <div className="bg-white/60 dark:bg-black/60 border border-white/40 dark:border-cyan-500/30 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 break-all">
                        <span className="flex-1 font-bold text-lg dark:text-cyan-100 text-slate-900">
                          {result.final_url || result.input_url}
                        </span>
                        
                        <div className="flex space-x-2 shrink-0 w-full md:w-auto">
                          <button 
                            onClick={copyToClipboard}
                            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 p-3 rounded-lg transition-colors font-semibold"
                          >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                            <span className="md:hidden">Copy</span>
                          </button>
                          
                          <a 
                            href={result.final_url || result.input_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-lg transition-colors font-semibold shadow-lg shadow-cyan-500/20"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-sm font-medium opacity-70 mt-auto">
          © {new Date().getFullYear()} Alex Scott. All systems operational.
        </footer>

        {/* Settings Modal - Glassmorphism */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsSettingsOpen(false)}
            />
            
            {/* Modal Content */}
            <div className={`relative w-full max-w-md backdrop-blur-2xl bg-white/70 dark:bg-slate-900/80 border border-white/50 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 animate-[fadeIn_0.2s_ease-out] ${appFontClass} text-slate-800 dark:text-slate-200`}>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-6 flex items-center border-b border-black/10 dark:border-white/10 pb-4">
                <Settings className="w-6 h-6 mr-3 dark:text-cyan-400" />
                Configuration
              </h2>

              <div className="space-y-6">
                
                {/* Theme Toggle */}
                <div>
                  <label className="block text-sm font-bold opacity-80 mb-2">Display Theme</label>
                  <div className="flex bg-white/40 dark:bg-black/40 rounded-xl p-1 border border-black/10 dark:border-white/10">
                    <button 
                      onClick={() => saveSetting('unshortener_theme', 'light')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                    >
                      Light Mode
                    </button>
                    <button 
                      onClick={() => saveSetting('unshortener_theme', 'dark')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${theme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                    >
                      Dark Mode
                    </button>
                  </div>
                </div>

                {/* Font Selection */}
                <div>
                  <label className="block text-sm font-bold opacity-80 mb-2">System Font</label>
                  <select 
                    value={font}
                    onChange={(e) => saveSetting('unshortener_font', e.target.value)}
                    className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none dark:text-slate-200"
                  >
                    <option value="mono" className="dark:bg-slate-800">Terminal (Monospace)</option>
                    <option value="sans" className="dark:bg-slate-800">Modern (Sans-Serif)</option>
                    <option value="serif" className="dark:bg-slate-800">Classic (Serif)</option>
                    <option value="comic" className="dark:bg-slate-800">Playful (Comic)</option>
                  </select>
                </div>

                {/* Background Upload */}
                <div>
                  <label className="block text-sm font-bold opacity-80 mb-2">Custom Background (&lt; 8MB)</label>
                  
                  <div className="flex flex-col gap-3">
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleBgUpload}
                      className="hidden" 
                    />
                    
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center space-x-2 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 py-3 rounded-xl transition-colors font-semibold"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload Image</span>
                    </button>

                    {bgError && (
                      <p className={`text-xs text-center font-bold ${bgError.includes('too large') || bgError.includes('exceeds') ? 'text-red-500' : 'text-cyan-500 animate-pulse'}`}>
                        {bgError}
                      </p>
                    )}

                    {bgImage && (
                      <button 
                        onClick={clearBackground}
                        className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-bold underline transition-colors text-center"
                      >
                        Remove Custom Background
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}