class SecurityManager {
  static sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
  
  static sanitizeData(data) {
    // Remove potentially dangerous properties
    if (typeof data === 'object') {
      const sanitized = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          sanitized[this.sanitizeHTML(key)] = this.sanitizeHTML(String(data[key]));
        }
      }
      return sanitized;
    }
    return this.sanitizeHTML(String(data));
  }
  
  static validateIFrameURL(url) {
    const allowedDomains = [
      'youtube.com',
      'youtube-nocookie.com',
      'vimeo.com',
      'maps.google.com',
      'docs.google.com'
    ];
    
    try {
      const urlObj = new URL(url);
      return allowedDomains.some(domain => 
        urlObj.hostname === domain || 
        urlObj.hostname.endsWith('.' + domain)
      );
    } catch {
      return false;
    }
  }
  
  static createSandboxAttributes(config) {
    const attributes = ['allow-scripts'];
    
    if (config.allowSameOrigin) attributes.push('allow-same-origin');
    if (config.allowForms) attributes.push('allow-forms');
    if (config.allowPopups) attributes.push('allow-popups');
    if (config.allowDownloads) attributes.push('allow-downloads');
    
    return attributes.join(' ');
  }
  
  static escapeCSS(selector) {
    // Escape special CSS characters
    return selector.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '\\$&');
  }
}
