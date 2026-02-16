document.addEventListener('DOMContentLoaded', () => {
    LayerSystem.init();

    // Toggle Bottom Panel
    const bottomPanel = document.getElementById('panel-bottom');
    const closeBtn = document.getElementById('close-bottom');
    
    // Open on Layer Toggle (Example for JS Layer)
    document.querySelector('[data-layer="js"]').addEventListener('click', () => {
        bottomPanel.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
        bottomPanel.classList.remove('open');
    });

    // Export Button
    document.getElementById('btn-export').addEventListener('click', () => {
        alert('Export functionality triggered. Check console for HTML structure.');
        console.log(document.getElementById('hero-preview').innerHTML);
    });

    // Load Snippets
    const snippets = StorageManager.getSnippets();
    const list = document.getElementById('recent-list');
    snippets.forEach(s => {
        const li = document.createElement('li');
        li.textContent = s.name;
        list.appendChild(li);
    });
});
