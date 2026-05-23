import React, { useEffect, useRef, useState } from 'react';

const FrameSequencePlayer = () => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const TOTAL_FRAMES = 210;
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const animationFrameIdRef = useRef(null);

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const images = [];
    const REQUIRED_FRAMES = 30; // Unlock site early after 30 frames are ready
    let unlocked = false;

    const handleImageLoad = () => {
      loadedCount++;
      const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
      setProgress(percent);

      if (!unlocked && (loadedCount >= REQUIRED_FRAMES || loadedCount === TOTAL_FRAMES)) {
        unlocked = true;
        imagesRef.current = images;
        setLoading(false);
      }
    };

    const handleImageError = (e) => {
      console.error("Failed to load image frame:", e.target.src);
      // Still count it to prevent loading lock
      handleImageLoad();
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      // Padding number to 3 digits (e.g. 001, 010, 210)
      const frameNum = String(i).padStart(3, '0');
      img.src = `/assets/frames/ezgif-frame-${frameNum}.jpg`;
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      images.push(img);
    }

    return () => {
      // Cleanup loaders
      images.forEach(img => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  // Helper to draw a specific frame
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[index];
    if (!img || !img.complete) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cover aspect-ratio logic
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let drawWidth, drawHeight, drawX, drawY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      drawWidth = canvas.height * imgRatio;
      drawHeight = canvas.height;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Get container size
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Redraw current frame
      if (!loading && imagesRef.current.length > 0) {
        drawFrame(currentFrameRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial size setup when loading finishes
    if (!loading) {
      handleResize();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [loading]);

  // Main Loop & Scroll Handling
  useEffect(() => {
    if (loading) return;

    // Scroll scrub logic
    const handleScroll = () => {
      isScrollingRef.current = true;

      // Calculate scroll fraction based on the window height
      const maxScroll = window.innerHeight * 1.5; // Scrub over 1.5 screen heights
      const scrollPct = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(scrollPct * TOTAL_FRAMES));
      currentFrameRef.current = frameIndex;
      drawFrame(frameIndex);

      // Reset scroll flag after scroll stops
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000); // 1s inactivity starts autoplay again
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Autoplay animation loop
    const tick = (timestamp) => {
      if (!isScrollingRef.current) {
        const elapsed = timestamp - lastFrameTimeRef.current;
        const fpsInterval = 1000 / 30; // 30 FPS autoplay

        if (elapsed >= fpsInterval) {
          currentFrameRef.current = (currentFrameRef.current + 1) % TOTAL_FRAMES;
          lastFrameTimeRef.current = timestamp;
          drawFrame(currentFrameRef.current);
        }
      }
      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [loading]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#0c0c0e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          color: '#d4af37'
        }}>
          {/* Logo / Brand Header */}
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            fontWeight: '600',
            letterSpacing: '0.15em',
            marginBottom: '30px',
            color: '#d4af37',
            textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
          }}>
            EMBER & OAK
          </div>
          
          {/* Custom Spinner */}
          <div style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            marginBottom: '20px'
          }}>
            <div style={{
              boxSizing: 'border-box',
              display: 'block',
              position: 'absolute',
              width: '64px',
              height: '64px',
              margin: '8px',
              border: '4px solid #d4af37',
              borderRadius: '50%',
              animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
              borderColor: '#d4af37 transparent transparent transparent'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>

          {/* Progress Percent */}
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            letterSpacing: '0.1em',
            color: '#a0a0a5',
            fontWeight: '400'
          }}>
            Preloading Experience... <span style={{ color: '#d4af37', fontWeight: '600' }}>{progress}%</span>
          </div>

          {/* Progress bar */}
          <div style={{
            width: '200px',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.1)',
            marginTop: '15px',
            borderRadius: '1px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #d4af37, #e65c00)',
              transition: 'width 0.1s ease-out'
            }}></div>
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block', 
          width: '100%', 
          height: '100%',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.8s ease-in-out'
        }} 
      />
    </div>
  );
};

export default FrameSequencePlayer;
