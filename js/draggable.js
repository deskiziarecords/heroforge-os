class DraggableLayer {
    constructor(element) {
        this.el = element;
        this.handle = element.querySelector('.drag-handle');
        this.isDragging = false;
        this.startPos = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.handle.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
    }

    startDrag(e) {
        this.isDragging = true;
        this.startPos = { x: e.clientX, y: e.clientY };
        const rect = this.el.getBoundingClientRect();
        this.startRect = { left: rect.left, top: rect.top };
        this.el.style.pointerEvents = 'none';
    }

    drag(e) {
        if (!this.isDragging) return;
        const dx = e.clientX - this.startPos.x;
        const dy = e.clientY - this.startPos.y;
        this.el.style.left = `${this.startRect.left + dx}px`;
        this.el.style.top = `${this.startRect.top + dy}px`;
    }

    stopDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.el.style.pointerEvents = 'auto';
        // Trigger save
        LayerSystem.saveState();
    }
}
