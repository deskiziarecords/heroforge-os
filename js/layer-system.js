const LayerSystem = {
    layers: [],
    zIndexCounter: 1,

    init() {
        this.layers = StorageManager.load();
        this.renderLayers();
    },

    createLayer(type, content = '') {
        const id = `layer-${Date.now()}`;
        const layer = document.createElement('div');
        layer.className = 'draggable-layer';
        layer.id = id;
        layer.style.zIndex = this.zIndexCounter++;
        layer.style.left = '50px';
        layer.style.top = '50px';
        layer.style.width = '300px';
        layer.style.height = '200px';

        layer.innerHTML = `
            <div class="drag-handle">${type.toUpperCase()}</div>
            <div class="layer-content">${content}</div>
            <div class="resize-handle r-se"></div>
        `;

        document.getElementById('hero-preview').appendChild(layer);
        new DraggableLayer(layer);
        
        this.layers.push({ id, type, content });
        this.saveState();
    },

    renderLayers() {
        // Load from storage logic here
    },

    saveState() {
        // Serialize DOM positions to StorageManager
        console.log('State Saved');
    }
};
