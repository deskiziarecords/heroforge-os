class PerformanceOptimizer {
  static init() {
    // Lazy load layers outside viewport
    this.setupIntersectionObserver();
    
    // Debounce resize events
    this.setupResizeDebounce();
    
    // Monitor FPS
    this.monitorFPS();
  }
  
  static setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const layer = entry.target;
        
        if (!entry.isIntersecting) {
          // Pause animations when not visible
          layer.style.animationPlayState = 'paused';
          
          // Pause charts
          const canvas = layer.querySelector('canvas');
          if (canvas && canvas.__chart__) {
            // Chart.js pause logic
          }
        } else {
          layer.style.animationPlayState = 'running';
        }
      });
    }, { threshold: 0 });
    
    document.querySelectorAll('.draggable-layer-container').forEach(layer => {
      observer.observe(layer);
    });
  }
  
  static setupResizeDebounce() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Trigger chart redraws
        document.querySelectorAll('.data-viz-container').forEach(container => {
          container.dispatchEvent(new CustomEvent('layerResize'));
        });
      }, 250); // Debounce 250ms
    });
  }
  
  static monitorFPS() {
    let lastTime = performance.now();
    let frames = 0;
    
    function countFPS() {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        
        // Show warning if FPS < 30
        if (fps < 30) {
          console.warn(`Low FPS detected: ${fps}. Consider reducing layer complexity.`);
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFPS);
    }
    
    requestAnimationFrame(countFPS);
  }
  
  static optimizeImages(layers) {
    layers.forEach(layer => {
      if (layer.type === 'image') {
        // Add loading="lazy"
        // Convert to WebP if possible
        // Add srcset for responsive images
      }
    });
  }
}
