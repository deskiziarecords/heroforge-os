// ============================================
// HeroForge OS - Layer System
// Complete Layer Management & CSS3 Integration
// ============================================

const LayerSystem = {
    layers: [],
    zIndexCounter: 1,
    activeLayer: null,
    canvas: null,
    propertiesPanel: null,

    // Initialize the system
    init() {
        this.canvas = document.getElementById('hero-preview');
        this.propertiesPanel = document.getElementById('properties-content');
        this.layers = StorageManager.load();
        this.setupEventListeners();
        this.renderLayers();
        this.setupFastBuildToggles();
    },

    // Setup global event listeners
    setupEventListeners() {
        // Layer selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.draggable-layer')) {
                const layer = e.target.closest('.draggable-layer');
                this.selectLayer(layer);
            }
        });

        // Export button
        document.getElementById('btn-export').addEventListener('click', () => {
            ExportSystem.downloadProject();
        });
    },

    // Setup Fast Build toggle buttons
    setupFastBuildToggles() {
        const toggles = document.querySelectorAll('.layer-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const layerType = e.target.dataset.layer;
                this.handleFastBuildToggle(layerType);
                
                // Visual feedback
                toggles.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    },

    // Handle Fast Build button clicks
    handleFastBuildToggle(type) {
        const layerData = {
            bg: { type: 'background', zIndex: 0, content: this.createBackgroundContent() },
            js: { type: 'custom-code', zIndex: 1, content: '<div class="code-layer">Custom JS/CSS</div>' },
            img: { type: 'image', zIndex: 2, content: this.createImageContent() },
            text: { type: 'text', zIndex: 3, content: this.createTextContent() },
            btn: { type: 'button', zIndex: 4, content: this.createButtonContent() },
            data: { type: 'data-viz', zIndex: 2.5, content: this.createDataContent() }
        };

        if (layerData[type]) {
            this.createLayer(layerData[type]);
            
            // Open bottom panel for JS and Data layers
            if (type === 'js' || type === 'data') {
                document.getElementById('panel-bottom').classList.add('open');
            }
        }
    },

    // Create layer content helpers
    createBackgroundContent() {
        return `<div class="bg-content" style="width:100%;height:100%;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>`;
    },

    createImageContent() {
        return `<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage%3C/text%3E%3C/svg%3E" style="width:100%;height:100%;object-fit:cover;">`;
    },

    createTextContent() {
        return `
            <h1 class="hero-title" style="font-size:clamp(2rem, 5vw, 4rem); margin:0; color:#fff; text-shadow:2px 2px 4px rgba(0,0,0,0.5);">
                Hero Title
            </h1>
            <p class="hero-subtitle" style="font-size:1.25rem; color:#f0f0f0; margin:1rem 0;">
                Subtitle text goes here
            </p>
        `;
    },

    createButtonContent() {
        return `
            <button class="cta-button" style="
                padding:15px 40px;
                font-size:1.1rem;
                background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color:white;
                border:none;
                border-radius:50px;
                cursor:pointer;
                box-shadow:0 4px 15px rgba(0,0,0,0.2);
                transition:transform 0.3s, box-shadow 0.3s;
            " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'" 
               onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'">
                Get Started
            </button>
        `;
    },

    createDataContent() {
        return `
            <div class="data-placeholder" style="
                width:100%;
                height:100%;
                background:rgba(255,255,255,0.9);
                display:flex;
                align-items:center;
                justify-content:center;
                border-radius:8px;
            ">
                <p style="color:#666;">Select Data Type:<br>Chart | Table | Iframe</p>
            </div>
        `;
    },

    // Create a new layer
    createLayer(config) {
        const id = `layer-${Date.now()}`;
        const layer = document.createElement('div');
        layer.className = 'draggable-layer';
        layer.id = id;
        layer.dataset.type = config.type;
        layer.style.zIndex = config.zIndex || this.zIndexCounter++;
        layer.style.left = `${100 + (this.layers.length * 20)}px`;
        layer.style.top = `${100 + (this.layers.length * 20)}px`;
        layer.style.width = config.type === 'background' ? '100%' : '400px';
        layer.style.height = config.type === 'background' ? '100%' : '300px';
        layer.style.position = 'absolute';

        // Layer inner HTML
        layer.innerHTML = `
            <div class="drag-handle">
                <span class="layer-icon">${this.getLayerIcon(config.type)}</span>
                <span class="layer-label">${config.type.toUpperCase()}</span>
                <div class="layer-actions">
                    <button class="btn-visibility" title="Toggle Visibility">👁</button>
                    <button class="btn-delete" title="Delete Layer">✕</button>
                </div>
            </div>
            <div class="layer-content">
                ${config.content}
            </div>
            <div class="resize-handle r-se"></div>
            <div class="resize-handle r-nw"></div>
        `;

        // Add to canvas
        this.canvas.appendChild(layer);

        // Initialize draggable
        new DraggableLayer(layer);

        // Setup layer-specific functionality
        this.setupLayerFunctionality(layer, config);

        // Add to state
        this.layers.push({
            id,
            type: config.type,
            zIndex: layer.style.zIndex,
            visible: true,
            content: config.content
        });

        // Save and select
        this.saveState();
        this.selectLayer(layer);

        return layer;
    },

    // Get icon for layer type
    getLayerIcon(type) {
        const icons = {
            background: '🎨',
            'custom-code': '💻',
            image: '🖼',
            text: '📝',
            button: '🔘',
            'data-viz': '📊'
        };
        return icons[type] || '📦';
    },

    // Setup layer-specific functionality
    setupLayerFunctionality(layer, config) {
        // Delete button
        layer.querySelector('.btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteLayer(layer.id);
        });

        // Visibility toggle
        layer.querySelector('.btn-visibility').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleVisibility(layer);
        });

        // Data layer specific
        if (config.type === 'data-viz') {
            this.initializeDataLayer(layer);
        }

        // Custom code layer
        if (config.type === 'custom-code') {
            this.initializeCodeLayer(layer);
        }
    },

    // Initialize Data Layer (Chart/Table/Iframe)
    initializeDataLayer(layer) {
        const content = layer.querySelector('.layer-content');
        
        // Show options
        content.innerHTML = `
            <div class="data-type-selector" style="padding:20px;">
                <h3 style="margin-top:0;">Select Data Type</h3>
                <button class="data-type-btn" data-type="chart" style="display:block;width:100%;padding:10px;margin:5px 0;background:#4CAF50;color:white;border:none;border-radius:4px;cursor:pointer;">
                    📊 Chart (D3/Chart.js)
                </button>
                <button class="data-type-btn" data-type="table" style="display:block;width:100%;padding:10px;margin:5px 0;background:#2196F3;color:white;border:none;border-radius:4px;cursor:pointer;">
                    📋 Table Parser
                </button>
                <button class="data-type-btn" data-type="iframe" style="display:block;width:100%;padding:10px;margin:5px 0;background:#FF9800;color:white;border:none;border-radius:4px;cursor:pointer;">
                    🌐 Inline Frame
                </button>
            </div>
        `;

        // Add event listeners
        content.querySelectorAll('.data-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.loadDataVisualization(layer, type);
            });
        });
    },

    // Load specific data visualization
    loadDataVisualization(layer, type) {
        const content = layer.querySelector('.layer-content');
        
        switch(type) {
            case 'chart':
                if (typeof ChartPopulator !== 'undefined') {
                    new ChartPopulator(content, {
                        chartType: 'bar',
                         [
                            { label: 'Jan', value: 30 },
                            { label: 'Feb', value: 45 },
                            { label: 'Mar', value: 60 }
                        ],
                        color: '#667eea'
                    });
                } else {
                    content.innerHTML = '<p style="padding:20px;">Chart.js module not loaded. Add chart-populator.js</p>';
                }
                break;
                
            case 'table':
                if (typeof TableParser !== 'undefined') {
                    new TableParser(content, {
                        csvData: 'Name,Value,Date\nItem 1,100,2024-01-01\nItem 2,200,2024-01-02',
                        theme: 'light',
                        sortable: true
                    });
                } else {
                    content.innerHTML = '<p style="padding:20px;">Table Parser module not loaded. Add table-parser.js</p>';
                }
                break;
                
            case 'iframe':
                if (typeof IframeManager !== 'undefined') {
                    new IframeManager(content, {
                        src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        sandbox: 'allow-scripts allow-same-origin'
                    });
                } else {
                    content.innerHTML = '<iframe src="about:blank" style="width:100%;height:100%;border:none;"></iframe>';
                }
                break;
        }
    },

    // Initialize Code Layer
    initializeCodeLayer(layer) {
        // This integrates with the ZIP upload system
        const content = layer.querySelector('.layer-content');
        content.innerHTML = `
            <div style="padding:20px;text-align:center;">
                <p>Upload a .zip file with:</p>
                <code style="display:block;background:#333;padding:10px;margin:10px 0;border-radius:4px;">
                    src/<br>
                    ├── index.html<br>
                    ├── style.css<br>
                    └── script.js
                </code>
                <p style="font-size:0.9rem;color:#888;">Use the bottom panel to upload</p>
            </div>
        `;
    },

    // Select a layer
    selectLayer(layer) {
        // Remove previous selection
        document.querySelectorAll('.draggable-layer').forEach(l => {
            l.classList.remove('selected');
        });

        // Select new
        layer.classList.add('selected');
        this.activeLayer = layer;

        // Populate properties panel
        this.populatePropertiesPanel(layer);
    },

    // Populate CSS3 Properties Panel
    populatePropertiesPanel(layer) {
        const type = layer.dataset.type;
        const computedStyle = window.getComputedStyle(layer);
        
        let html = `
            <div class="property-group">
                <h3>${type.toUpperCase()} LAYER PROPERTIES</h3>
                
                <!-- Position -->
                <div class="property-item">
                    <label>Position X</label>
                    <input type="number" class="prop-input" data-prop="left" value="${parseInt(layer.style.left)}">
                </div>
                <div class="property-item">
                    <label>Position Y</label>
                    <input type="number" class="prop-input" data-prop="top" value="${parseInt(layer.style.top)}">
                </div>
                <div class="property-item">
                    <label>Width</label>
                    <input type="text" class="prop-input" data-prop="width" value="${layer.style.width}">
                </div>
                <div class="property-item">
                    <label>Height</label>
                    <input type="text" class="prop-input" data-prop="height" value="${layer.style.height}">
                </div>
                
                <!-- Z-Index -->
                <div class="property-item">
                    <label>Z-Index</label>
                    <input type="number" class="prop-input" data-prop="zIndex" value="${layer.style.zIndex}">
                </div>
                
                <!-- Opacity -->
                <div class="property-item">
                    <label>Opacity</label>
                    <input type="range" class="prop-range" data-prop="opacity" 
                           min="0" max="1" step="0.1" 
                           value="${computedStyle.opacity}">
                    <span>${computedStyle.opacity}</span>
                </div>

                <!-- Blend Mode -->
                <div class="property-item">
                    <label>Mix Blend Mode</label>
                    <select class="prop-select" data-prop="mixBlendMode">
                        <option value="normal" ${computedStyle.mixBlendMode === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="multiply" ${computedStyle.mixBlendMode === 'multiply' ? 'selected' : ''}>Multiply</option>
                        <option value="screen" ${computedStyle.mixBlendMode === 'screen' ? 'selected' : ''}>Screen</option>
                        <option value="overlay" ${computedStyle.mixBlendMode === 'overlay' ? 'selected' : ''}>Overlay</option>
                        <option value="darken" ${computedStyle.mixBlendMode === 'darken' ? 'selected' : ''}>Darken</option>
                        <option value="lighten" ${computedStyle.mixBlendMode === 'lighten' ? 'selected' : ''}>Lighten</option>
                    </select>
                </div>

                <!-- Pointer Events -->
                <div class="property-item">
                    <label>
                        <input type="checkbox" class="prop-checkbox" data-prop="pointerEvents" 
                               ${computedStyle.pointerEvents === 'auto' ? 'checked' : ''}>
                        Enable Interactions
                    </label>
                </div>
        `;

        // Type-specific properties
        if (type === 'text') {
            html += `
                <!-- Typography -->
                <div class="property-section">
                    <h4>TYPOGRAPHY</h4>
                    <div class="property-item">
                        <label>Font Size (clamp)</label>
                        <input type="text" class="prop-input" data-style="fontSize" value="clamp(2rem, 5vw, 4rem)">
                    </div>
                    <div class="property-item">
                        <label>Text Color</label>
                        <input type="color" class="prop-color" data-style="color" value="#ffffff">
                    </div>
                    <div class="property-item">
                        <label>Text Shadow</label>
                        <input type="text" class="prop-input" data-style="textShadow" value="2px 2px 4px rgba(0,0,0,0.5)">
                    </div>
                </div>
            `;
        }

        if (type === 'button') {
            html += `
                <!-- Button Styling -->
                <div class="property-section">
                    <h4>BUTTON STYLING</h4>
                    <div class="property-item">
                        <label>Background</label>
                        <input type="text" class="prop-input" data-style="background" 
                               value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                    </div>
                    <div class="property-item">
                        <label>Border Radius</label>
                        <input type="text" class="prop-input" data-style="borderRadius" value="50px">
                    </div>
                    <div class="property-item">
                        <label>Padding</label>
                        <input type="text" class="prop-input" data-style="padding" value="15px 40px">
                    </div>
                    <div class="property-item">
                        <label>Box Shadow</label>
                        <input type="text" class="prop-input" data-style="boxShadow" value="0 4px 15px rgba(0,0,0,0.2)">
                    </div>
                </div>
            `;
        }

        if (type === 'background') {
            html += `
                <!-- Background Styling -->
                <div class="property-section">
                    <h4>BACKGROUND</h4>
                    <div class="property-item">
                        <label>Background Type</label>
                        <select class="prop-select" id="bg-type">
                            <option value="color">Solid Color</option>
                            <option value="gradient" selected>Gradient</option>
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                    </div>
                    <div class="property-item">
                        <label>Gradient</label>
                        <input type="text" class="prop-input" data-style="background" 
                               value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                    </div>
                    <div class="property-item">
                        <label>Background Size</label>
                        <select class="prop-select" data-style="backgroundSize">
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        
        this.propertiesPanel.innerHTML = html;
        this.setupPropertyListeners(layer);
    },

    // Setup property input listeners
    setupPropertyListeners(layer) {
        const panel = this.propertiesPanel;
        
        // Number/text inputs
        panel.querySelectorAll('.prop-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const prop = e.target.dataset.prop;
                const style = e.target.dataset.style;
                const value = e.target.value;
                
                if (prop) {
                    layer.style[prop] = value;
                }
                if (style) {
                    const targetElement = layer.querySelector('.layer-content') || layer;
                    targetElement.style[style] = value;
                }
                
                this.saveState();
            });
        });

        // Range inputs
        panel.querySelectorAll('.prop-range').forEach(input => {
            input.addEventListener('input', (e) => {
                const prop = e.target.dataset.prop;
                const value = e.target.value;
                layer.style[prop] = value;
                
                // Update display value
                e.target.nextElementSibling.textContent = value;
                this.saveState();
            });
        });

        // Select inputs
        panel.querySelectorAll('.prop-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const prop = e.target.dataset.prop;
                const value = e.target.value;
                
                if (prop) {
                    layer.style[prop] = value;
                }
                this.saveState();
            });
        });

        // Color inputs
        panel.querySelectorAll('.prop-color').forEach(input => {
            input.addEventListener('input', (e) => {
                const style = e.target.dataset.style;
                const value = e.target.value;
                const targetElement = layer.querySelector('.layer-content') || layer;
                targetElement.style[style] = value;
                this.saveState();
            });
        });

        // Checkbox inputs
        panel.querySelectorAll('.prop-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const prop = e.target.dataset.prop;
                const value = e.target.checked ? 'auto' : 'none';
                layer.style[prop] = value;
                this.saveState();
            });
        });
    },

    // Toggle layer visibility
    toggleVisibility(layer) {
        const isVisible = layer.style.display !== 'none';
        layer.style.display = isVisible ? 'none' : 'block';
        
        const layerData = this.layers.find(l => l.id === layer.id);
        if (layerData) {
            layerData.visible = !isVisible;
        }
        
        this.saveState();
    },

    // Delete layer
    deleteLayer(id) {
        const layer = document.getElementById(id);
        if (layer) {
            layer.remove();
            this.layers = this.layers.filter(l => l.id !== id);
            this.saveState();
        }
    },

    // Render all layers from storage
    renderLayers() {
        this.layers.forEach(layerData => {
            const layer = document.createElement('div');
            layer.className = 'draggable-layer';
            layer.id = layerData.id;
            layer.dataset.type = layerData.type;
            layer.style.zIndex = layerData.zIndex;
            layer.style.left = '100px';
            layer.style.top = '100px';
            layer.style.width = '400px';
            layer.style.height = '300px';
            layer.style.display = layerData.visible !== false ? 'block' : 'none';
            
            layer.innerHTML = `
                <div class="drag-handle">
                    <span class="layer-icon">${this.getLayerIcon(layerData.type)}</span>
                    <span class="layer-label">${layerData.type.toUpperCase()}</span>
                    <div class="layer-actions">
                        <button class="btn-visibility">👁</button>
                        <button class="btn-delete">✕</button>
                    </div>
                </div>
                <div class="layer-content">${layerData.content}</div>
                <div class="resize-handle r-se"></div>
            `;
            
            this.canvas.appendChild(layer);
            new DraggableLayer(layer);
            this.setupLayerFunctionality(layer, layerData);
        });
    },

    // Save state to localStorage
    saveState() {
        const layersData = this.layers.map(layer => {
            const el = document.getElementById(layer.id);
            return {
                ...layer,
                position: {
                    left: el ? el.style.left : '0',
                    top: el ? el.style.top : '0'
                },
                size: {
                    width: el ? el.style.width : '0',
                    height: el ? el.style.height : '0'
                },
                zIndex: el ? el.style.zIndex : layer.zIndex
            };
        });
        
        StorageManager.save(layersData);
    },

    // Get current layers
    getLayers() {
        return this.layers;
    },

    // Clear all layers
    clearAll() {
        this.canvas.innerHTML = '';
        this.layers = [];
        this.zIndexCounter = 1;
        StorageManager.save([]);
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LayerSystem.init());
} else {
    LayerSystem.init();
}
