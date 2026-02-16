// ============================================
// HeroForge OS - ZIP Handler
// Upload, extract, and inject code packages
// ============================================

class ZipHandler {
    constructor() {
        this.requiredFiles = [
            'src/index.html',
            'src/style.css',
            'src/script.js'
        ];
        
        this.optionalFiles = [
            'src/assets/',
            'src/images/',
            'src/fonts/',
            'README.md'
        ];
        
        this.uploadZone = null;
        this.fileInput = null;
        this.codePreview = null;
        this.recentList = null;
        
        this.init();
    }

    // Initialize the handler
    init() {
        this.uploadZone = document.getElementById('drop-zone');
        this.fileInput = document.getElementById('file-input');
        this.codePreview = document.getElementById('code-preview');
        this.recentList = document.getElementById('recent-list');
        
        if (this.uploadZone) {
            this.setupEventListeners();
            this.loadRecentUploads();
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Drag and drop
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('drag-over');
        });

        this.uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('drag-over');
        });

        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // File input
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFile(e.target.files[0]);
                }
            });
        }

        // Click to upload
        if (this.uploadZone) {
            this.uploadZone.addEventListener('click', () => {
                if (this.fileInput) {
                    this.fileInput.click();
                }
            });
        }
    }

    // Handle uploaded file
    async handleFile(file) {
        if (!file.name.endsWith('.zip')) {
            this.showError('Please upload a .zip file');
            return;
        }

        this.showLoading('Extracting package...');

        try {
            const extracted = await this.extractZip(file);
            const validated = this.validateStructure(extracted);
            
            if (validated.valid) {
                await this.injectCode(validated.files);
                this.saveToRecent(file.name, validated.files);
                this.showSuccess('Package extracted successfully!');
            } else {
                this.showError(`Invalid structure: ${validated.error}`);
            }
        } catch (error) {
            console.error('HeroForge: ZIP extraction failed', error);
            this.showError(`Extraction failed: ${error.message}`);
        }
    }

    // Extract ZIP file using JSZip
    async extractZip(file) {
        // Check if JSZip is loaded
        if (typeof JSZip === 'undefined') {
            await this.loadJSZip();
        }

        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        
        const files = {};
        const filePromises = [];

        contents.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                const promise = zipEntry.async('text').then(content => {
                    files[relativePath] = content;
                });
                filePromises.push(promise);
            }
        });

        await Promise.all(filePromises);
        return files;
    }

    // Load JSZip library dynamically
    async loadJSZip() {
        return new Promise((resolve, reject) => {
            if (typeof JSZip !== 'undefined') {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load JSZip library'));
            document.head.appendChild(script);
        });
    }

    // Validate ZIP structure
    validateStructure(files) {
        const required = {
            html: false,
            css: false,
            js: false
        };

        let htmlContent = '';
        let cssContent = '';
        let jsContent = '';

        for (const [path, content] of Object.entries(files)) {
            // Normalize path
            const normalizedPath = path.replace(/\\/g, '/');
            
            // Check for required files
            if (normalizedPath.includes('index.html')) {
                required.html = true;
                htmlContent = content;
            }
            
            if (normalizedPath.includes('style.css')) {
                required.css = true;
                cssContent = content;
            }
            
            if (normalizedPath.includes('script.js')) {
                required.js = true;
                jsContent = content;
            }
        }

        // Validate all required files exist
        if (!required.html) {
            return {
                valid: false,
                error: 'Missing index.html'
            };
        }

        if (!required.css) {
            return {
                valid: false,
                error: 'Missing style.css'
            };
        }

        if (!required.js) {
            return {
                valid: false,
                error: 'Missing script.js'
            };
        }

        return {
            valid: true,
            files: {
                html: htmlContent,
                css: cssContent,
                js: jsContent,
                all: files
            }
        };
    }

    // Inject extracted code into playground
    async injectCode(files) {
        const layerId = `layer-code-${Date.now()}`;
        
        // Sanitize all code
        const sanitizedHTML = SecurityManager ? SecurityManager.sanitizeHTML(files.html) : files.html;
        const sanitizedCSS = SecurityManager ? SecurityManager.sanitizeCSS(files.css) : files.css;
        const sanitizedJS = SecurityManager ? SecurityManager.sanitizeJS(files.js) : files.js;

        // Create code layer
        const layer = LayerSystem.createLayer({
            type: 'custom-code',
            zIndex: 1,
            content: `
                <div class="code-inject-container" style="width:100%;height:100%;">
                    <style id="${layerId}-css">${sanitizedCSS}</style>
                    <div id="${layerId}-html">${sanitizedHTML}</div>
                    <script id="${layerId}-js">${sanitizedJS}<\/script>
                </div>
            `
        });

        // Show code preview
        if (this.codePreview) {
            this.codePreview.textContent = `
/* === EXTRACTED CODE === */

/* --- style.css --- */
${files.css}

/* --- script.js --- */
${files.js}
            `.trim();
        }

        // Execute scripts safely
        this.executeScripts(layer, sanitizedJS);

        return layer;
    }

    // Execute scripts safely within layer context
    executeScripts(layer, jsCode) {
        try {
            // Create isolated scope
            const scope = {
                container: layer.querySelector('.layer-content'),
                layerId: layer.id,
                utils: {
                    onResize: (callback) => {
                        layer.addEventListener('layerResize', (e) => callback(e.detail));
                    },
                    onLayerSelect: (callback) => {
                        layer.addEventListener('click', () => callback());
                    }
                }
            };

            // Wrap code in function with scope
            const wrappedCode = `
                (function(container, layerId, utils) {
                    try {
                        ${jsCode}
                    } catch (error) {
                        console.error('HeroForge Layer Script Error:', error);
                    }
                })(
                    arguments[0].container,
                    arguments[0].layerId,
                    arguments[0].utils
                );
            `;

            // Execute in isolated context
            const fn = new Function('arguments[0]', wrappedCode);
            fn(scope);

        } catch (error) {
            console.error('HeroForge: Script execution failed', error);
            this.showError('Script execution failed. Check console for details.');
        }
    }

    // Save to recent uploads
    saveToRecent(filename, files) {
        const snippet = {
            id: Date.now(),
            name: filename.replace('.zip', ''),
            timestamp: new Date().toISOString(),
            css: files.css,
            js: files.js,
            html: files.html,
            size: this.formatFileSize(files.css.length + files.js.length + files.html.length)
        };

        // Save to localStorage
        StorageManager.saveSnippet(filename, snippet);

        // Update UI
        this.loadRecentUploads();
    }

    // Load recent uploads from storage
    loadRecentUploads() {
        if (!this.recentList) return;

        const snippets = StorageManager.getSnippets();
        this.recentList.innerHTML = '';

        if (snippets.length === 0) {
            this.recentList.innerHTML = '<li style="color:#888;padding:10px;">No recent uploads</li>';
            return;
        }

        snippets.forEach((snippet, index) => {
            const li = document.createElement('li');
            li.style.cssText = `
                padding: 10px;
                margin: 5px 0;
                background: #333;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            li.innerHTML = `
                <div>
                    <div style="font-weight:bold;color:#fff;">${snippet.name}</div>
                    <div style="font-size:11px;color:#888;">${this.formatDate(snippet.timestamp)} • ${snippet.size}</div>
                </div>
                <div>
                    <button class="btn-reinject" data-index="${index}" style="
                        padding: 5px 10px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                        margin-right: 5px;
                    ">Load</button>
                    <button class="btn-delete-snippet" data-index="${index}" style="
                        padding: 5px 10px;
                        background: #f44336;
                        color: white;
                        border: none;
                        border-radius: 3px;
                        cursor: pointer;
                    ">✕</button>
                </div>
            `;

            // Reinject button
            li.querySelector('.btn-reinject').addEventListener('click', (e) => {
                e.stopPropagation();
                this.reinjectSnippet(snippet);
            });

            // Delete button
            li.querySelector('.btn-delete-snippet').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSnippet(index);
            });

            this.recentList.appendChild(li);
        });
    }

    // Reinject a saved snippet
    reinjectSnippet(snippet) {
        this.showLoading('Loading snippet...');
        
        LayerSystem.createLayer({
            type: 'custom-code',
            zIndex: 1,
            content: `
                <div class="code-inject-container" style="width:100%;height:100%;">
                    <style>${snippet.css}</style>
                    <div>${snippet.html}</div>
                    <script>${snippet.js}<\/script>
                </div>
            `
        });

        this.showSuccess('Snippet loaded!');
    }

    // Delete a snippet
    deleteSnippet(index) {
        const snippets = StorageManager.getSnippets();
        snippets.splice(index, 1);
        localStorage.setItem('heroforge_snippets', JSON.stringify(snippets));
        this.loadRecentUploads();
    }

    // Show loading message
    showLoading(message) {
        if (this.uploadZone) {
            this.uploadZone.innerHTML = `
                <div style="padding:20px;text-align:center;">
                    <div style="
                        width:30px;height:30px;
                        border:3px solid #f3f3f3;
                        border-top:3px solid #667eea;
                        border-radius:50%;
                        animation:spin 1s linear infinite;
                        margin:0 auto 10px;
                    "></div>
                    <div style="color:#888;">${message}</div>
                </div>
            `;
        }
    }

    // Show success message
    showSuccess(message) {
        if (this.uploadZone) {
            this.uploadZone.innerHTML = `
                <div style="padding:20px;text-align:center;">
                    <div style="font-size:40px;margin-bottom:10px;">✅</div>
                    <div style="color:#4CAF50;">${message}</div>
                    <div style="font-size:12px;color:#888;margin-top:10px;">Drop another .zip or click to upload</div>
                </div>
            `;
            
            // Reset after 3 seconds
            setTimeout(() => this.resetUploadZone(), 3000);
        }
    }

    // Show error message
    showError(message) {
        if (this.uploadZone) {
            this.uploadZone.innerHTML = `
                <div style="padding:20px;text-align:center;">
                    <div style="font-size:40px;margin-bottom:10px;">❌</div>
                    <div style="color:#f44336;">${message}</div>
                    <div style="font-size:12px;color:#888;margin-top:10px;">Drop another .zip or click to upload</div>
                </div>
            `;
            
            // Reset after 3 seconds
            setTimeout(() => this.resetUploadZone(), 3000);
        }
    }

    // Reset upload zone to default
    resetUploadZone() {
        if (this.uploadZone) {
            this.uploadZone.innerHTML = `
                <p>Drag .ZIP here (src/index.html, style.css, script.js)</p>
                <input type="file" id="file-input" accept=".zip" style="display:none;">
            `;
            
            // Re-setup listeners
            this.fileInput = document.getElementById('file-input');
            this.setupEventListeners();
        }
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Format date
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Extract code from current layers (for export)
    extractCurrentCode() {
        const layers = LayerSystem.getLayers();
        const codeLayers = layers.filter(l => l.type === 'custom-code');
        
        return codeLayers.map(layer => {
            const el = document.getElementById(layer.id);
            if (!el) return null;
            
            const styleEl = el.querySelector('style');
            const scriptEl = el.querySelector('script');
            const htmlEl = el.querySelector('.layer-content > div:not(style):not(script)');
            
            return {
                layerId: layer.id,
                css: styleEl ? styleEl.textContent : '',
                js: scriptEl ? scriptEl.textContent : '',
                html: htmlEl ? htmlEl.innerHTML : ''
            };
        }).filter(Boolean);
    }

    // Download extracted code as ZIP
    downloadExtractedCode() {
        const codeLayers = this.extractCurrentCode();
        
        if (codeLayers.length === 0) {
            this.showError('No code layers to export');
            return;
        }

        // Create ZIP
        const zip = new JSZip();
        
        codeLayers.forEach((layer, index) => {
            const folder = zip.folder(`layer-${index + 1}`);
            folder.file('index.html', layer.html);
            folder.file('style.css', layer.css);
            folder.file('script.js', layer.js);
        });

        // Generate and download
        zip.generateAsync({ type: 'blob' }).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `heroforge-export-${Date.now()}.zip`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    // Validate external dependencies in code
    checkDependencies(code) {
        const dependencies = {
            chartjs: /chart\.js|Chart\.js/i.test(code),
            d3: /d3\.js|d3\./i.test(code),
            three: /three\.js|THREE/i.test(code),
            gsap: /gsap|TweenMax/i.test(code),
            jquery: /jquery|\$/i.test(code)
        };

        const missing = [];
        
        if (dependencies.chartjs && typeof Chart === 'undefined') {
            missing.push('Chart.js');
        }
        if (dependencies.d3 && typeof d3 === 'undefined') {
            missing.push('D3.js');
        }
        if (dependencies.three && typeof THREE === 'undefined') {
            missing.push('Three.js');
        }
        if (dependencies.gsap && typeof gsap === 'undefined') {
            missing.push('GSAP');
        }
        if (dependencies.jquery && typeof jQuery === 'undefined') {
            missing.push('jQuery');
        }

        return {
            hasDependencies: Object.values(dependencies).some(v => v),
            missing,
            detected: Object.keys(dependencies).filter(k => dependencies[k])
        };
    }

    // Auto-load missing dependencies
    async autoLoadDependencies(dependencies) {
        const cdns = {
            'Chart.js': 'https://cdn.jsdelivr.net/npm/chart.js',
            'D3.js': 'https://d3js.org/d3.v7.min.js',
            'Three.js': 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            'GSAP': 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
            'jQuery': 'https://code.jquery.com/jquery-3.7.1.min.js'
        };

        const loadPromises = dependencies.missing.map(dep => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = cdns[dep];
                script.onload = () => {
                    console.log(`HeroForge: Loaded ${dep}`);
                    resolve();
                };
                script.onerror = () => reject(new Error(`Failed to load ${dep}`));
                document.head.appendChild(script);
            });
        });

        await Promise.all(loadPromises);
    }

    // Destroy handler
    destroy() {
        if (this.uploadZone) {
            this.uploadZone.innerHTML = '';
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZipHandler;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ZipHandler());
} else {
    new ZipHandler();
}
