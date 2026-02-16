const StorageManager = {
    key: 'heroforge_layers_v1',
    
    save(layers) {
        localStorage.setItem(this.key, JSON.stringify(layers));
    },
    
    load() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    },
    
    saveSnippet(name, code) {
        const snippets = JSON.parse(localStorage.getItem('heroforge_snippets') || '[]');
        snippets.unshift({ id: Date.now(), name, code, date: new Date().toISOString() });
        localStorage.setItem('heroforge_snippets', JSON.stringify(snippets.slice(0, 10)));
    },
    
    getSnippets() {
        return JSON.parse(localStorage.getItem('heroforge_snippets') || '[]');
    }
};
