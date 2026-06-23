import { useState, useRef, useEffect, useCallback } from 'react';

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted';

interface UseRealtimeVocalReturn {
  voiceState: VoiceState;
  transcript: string;
  isConnecting: boolean;
  startSession: () => void;
  stopSession: () => void;
  endTurn: () => void;
  interrupt: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

export function useRealtimeVocal(): UseRealtimeVocalReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const playbackQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);
  const isTurnCompleteRef = useRef(false);

  const stopSession = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setVoiceState('idle');
    setIsConnecting(false);
    playbackQueueRef.current = [];
    isPlayingRef.current = false;
    isTurnCompleteRef.current = false;
  }, []);

  // Playback function
  const playNextChunk = useCallback(() => {
    if (!audioContextRef.current) return;
    if (playbackQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      if (voiceState === 'speaking') setVoiceState('idle'); // Or 'listening'
      if (isTurnCompleteRef.current) {
        stopSession();
      }
      return;
    }

    isPlayingRef.current = true;
    setVoiceState('speaking');
    const buffer = playbackQueueRef.current.shift()!;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);

    const currentTime = audioContextRef.current.currentTime;
    const playTime = Math.max(currentTime, nextPlayTimeRef.current);
    source.start(playTime);
    nextPlayTimeRef.current = playTime + buffer.duration;

    source.onended = () => {
      playNextChunk();
    };
  }, [voiceState, stopSession]);

  const addAudioChunk = useCallback((base64Audio: string) => {
    if (!audioContextRef.current) return;
    
    // Decode base64 to array buffer
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    // Since Gemini sends 16kHz PCM 16-bit, we need to convert it to Float32Array for WebAudio
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
    }

    const audioBuffer = audioContextRef.current.createBuffer(1, float32.length, 16000);
    audioBuffer.getChannelData(0).set(float32);
    
    playbackQueueRef.current.push(audioBuffer);

    if (!isPlayingRef.current) {
      nextPlayTimeRef.current = audioContextRef.current.currentTime;
      playNextChunk();
    }
  }, [playNextChunk]);

  const startSession = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setIsConnecting(true);
    setTranscript('');
    isTurnCompleteRef.current = false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/vocal/`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error('WebSocket connection timeout');
          ws.close();
          setIsConnecting(false);
          setVoiceState('idle');
          alert("Délai d'attente dépassé pour la connexion vocale.");
        }
      }, 10000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsConnecting(false);
        setVoiceState('listening');
        
        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        
        // Use ScriptProcessor for real-time chunking (deprecated but highly compatible)
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        
        processor.onaudioprocess = (e) => {
          if (isMuted) return;
          if (ws.readyState !== WebSocket.OPEN) return;
          if (voiceState === 'speaking' || voiceState === 'interrupted') return; // VAD basic: don't send while AI is speaking unless barge-in triggers

          const inputData = e.inputBuffer.getChannelData(0);
          
          // Detect VAD simple (barge-in / volume threshold)
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) sum += Math.abs(inputData[i]);
          const avgVolume = sum / inputData.length;

          // Barge-in logic: if user speaks loud while AI is speaking
          if (avgVolume > 0.05 && voiceState === 'speaking') {
            interrupt();
            return;
          }

          // Send PCM 16-bit to server
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
          }
          
          const bytes = new Uint8Array(pcm16.buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64Data = window.btoa(binary);

          ws.send(JSON.stringify({
            type: 'audio',
            data: base64Data
          }));
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'text') {
          setTranscript((prev) => prev + data.data);
          if (voiceState !== 'speaking' && data.data.trim() !== '') {
             setVoiceState('speaking');
          }
        } else if (data.type === 'audio') {
          if (voiceState !== 'speaking') {
             setVoiceState('speaking');
          }
          addAudioChunk(data.data);
        } else if (data.type === 'error') {
          console.error("Erreur serveur vocal:", data.message);
          alert("Erreur vocale : " + data.message);
          stopSession();
        } else if (data.type === 'turn_complete') {
          // The AI finished its turn. We close the session after playback completes.
          isTurnCompleteRef.current = true;
          if (!isPlayingRef.current && playbackQueueRef.current.length === 0) {
            stopSession();
          }
        }
      };

      ws.onclose = () => {
        stopSession();
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        stopSession();
      };

    } catch (err: any) {
      console.error('Microphone ou WebSocket erreur:', err);
      alert("Erreur de connexion au microphone ou au serveur : " + err.message);
      setIsConnecting(false);
      setVoiceState('idle');
    }
  };

  const interrupt = useCallback(() => {
    setVoiceState('interrupted');
    playbackQueueRef.current = [];
    isPlayingRef.current = false;
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
    }
    
    setTimeout(() => {
      setVoiceState('listening');
    }, 500);
  }, []);

  const endTurn = useCallback(() => {
    if (voiceState === 'listening') {
      setIsMuted(true);
      setVoiceState('thinking');
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'end_turn' }));
      }
    }
  }, [voiceState]);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  const toggleMute = () => setIsMuted(!isMuted);

  return {
    voiceState,
    transcript,
    isConnecting,
    startSession,
    stopSession,
    endTurn,
    interrupt,
    toggleMute,
    isMuted
  };
}
