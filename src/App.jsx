import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Download, Info, Zap } from 'lucide-react';
import { LocalLLMEngine } from './web-llm-engine';

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [status, setStatus] = useState('Gemma Assistant Hazır');
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [isReady, setIsReady] = useState(false);

  const engineRef = useRef(new LocalLLMEngine());
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Persistence and Previous Download Check
  useEffect(() => {
    const checkPersistence = async () => {
      await engineRef.current.requestPersistence();
    };
    checkPersistence();

    // Check if model was already downloaded
    const hasDownloaded = localStorage.getItem('gemma_downloaded') === 'true';
    if (hasDownloaded) {
      setIsReady(false); // Still need to init, but can show "Ready to load"
      setStatus('Model önbellekte hazır. Başlatmak için dokunun.');
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'tr-TR';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);
        
        if (event.results[current].isFinal) {
          handleProcessCommand(resultTranscript);
        }
      };

      recognitionRef.current.onerror = (e) => {
        console.error("SR Error:", e);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const initLocalAI = async () => {
    if (isReady || isModelLoading) return;
    
    setIsModelLoading(true);
    setStatus('Model Yükleniyor...');
    
    try {
      await engineRef.current.initialize((progress, text) => {
        setLoadProgress(Math.round(progress * 100));
        setLoadingText(text);
        
        // Mark as downloaded if we reach 100% or significant progress
        if (progress >= 1.0) {
          localStorage.setItem('gemma_downloaded', 'true');
        }
      });
      setIsReady(true);
      setIsModelLoading(false);
      setStatus('Gemma Aktif. Sizi dinliyorum...');
      speak("Gemma hazır. Size nasıl yardımcı olabilirim?");
    } catch (error) {
      console.error(error);
      if (error.message?.includes('Quota')) {
        setStatus('Hata: Depolama alanı yetersiz (Safari Sınırı).');
      } else {
        setStatus('Hata: Model yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
      }
      setIsModelLoading(false);
    }
  };

  const clearCache = async () => {
    if (confirm('Model önbelleğini temizlemek istediğinize emin misiniz? (1.5GB alan açılır)')) {
      await engineRef.current.clearCache();
      localStorage.removeItem('gemma_downloaded');
      window.location.reload();
    }
  };

  const toggleListening = () => {
    if (!isReady) {
      initLocalAI();
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAiResponse('');
      setStatus('Dinleniyor...');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speak = (text) => {
    if (!text) return;
    synthRef.current.cancel(); // Stop current speaking
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    synthRef.current.speak(utterance);
  };

  const handleProcessCommand = async (command) => {
    setStatus('Düşünüyorum...');
    try {
      const messages = [
        { role: "system", content: "Sen bir iPhone sesli asistanısın. Adın Gemma. Türkçe konuşuyorsun. Kısa ve öz cevaplar ver." },
        { role: "user", content: command }
      ];
      
      let currentResponse = '';
      await engineRef.current.generateResponse(messages, (text) => {
        currentResponse = text;
        setAiResponse(text);
      });
      
      setStatus('Cevaplandı');
      speak(currentResponse);
    } catch (error) {
      console.error(error);
      setStatus('Hata: Yapay zeka yanıt veremedi.');
    }
  };

  return (
    <div className="container">
      <header style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isReady ? '#4ade80' : '#facc15' }}>
          <Zap size={16} fill={isReady ? '#4ade80' : 'none'} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {isReady ? 'YEREL MOTOR AKTİF' : 'MODEL HAZIR DEĞİL'}
          </span>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div className="orb-container" onClick={() => !isReady && initLocalAI()}>
          <motion.div 
            className={`orb ${isListening || isModelLoading ? 'orb-active' : ''}`}
            animate={{
              scale: isListening ? [1, 1.2, 1] : 1,
              background: isReady 
                ? 'radial-gradient(circle at 30% 30%, #5d3fd3, #8a2be2, #00d2ff)'
                : 'radial-gradient(circle at 30% 30%, #444, #222, #111)',
              filter: isReady ? 'blur(15px)' : 'blur(5px)'
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {isModelLoading && (
            <svg width="220" height="220" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
              <circle
                cx="110" cy="110" r="105"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <motion.circle
                cx="110" cy="110" r="105"
                fill="none"
                stroke="#00d2ff"
                strokeWidth="4"
                strokeDasharray="660"
                animate={{ strokeDashoffset: 660 - (660 * loadProgress) / 100 }}
                transition={{ type: 'spring', damping: 20 }}
              />
            </svg>
          )}

          {(!isReady && !isModelLoading) && (
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <Download color="#fff" size={40} opacity={0.5} />
              <span style={{ color: '#fff', fontSize: '0.9rem', opacity: 0.7, textAlign: 'center', padding: '0 20px' }}>
                {localStorage.getItem('gemma_downloaded') === 'true' 
                  ? 'Model Önbellekte. Başlatmak için Dokun.' 
                  : 'Yüklemek için Dokun (1.5GB)'}
              </span>
            </div>
          )}
        </div>

        <h1 style={{ marginTop: '2rem', textAlign: 'center' }}>
          {isModelLoading ? `${loadProgress}%` : (isListening ? 'Dinliyorum' : 'Gemma Assistant')}
        </h1>
        <p className="status-text" style={{ textAlign: 'center', maxWidth: '80%' }}>
          {isModelLoading ? loadingText : status}
        </p>

        {(!isReady && !isModelLoading && !localStorage.getItem('gemma_downloaded')) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              marginTop: '1rem', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              background: 'rgba(255,165,0,0.1)', 
              border: '1px solid rgba(255,165,0,0.2)',
              fontSize: '0.8rem',
              color: '#ffa500',
              textAlign: 'center',
              maxWidth: '80%'
            }}
          >
            <Info size={14} style={{ marginBottom: '4px' }} /><br/>
            Safari kullanıcıları: Donma yaşamamak için lütfen uygulamayı <b>"Ana Ekrana Ekle"</b> yaparak kullanın.
          </motion.div>
        )}

        <div className="transcript-area">
          <AnimatePresence mode="wait">
            {transcript && (
              <motion.p 
                key="transcript"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '1.2rem', color: '#fff', textAlign: 'center' }}
              >
                "{transcript}"
              </motion.p>
            )}
            {aiResponse && (
              <motion.p 
                key="response"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', textAlign: 'center' }}
              >
                {aiResponse}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer style={{ marginBottom: '2rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          className="glass-panel"
          disabled={isModelLoading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px',
            cursor: isModelLoading ? 'wait' : 'pointer',
            padding: '1.2rem 2.5rem',
            borderRadius: '100px',
            width: '80%',
            maxWidth: '300px',
            background: isListening ? 'rgba(255, 60, 60, 0.2)' : (isReady ? 'rgba(93, 63, 211, 0.3)' : 'rgba(255, 255, 255, 0.1)')
          }}
        >
          {isModelLoading ? (
            <span style={{ fontWeight: 600 }}>İndiriliyor...</span>
          ) : (
            isListening ? (
              <>
                <MicOff color="#ff4444" />
                <span style={{ fontWeight: 600 }}>Durdur</span>
              </>
            ) : (
              <>
                {isReady ? <Mic color="#fff" /> : <Download color="#fff" />}
                <span style={{ fontWeight: 600 }}>
                  {isReady ? 'Konuşmaya Başla' : (localStorage.getItem('gemma_downloaded') === 'true' ? 'Motoru Başlat' : 'Motoru Hazırla')}
                </span>
              </>
            )
          )}
        </motion.button>

        {localStorage.getItem('gemma_downloaded') === 'true' && !isModelLoading && (
          <button 
            onClick={clearCache}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'rgba(255,255,255,0.3)', 
              fontSize: '0.7rem', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Önbelleği Temizle (1.5GB)
          </button>
        )}
      </footer>
    </div>
  );
};

export default App;
