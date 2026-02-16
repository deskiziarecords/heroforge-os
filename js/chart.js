class ChartPopulator {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.chart = null;
    this.init();
  }
  
  init() {
    // Load Chart.js CDN if not already loaded
    this.loadScript('https://cdn.jsdelivr.net/npm/chart.js')
      .then(() => this.createChart())
      .catch(err => console.error('Failed to load Chart.js:', err));
    
    // Listen for resize events
    this.container.addEventListener('layerResize', () => {
      if (this.chart) {
        this.chart.resize();
      }
    });
  }
  
  async loadScript(src) {
    if (window.Chart) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  createChart() {
    const canvas = document.createElement('canvas');
    this.container.innerHTML = '';
    this.container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: this.config.chartType || 'bar',
      data: this.config.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: this.config.animation !== false ? 1000 : 0
        },
        plugins: {
          legend: {
            display: this.config.showLegend !== false
          }
        },
        scales: {
          x: {
            grid: {
              display: this.config.showGrid || false
            }
          },
          y: {
            grid: {
              display: this.config.showGrid || false
            }
          }
        }
      }
    });
  }
  
  updateData(newData) {
    if (this.chart) {
      this.chart.data = newData;
      this.chart.update();
    }
  }
  
  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
