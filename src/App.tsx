import React, { useState, useRef, useEffect, Component, ReactNode } from 'react';
import { Upload, FileVideo, FileText, Download, Loader2, CheckCircle2, Languages, FileType, Camera, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface TranscriptionItem {
  timestamp: string;
  text: string;
}

interface ProcessResult {
  fileId: string | number;
  detectedLanguage: string;
  transcription: TranscriptionItem[];
  translation: TranscriptionItem[];
}

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.props = props;
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oups ! Une erreur est survenue</h2>
            <p className="text-gray-600 mb-6">L'application a rencontré un problème inattendu. Veuillez rafraîchir la page.</p>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto mb-6 max-h-40">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
        setFile(selectedFile);
        setError(null);
        setResult(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setError("Format non supporté. Utilisez MP4, MOV, AVI, MKV ou WebM.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    console.log("Starting upload process for file:", file.name);

    setIsProcessing(true);
    setProgress(5);
    setError(null);
    setResult(null);
    setStatusMessage("Initialisation...");

    try {
      const isLocal = window.location.hostname === 'localhost';
      
      if (isLocal) {
        // --- LOGIQUE LOCALE (Python / Whisper) ---
        setStatusMessage("Traitement local (Whisper)...");
        const formData = new FormData();
        formData.append('video', file);
        const response = await fetch('http://localhost:8000/api/process', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Échec du traitement local.");
        }

        const data = await response.json();
        setResult({
          fileId: data.fileId,
          detectedLanguage: data.language,
          transcription: data.transcription || [{ timestamp: "00:00", text: data.text }],
          translation: data.translation || [{ timestamp: "00:00", text: data.text }]
        });
      } else {
        // --- LOGIQUE CLOUD (Gemini Frontend) ---
        setStatusMessage("Extraction de l'audio...");
        const formData = new FormData();
        formData.append('video', file);
        const extractRes = await fetch('/api/extract-audio', {
          method: 'POST',
          body: formData,
        });

        const contentType = extractRes.headers.get("content-type");
        if (!contentType || contentType.indexOf("application/json") === -1) {
          const text = await extractRes.text();
          console.error("Server HTML response:", text);
          throw new Error(`Erreur serveur (${extractRes.status}) : Le backend n'a pas renvoyé de JSON. Détails: ${text.substring(0, 150)}...`);
        }

        if (!extractRes.ok) {
          const errData = await extractRes.json();
          throw new Error(errData.error || "Échec de l'extraction audio.");
        }

        const { audioData } = await extractRes.json();
        setProgress(40);
        setStatusMessage("Transcription par l'IA (Gemini)...");

        const apiKey = process.env.GEMINI_API_KEY || "";
        if (!apiKey) {
          console.warn("GEMINI_API_KEY non trouvée");
        }
        
        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-3-flash-preview";
        const prompt = `
          Agis comme un transcripteur expert. 
          1. Transcris l'audio fourni avec des timestamps précis au format [MM:SS].
          2. Détecte la langue originale.
          3. Traduis l'intégralité de la transcription en français.
          
          Réponds UNIQUEMENT au format JSON suivant:
          {
            "detectedLanguage": "Nom de la langue",
            "transcription": [{"timestamp": "00:00", "text": "Texte"}],
            "translation": [{"timestamp": "00:00", "text": "Texte"}]
          }
        `;

        const aiResult = await ai.models.generateContent({
          model,
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "audio/mp3", data: audioData } },
            ],
          }],
          config: { responseMimeType: "application/json" }
        });

        if (!aiResult.text) throw new Error("L'IA n'a pas renvoyé de réponse.");
        
        // Nettoyage du JSON (Gemini entoure parfois de ```json ... ```)
        let cleanJson = aiResult.text.trim();
        if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        }
        
        const transcriptionData = JSON.parse(cleanJson);
        
        if (!transcriptionData.transcription || !transcriptionData.translation) {
          throw new Error("Le format de réponse de l'IA est invalide.");
        }
        
        setProgress(80);
        setStatusMessage("Génération des documents...");

        const genRes = await fetch('/api/generate-docs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: transcriptionData }),
        });

        const genContentType = genRes.headers.get("content-type");
        if (!genContentType || genContentType.indexOf("application/json") === -1) {
          const text = await genRes.text();
          throw new Error(`Erreur serveur (${genRes.status}) lors de la génération des documents. Détails: ${text.substring(0, 150)}...`);
        }

        if (!genRes.ok) throw new Error("Échec de la génération des documents.");
        const { fileId } = await genRes.json();

        setResult({ fileId, ...transcriptionData });
      }
      
      setProgress(100);
      setStatusMessage("Terminé !");
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error("Process Error:", err);
      setError(err.message || "Une erreur est survenue.");
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setResult(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadFile = (type: string) => {
    if (!result) return;
    const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:8000' : '';
    window.open(`${apiBase}/api/download/${result.fileId}/${type}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-sans selection:bg-emerald-100 pb-10" translate="no">
      {/* Header - Adapté Mobile */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <Languages className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight truncate">Transcriber AI</span>
          </div>
          <div className="hidden sm:block text-[10px] font-mono text-black/40 uppercase tracking-widest">
            Mobile-First • v1.1.0
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Colonne Gauche: Upload & Preview */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <section className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-tight">
                Vidéo vers <span className="text-emerald-600">Texte</span> en un clic.
              </h1>
              <p className="text-black/60 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                Transcription, traduction et sous-titres automatiques. Idéal pour créateurs, étudiants et professionnels.
              </p>
            </section>

            <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-black/5 space-y-6">
              {/* Zone d'Upload / Preview */}
              <div className="relative">
                {!previewUrl ? (
                  <div 
                    key="upload-zone"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-black/10 rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/10 transition-all active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 bg-black/5 rounded-full flex items-center justify-center">
                      <Upload className="text-black/40 w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-base">Choisir une vidéo</p>
                      <p className="text-xs text-black/40 mt-1">Galerie ou Caméra</p>
                    </div>
                  </div>
                ) : (
                  <div key="preview-zone" className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-inner group">
                    <video 
                      src={previewUrl} 
                      className="w-full h-full object-contain" 
                      controls={!isProcessing}
                    />
                    {!isProcessing && (
                      <button 
                        onClick={reset}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="video/*"
                />
              </div>

              {/* Bouton d'action large pour mobile */}
              <div className="space-y-4">
                <button
                  disabled={!file || isProcessing}
                  onClick={handleUpload}
                  className="w-full h-14 sm:h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-black/10 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Lancer le traitement
                    </>
                  )}
                </button>

                {/* Bouton Caméra Direct (Mobile Only) */}
                {!file && !isProcessing && (
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.setAttribute('capture', 'environment');
                        fileInputRef.current.click();
                      }
                    }}
                    className="w-full h-14 border border-black/10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-black/60 hover:bg-black/5 active:bg-black/10 transition-colors sm:hidden"
                  >
                    <Camera className="w-5 h-5" />
                    Utiliser la caméra
                  </button>
                )}
              </div>

              {/* Barre de progression optimisée */}
              {isProcessing && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-black/40 tracking-wider">
                    <span>{statusMessage || "ANALYSE EN COURS"}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                </div>
              )}

              {/* Erreurs avec bouton de reset */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-bold text-xs">!</span>
                    </div>
                    <p className="leading-relaxed font-medium">{error}</p>
                  </div>
                  <button 
                    onClick={reset}
                    className="text-[10px] font-bold uppercase tracking-wider text-red-700 hover:text-red-800 w-fit underline underline-offset-4"
                  >
                    Réinitialiser et réessayer
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Colonne Droite: Résultats - Adapté Mobile */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-black/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="text-emerald-600 w-7 h-7" />
                        </div>
                        <div>
                          <h2 className="font-bold text-xl">Succès !</h2>
                          <p className="text-xs text-black/40">Langue : <span className="text-emerald-600 font-bold uppercase">{result.detectedLanguage}</span></p>
                        </div>
                      </div>
                      <button 
                        onClick={reset}
                        className="text-xs font-bold text-black/40 hover:text-black transition-colors uppercase tracking-widest sm:border sm:border-black/5 sm:px-4 sm:py-2 sm:rounded-lg"
                      >
                        Nouvelle vidéo
                      </button>
                    </div>

                    {/* Grille de téléchargement - Boutons larges sur mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                      <button onClick={() => downloadFile('docx')} className="flex items-center sm:flex-col justify-between sm:justify-center gap-3 p-4 rounded-xl border border-black/5 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-200 transition-all active:scale-95">
                        <div className="flex items-center gap-3 sm:flex-col">
                          <FileType className="w-6 h-6 text-blue-600" />
                          <span className="text-xs font-bold uppercase tracking-wider">Word (.docx)</span>
                        </div>
                        <Download className="w-5 h-5 text-blue-600/40" />
                      </button>
                      <button onClick={() => downloadFile('pdf')} className="flex items-center sm:flex-col justify-between sm:justify-center gap-3 p-4 rounded-xl border border-black/5 bg-red-50/30 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95">
                        <div className="flex items-center gap-3 sm:flex-col">
                          <FileType className="w-6 h-6 text-red-600" />
                          <span className="text-xs font-bold uppercase tracking-wider">PDF (.pdf)</span>
                        </div>
                        <Download className="w-5 h-5 text-red-600/40" />
                      </button>
                      <button onClick={() => downloadFile('srt')} className="flex items-center sm:flex-col justify-between sm:justify-center gap-3 p-4 rounded-xl border border-black/5 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-200 transition-all active:scale-95">
                        <div className="flex items-center gap-3 sm:flex-col">
                          <FileType className="w-6 h-6 text-amber-600" />
                          <span className="text-xs font-bold uppercase tracking-wider">SRT (Sous-titres)</span>
                        </div>
                        <Download className="w-5 h-5 text-amber-600/40" />
                      </button>
                      <button onClick={() => downloadFile('vtt')} className="flex items-center sm:flex-col justify-between sm:justify-center gap-3 p-4 rounded-xl border border-black/5 bg-purple-50/30 hover:bg-purple-50 hover:border-purple-200 transition-all active:scale-95">
                        <div className="flex items-center gap-3 sm:flex-col">
                          <FileType className="w-6 h-6 text-purple-600" />
                          <span className="text-xs font-bold uppercase tracking-wider">VTT (Web)</span>
                        </div>
                        <Download className="w-5 h-5 text-purple-600/40" />
                      </button>
                    </div>

                    <div className="border-t border-black/5 pt-6">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-6 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Aperçu de la traduction
                      </h3>
                      <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                        {result.translation && result.translation.length > 0 ? (
                          result.translation.map((item, i) => (
                            <div key={i} className="flex gap-4 group">
                              <span className="font-mono text-[10px] text-black/20 mt-1 bg-black/5 px-1.5 py-0.5 rounded h-fit shrink-0">
                                {item.timestamp}
                              </span>
                              <p className="text-sm sm:text-base leading-relaxed text-black/70 group-hover:text-black transition-colors">
                                {item.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-black/40 italic">Aucune traduction disponible.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[300px] border-2 border-dashed border-black/5 rounded-2xl flex flex-col items-center justify-center text-black/20 p-8 text-center bg-white/50">
                  <div className="w-16 h-16 bg-black/[0.02] rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest">Résultats</p>
                  <p className="text-xs mt-2 max-w-[200px]">Uploadez une vidéo pour voir la transcription et la traduction ici.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer Mobile */}
      <footer className="mt-auto py-8 border-t border-black/5 text-center space-y-2">
        <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em]">
          Transcriber AI is a product of Aurion Labs-G
        </p>
        <p className="text-[9px] font-medium text-black/20 uppercase tracking-[0.1em]">
          All rights reserved by Aurion Labs-G © 2026
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 2px;
          }
        }
      `}</style>
    </div>
  );
}

export function WrappedApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
