class LayerStorageManager {
  constructor() {
    this.storageKey = 'hero_playground_layers_v1';
    this.dataLayerKey = 'hero_playground_data_layers_v1';
  }
  
  // Save layer configuration
  saveLayer(layer) {
    const layers = this.getAllLayers();
    const existingIndex = layers.findIndex(l => l.id === layer.id);
    
    if (existingIndex !== -1) {
      layers[existingIndex] = { ...layers[existingIndex], ...layer };
    } else {
      layers.push(layer);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(layers));
  }
  
  // Get all layers
  getAllLayers() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }
  
  // Get specific layer
  getLayer(id) {
    const layers = this.getAllLayers();
    return layers.find(l => l.id === id);
  }
  
  // Delete layer
  deleteLayer(id) {
    const layers = this.getAllLayers();
    const filtered = layers.filter(l => l.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }
  
  // Save to recent uploads (for code layer)
  saveRecentUpload(upload) {
    const uploads = this.getRecentUploads();
    uploads.unshift({
      id: Date.now(),
      name: upload.name,
      timestamp: new Date().toISOString(),
      data: upload.data
    });
    
    // Keep only last 10
    const trimmed = uploads.slice(0, 10);
    localStorage.setItem('hero_recent_uploads', JSON.stringify(trimmed));
  }
  
  // Get recent uploads
  getRecentUploads() {
    const data = localStorage.getItem('hero_recent_uploads');
    return data ? JSON.parse(data) : [];
  }
  
  // Export all data
  exportProject() {
    return {
      layers: this.getAllLayers(),
      dataLayers: localStorage.getItem(this.dataLayerKey),
      recentUploads: this.getRecentUploads(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }
  
  // Import project
  importProject(projectData) {
    if (projectData.layers) {
      localStorage.setItem(this.storageKey, JSON.stringify(projectData.layers));
    }
    if (projectData.dataLayers) {
      localStorage.setItem(this.dataLayerKey, projectData.dataLayers);
    }
    if (projectData.recentUploads) {
      localStorage.setItem('hero_recent_uploads', JSON.stringify(projectData.recentUploads));
    }
  }
  
  // Clear all
  clearAll() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.dataLayerKey);
    localStorage.removeItem('hero_recent_uploads');
  }
}
