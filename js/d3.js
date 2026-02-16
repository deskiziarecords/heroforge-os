class D3Populator {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.svg = null;
    this.init();
  }
  
  async init() {
    await this.loadD3();
    this.createVisualization();
    
    this.container.addEventListener('layerResize', () => {
      this.createVisualization(); // Redraw on resize
    });
  }
  
  async loadD3() {
    if (window.d3) return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://d3js.org/d3.v7.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  createVisualization() {
    const { width, height } = this.container.getBoundingClientRect();
    
    // Clear previous
    this.container.innerHTML = '';
    
    // Create SVG
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);
    
    // Example: Bar Chart
    if (this.config.chartType === 'bar') {
      this.createBarChart(width, height);
    }
    // Add more chart types...
  }
  
  createBarChart(width, height) {
    const data = this.config.data || [];
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([innerHeight, 0]);
    
    const g = this.svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.value))
      .attr('fill', this.config.color || '#4CAF50');
    
    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    
    g.append('g')
      .call(d3.axisLeft(y));
  }
}
