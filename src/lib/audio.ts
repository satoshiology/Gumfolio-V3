export const playSound = (type: 'button' | 'success' | 'hover' | 'premium_activate') => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  if (type === 'premium_activate') {
    // A lush, echoing major chord swell
    const freqs = [220.00, 277.18, 329.63, 440.00]; // A major chord
    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      // Swell up
      gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.5 + (i * 0.1));
      // Fade out smoothly
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5 + (i * 0.2));
      
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 3);
    });
    return;
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  if (type === 'button') {
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
  } else if (type === 'success') {
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
  } else {
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
  }
  
  osc.start();
  osc.stop(audioCtx.currentTime + (type === 'success' ? 0.3 : 0.1));
};
