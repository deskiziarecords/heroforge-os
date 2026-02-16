class HeroExportSystem {
  constructor(layerManager) {
    this.layerManager = layerManager;
  }
  
  generateHTML() {
    const layers = this.layerManager.getAllLayers();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hero Section</title>
  <link rel="stylesheet" href="style.css">
  ${this.generateCDNLinks(layers)}
</head>
<body>
  <section class="hero-section">
    ${this.generateLayerHTML(layers)}
  </section>
  ${this.generateScripts(layers)}
</body>
</html>`;
  }
  
  generateCDNLinks(layers) {
    const cdns = new Set();
    
    layers.forEach(layer => {
      if (layer.type === 'data-viz') {
        if (layer.subType === 'chart' && layer.config.library === 'chart.js') {
          cdns.add('<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>');
        }
        if (layer.subType === 'chart' && layer.config.library === 'd3') {
          cdns.add('<script src="https://d3js.org/d3.v7.min.js"></script>');
        }
      }
    });
    
    return Array.from(cdns).join('\n  ');
  }
  
  generateLayerHTML(layers) {
    return layers
      .filter(layer => layer.visible !== false)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .map(layer => {
        return `
    <div class="layer ${layer.type}" 
         data-layer-id="${layer.id}"
         style="
           position: absolute;
           left: ${layer.position?.x || 0}px;
           top: ${layer.position?.y || 0}px;
           width: ${layer.size?.width || '100%'};
           height: ${layer.size?.height || '100%'};
           z-index: ${layer.zIndex || 0};
           opacity: ${layer.properties?.opacity || 1};
           pointer-events: ${layer.properties?.pointerEvents || 'auto'};
         ">
      ${this.generateLayerContent(layer)}
    </div>`;
      })
      .join('\n');
  }
  
  generateLayerContent(layer) {
    switch (layer.type) {
      case 'background':
        return this.generateBackgroundHTML(layer);
      case 'data-viz':
        return this.generateDataVizHTML(layer);
      case 'text':
        return this.generateTextHTML(layer);
      case 'button':
        return this.generateButtonHTML(layer);
      default:
        return '';
    }
  }
  
  generateDataVizHTML(layer) {
    if (layer.subType === 'chart') {
      return `<canvas id="chart-${layer.id}"></canvas>
<script>
  // Initialize chart for layer ${layer.id}
  const ctx${layer.id} = document.getElementById('chart-${layer.id}').getContext('2d');
  new Chart(ctx${layer.id}, ${JSON.stringify(layer.config.chartConfig)});
</script>`;
    }
    if (layer.subType === 'iframe') {
      return `<iframe src="${layer.config.src}" 
                      sandbox="${layer.config.sandbox}"
                      style="width:100%;height:100%;border:none;"></iframe>`;
    }
    if (layer.subType === 'table') {
      return `<div id="table-${layer.id}"></div>
<script>
  // Initialize table for layer ${layer.id}
  const tableData${layer.id} = ${JSON.stringify(layer.data)};
  // Render table...
</script>`;
    }
    return '';
  }
  
  generateCSS() {
    const layers = this.layerManager.getAllLayers();
    
    return `/* Hero Section Styles */
.hero-section {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
}

.layer {
  contain: layout style;
}

/* Background Layer */
.layer.background {
  z-index: 0;
}

/* Data Layer */
.layer.data-viz {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Responsive */
@media (max-width: 768px) {
  .layer {
    width: 100% !important;
    left: 0 !important;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .layer {
    animation: none !important;
  }
}`;
  }
  
  generateScripts(layers) {
    const scripts = [];
    
    // Add initialization scripts for data layers
    layers.forEach(layer => {
      if (layer.type === 'data-viz' && layer.config.script) {
        scripts.push(`<script>${layer.config.script}</script>`);
      }
    });
    
    return scripts.join('\n  ');
  }
  
  // Download as ZIP
  downloadAsZIP() {
    const html = this.generateHTML();
    const css = this.generateCSS();
    
    // Use JSZip library
    const zip = new JSZip();
    zip.file('index.html', html);
    zip.file('style.css', css);
    
    // Add assets folder if needed
    const assets = zip.folder('assets');
    
    zip.generateAsync({ type: 'blob' })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hero-section.zip';
        a.click();
        URL.revokeObjectURL(url);
      });
  }
}
