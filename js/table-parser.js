class TableParser {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.data = [];
    this.init();
  }
  
  async init() {
    if (this.config.csvData) {
      this.data = await this.parseCSV(this.config.csvData);
    } else if (this.config.jsonData) {
      this.data = this.config.jsonData;
    }
    
    this.render();
  }
  
  parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i];
      });
      return obj;
    });
  }
  
  render() {
    this.container.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'data-table';
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    `;
    
    // Theme
    if (this.config.theme === 'striped') {
      table.style.cssText += 'background: repeating-linear-gradient(white, white 28px, #f5f5f5 28px, #f5f5f5 56px);';
    } else if (this.config.theme === 'dark') {
      table.style.cssText += 'background: #1a1a1a; color: #fff;';
    }
    
    // Headers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = `
      background: ${this.config.theme === 'dark' ? '#333' : '#4CAF50'};
      color: ${this.config.theme === 'dark' ? '#fff' : '#fff'};
    `;
    
    const headers = Object.keys(this.data[0] || {});
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      th.style.cssText = `
        padding: 12px;
        text-align: left;
        border-bottom: 2px solid ${this.config.theme === 'dark' ? '#555' : '#ddd'};
      `;
      
      // Sortable
      if (this.config.sortable) {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => this.sortBy(header));
      }
      
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    const rowsToShow = this.config.pagination || this.data.length;
    
    this.data.slice(0, rowsToShow).forEach(rowData => {
      const tr = document.createElement('tr');
      
      headers.forEach(header => {
        const td = document.createElement('td');
        td.textContent = rowData[header];
        td.style.cssText = `
          padding: 10px 12px;
          border-bottom: 1px solid ${this.config.theme === 'dark' ? '#333' : '#ddd'};
          font-variant-numeric: tabular-nums;
        `;
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    
    // Scroll container if needed
    if (this.data.length > rowsToShow) {
      const scrollContainer = document.createElement('div');
      scrollContainer.style.overflow = 'auto';
      scrollContainer.style.maxHeight = '400px';
      scrollContainer.appendChild(table);
      this.container.appendChild(scrollContainer);
      
      // Pagination controls
      this.addPaginationControls();
    } else {
      this.container.appendChild(table);
    }
  }
  
  sortBy(column) {
    this.data.sort((a, b) => {
      if (a[column] < b[column]) return -1;
      if (a[column] > b[column]) return 1;
      return 0;
    });
    this.render();
  }
  
  addPaginationControls() {
    const controls = document.createElement('div');
    controls.className = 'pagination-controls';
    controls.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 10px;
      margin-top: 10px;
    `;
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.onclick = () => this.changePage(-1);
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.onclick = () => this.changePage(1);
    
    controls.appendChild(prevBtn);
    controls.appendChild(nextBtn);
    this.container.appendChild(controls);
  }
  
  changePage(direction) {
    // Implement pagination logic
    this.currentPage = (this.currentPage || 0) + direction;
    this.render();
  }
}
