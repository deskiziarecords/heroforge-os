// ============================================
// HeroForge OS - Iframe Manager
// Secure iframe embedding with sandbox controls
// ============================================

class IframeManager {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            src: config.src || 'about:blank',
            width: config.width || '100%',
            height: config.height || '100%',
            sandbox: config.sandbox || 'allow-scripts allow-same-origin',
            allow: config.allow || 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            loading: config.loading || 'lazy',
            referrerPolicy: config.referrerPolicy || 'strict-origin-when-cross-origin',
            aspectRatio: config.aspectRatio || 'auto', // '16:9', '4:3', '1:1', 'auto'
            title: config.title || 'Embedded Content',
            ...config
        };
        
        this.iframe = null;
        this.init();
    }

    // Initialize the iframe
    init() {
        this.validateConfig();
        this.createIframe();
        this.setupEventListeners();
        this.applyAspectRatio();
    }

    // Validate configuration for security
    validateConfig() {
        // Validate URL if not blank
        if (this.config.src !== 'about:blank') {
            const isValid = this.validateURL(this.config.src);
            if (!isValid) {
                console.warn('HeroForge: Potentially unsafe URL detected. Using blank iframe.');
                this.config.src = 'about:blank';
            }
        }

        // Sanitize sandbox attributes
        this.config.sandbox = this.sanitizeSandbox(this.config.sandbox);
    }

    // Validate URL against allowed domains
    validateURL(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;

            // List of commonly allowed embed domains
            const allowedDomains = [
                'youtube.com',
                'www.youtube.com',
                'youtube-nocookie.com',
                'www.youtube-nocookie.com',
                'vimeo.com',
                'www.vimeo.com',
                'player.vimeo.com',
                'maps.google.com',
                'www.google.com',
                'maps.googleapis.com',
                'docs.google.com',
                'drive.google.com',
                'forms.google.com',
                'sheets.google.com',
                'slides.google.com',
                'codepen.io',
                'www.codepen.io',
                'jsfiddle.net',
                'www.jsfiddle.net',
                'codepen.io',
                'www.codepen.io',
                'embed.ted.com',
                'www.ted.com',
                'soundcloud.com',
                'w.soundcloud.com',
                'player.soundcloud.com',
                'open.spotify.com',
                'embed.spotify.com',
                'twitter.com',
                'www.twitter.com',
                'platform.twitter.com',
                'instagram.com',
                'www.instagram.com',
                'www.instagram.com',
                'facebook.com',
                'www.facebook.com',
                'www.facebook.com',
                'github.com',
                'www.github.com',
                'gist.github.com',
                'codesandbox.io',
                'www.codesandbox.io',
                'stackblitz.com',
                'www.stackblitz.com',
                'replit.com',
                'www.replit.com',
                'figma.com',
                'www.figma.com',
                'embed.figma.com',
                'lottiefiles.com',
                'www.lottiefiles.com',
                'player.lottiefiles.com'
            ];

            // Check if domain is allowed
            const isAllowed = allowedDomains.some(allowed => 
                hostname === allowed || hostname.endsWith('.' + allowed)
            );

            return isAllowed || hostname === 'localhost' || hostname === '127.0.0.1';
        } catch (error) {
            console.error('HeroForge: Invalid URL format', error);
            return false;
        }
    }

    // Sanitize sandbox attributes
    sanitizeSandbox(sandbox) {
        const allowedTokens = [
            'allow-scripts',
            'allow-same-origin',
            'allow-forms',
            'allow-popups',
            'allow-popups-to-escape-sandbox',
            'allow-top-navigation',
            'allow-top-navigation-by-user-activation',
            'allow-downloads',
            'allow-modals',
            'allow-orientation-lock',
            'allow-pointer-lock',
            'allow-presentation',
            'allow-storage-access-by-user-activation',
            'allow-top-navigation-to-custom-protocols'
        ];

        if (typeof sandbox !== 'string') {
            return 'allow-scripts allow-same-origin';
        }

        const tokens = sandbox.split(' ').filter(token => {
            const trimmed = token.trim();
            return allowedTokens.includes(trimmed);
        });

        return tokens.length > 0 ? tokens.join(' ') : 'allow-scripts allow-same-origin';
    }

    // Create the iframe element
    createIframe() {
        this.container.innerHTML = '';

        this.iframe = document.createElement('iframe');
        this.iframe.src = this.config.src;
        this.iframe.width = this.config.width;
        this.iframe.height = this.config.height;
        this.iframe.sandbox = this.config.sandbox;
        this.iframe.allow = this.config.allow;
        this.iframe.loading = this.config.loading;
        this.iframe.referrerPolicy = this.config.referrerPolicy;
        this.iframe.title = this.config.title;
        this.iframe.frameborder = '0';
        this.iframe.allowfullscreen = true;

        // Apply styles
        Object.assign(this.iframe.style, {
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
        });

        // Add to container
        this.container.appendChild(this.iframe);

        // Add loading indicator
        this.addLoadingIndicator();
    }

    // Add loading indicator
    addLoadingIndicator() {
        const loader = document.createElement('div');
        loader.className = 'iframe-loader';
        loader.innerHTML = `
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: #888;
                font-family: sans-serif;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 10px;
                "></div>
                <div style="font-size: 12px;">Loading...</div>
            </div>
        `;

        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        this.container.appendChild(style);
        this.container.appendChild(loader);

        // Remove loader when iframe loads
        this.iframe.addEventListener('load', () => {
            loader.remove();
            style.remove();
        });

        // Remove after timeout
        setTimeout(() => {
            if (loader.parentNode) {
                loader.remove();
            }
        }, 5000);
    }

    // Apply aspect ratio
    applyAspectRatio() {
        if (!this.iframe) return;

        const ratios = {
            '16:9': 1.7778,
            '4:3': 1.3333,
            '1:1': 1,
            '21:9': 2.3333,
            '3:2': 1.5,
            'auto': null
        };

        const ratio = ratios[this.config.aspectRatio];

        if (ratio) {
            // Create wrapper for aspect ratio
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = '100%';
            wrapper.style.paddingBottom = `${(1 / ratio) * 100}%`;
            wrapper.style.height = '0';
            wrapper.style.overflow = 'hidden';

            // Reset iframe styles
            this.iframe.style.position = 'absolute';
            this.iframe.style.top = '0';
            this.iframe.style.left = '0';
            this.iframe.style.width = '100%';
            this.iframe.style.height = '100%';

            // Wrap iframe
            this.container.appendChild(wrapper);
            wrapper.appendChild(this.iframe);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for resize
        if (this.container.closest('.draggable-layer')) {
            this.container.closest('.draggable-layer').addEventListener('layerResize', () => {
                this.onResize();
            });
        }

        // Error handling
        this.iframe.addEventListener('error', () => {
            this.handleError();
        });

        // Load event
        this.iframe.addEventListener('load', () => {
            this.handleLoad();
        });
    }

    // Handle resize event
    onResize() {
        // Trigger any necessary resize logic
        // Some embedded content may need to be notified
        try {
            this.iframe.contentWindow.postMessage({
                type: 'resize',
                width: this.container.offsetWidth,
                height: this.container.offsetHeight
            }, '*');
        } catch (e) {
            // Cross-origin restriction - expected
        }
    }

    // Handle load event
    handleLoad() {
        if (this.config.onLoad && typeof this.config.onLoad === 'function') {
            this.config.onLoad(this.iframe);
        }
    }

    // Handle error event
    handleError() {
        console.error('HeroForge: Iframe failed to load', this.config.src);
        
        this.container.innerHTML = `
            <div style="
                padding: 20px;
                text-align: center;
                color: #f44336;
                font-family: sans-serif;
            ">
                <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                <div style="font-size: 14px; margin-bottom: 10px;">Failed to load content</div>
                <div style="font-size: 12px; color: #888; word-break: break-all;">${this.config.src}</div>
                <button onclick="this.closest('.layer-content').innerHTML = ''" style="
                    margin-top: 15px;
                    padding: 8px 16px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Clear</button>
            </div>
        `;
    }

    // Update iframe source
    updateSource(src) {
        if (this.validateURL(src)) {
            this.config.src = src;
            this.iframe.src = src;
        } else {
            console.warn('HeroForge: Invalid URL rejected');
        }
    }

    // Update sandbox attributes
    updateSandbox(sandbox) {
        this.config.sandbox = this.sanitizeSandbox(sandbox);
        this.iframe.sandbox = this.config.sandbox;
    }

    // Update aspect ratio
    updateAspectRatio(ratio) {
        this.config.aspectRatio = ratio;
        // Recreate iframe with new ratio
        this.createIframe();
        this.setupEventListeners();
    }

    // Get iframe element
    getIframe() {
        return this.iframe;
    }

    // Destroy the manager
    destroy() {
        if (this.iframe) {
            this.iframe.src = 'about:blank';
            this.iframe.remove();
            this.iframe = null;
        }
    }

    // Static method: Create embed URL for common services
    static getEmbedURL(service, id, options = {}) {
        const services = {
            youtube: (id, opts) => {
                const params = new URLSearchParams({
                    autoplay: opts.autoplay ? '1' : '0',
                    controls: opts.controls !== false ? '1' : '0',
                    mute: opts.mute ? '1' : '0',
                    loop: opts.loop ? '1' : '0',
                    ...opts.params
                });
                return `https://www.youtube.com/embed/${id}?${params}`;
            },
            vimeo: (id, opts) => {
                const params = new URLSearchParams({
                    autoplay: opts.autoplay ? '1' : '0',
                    controls: opts.controls !== false ? '1' : '0',
                    ...opts.params
                });
                return `https://player.vimeo.com/video/${id}?${params}`;
            },
            googleMaps: (query, opts) => {
                return `https://www.google.com/maps/embed?pb=${encodeURIComponent(query)}`;
            },
            codepen: (user, pen, opts) => {
                return `https://codepen.io/${user}/embed/${pen}?${new URLSearchParams(opts.params || {})}`;
            },
            jsfiddle: (user, id, opts) => {
                return `https://jsfiddle.net/${user}/${id}/embedded/`;
            },
            soundcloud: (url, opts) => {
                return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&${new URLSearchParams(opts.params || {})}`;
            },
            spotify: (type, id, opts) => {
                return `https://open.spotify.com/embed/${type}/${id}?${new URLSearchParams(opts.params || {})}`;
            },
            figma: (fileId, opts) => {
                return `https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/${fileId}`;
            },
            lottie: (url, opts) => {
                return `https://player.lottiefiles.com/embed/${url}?${new URLSearchParams(opts.params || {})}`;
            }
        };

        if (services[service]) {
            return services[service](id, options);
        }

        return null;
    }

    // Static method: Extract video ID from URL
    static extractVideoID(url, service) {
        try {
            const urlObj = new URL(url);
            
            if (service === 'youtube' || urlObj.hostname.includes('youtube')) {
                return urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
            }
            
            if (service === 'vimeo' || urlObj.hostname.includes('vimeo')) {
                return urlObj.pathname.split('/').pop();
            }

            return null;
        } catch (e) {
            return null;
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IframeManager;
}
