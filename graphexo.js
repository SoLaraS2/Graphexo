function getColor(i, total) {
    const selected = document.getElementById("colormapPicker")?.value || "default";
    if (selected === 'custom' && customColormap.length > 0) {
      return customColormap[i % customColormap.length];
    }
    if (selected === 'viridis') {
      return `hsl(${(240 - i * 240 / total)}, 80%, 50%)`;
    }
    if (selected === 'plasma') {
      return `hsl(${(i * 300 / total)}, 100%, 60%)`;
    }
    if (selected === 'category10') {
      const colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
      return colors[i % colors.length];
    }
    return 'steelblue';
  }

function plotGraph(containerId, trace, layout) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", 800);
  svg.setAttribute("height", 600);
  const bgColor = document.getElementById("bgColorPicker")?.value || "white";
  svg.style.background = bgColor;
  container.appendChild(svg);

  const margin = { top: 50, right: 20, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  let xScale = () => 0, yScale = () => 0;
  let xMin = 0, xMax = 0, yMin = 0, yMax = 0;

  if (trace.type !== 'pie') {
    xMin = 0
    xMax = Math.max(...trace.x) + (Math.max(...trace.x)*.1);
    yMin = 0;
    yMax = Math.max(...trace.y);

    xScale = d => (d - xMin) / (xMax - xMin) * width;
    yScale = d => height - (d - yMin) / (yMax - yMin) * height;
  }

  if (trace.type === 'line') {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = trace.x.map((x, i) => `${i === 0 ? 'M' : 'L'} ${xScale(x)} ${yScale(trace.y[i])}`).join(' ');
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", trace.marker?.color || 'steelblue');
    path.setAttribute("stroke-width", "2");
    g.appendChild(path);
  }

  if (trace.type === 'scatter' || trace.type === 'line') {
    trace.x.forEach((x, i) => {
      const cx = xScale(x);
      const cy = yScale(trace.y[i]);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", 5);
      circle.setAttribute("fill", trace.marker?.color || 'steelblue');
      g.appendChild(circle);
    });
  }

  if (trace.type === 'bar') {
    const barWidth = width / (trace.x.length + 1) * 0.8;
    const xOffset = (xMax - xMin) / (trace.x.length + 1);

    trace.x.forEach((x, i) => {
      const xPos = xScale(x - xOffset / 2);
      const yPos = yScale(trace.y[i]);
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", xPos);
      rect.setAttribute("y", yPos);
      rect.setAttribute("width", barWidth);
      rect.setAttribute("height", height - yPos);
      rect.setAttribute("fill", getColor(i, trace.y.length));
      g.appendChild(rect);
    });
  }

  if (trace.type === 'area') {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let d = `M ${xScale(trace.x[0])} ${height}`;
    trace.x.forEach((x, i) => {
      d += ` L ${xScale(x)} ${yScale(trace.y[i])}`;
    });
    d += ` L ${xScale(trace.x[trace.x.length - 1])} ${height} Z`;
    path.setAttribute("d", d);
    path.setAttribute("fill", trace.marker?.color || 'steelblue');
    path.setAttribute("fill-opacity", "0.5");
    path.setAttribute("stroke", trace.marker?.color || 'steelblue');
    g.appendChild(path);
  }

  if (trace.type === 'pie') {
    const total = trace.y.reduce((a, b) => a + b, 0);
    let startAngle = 0;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;

    trace.y.forEach((val, i) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(startAngle + sliceAngle);
      const y2 = centerY + radius * Math.sin(startAngle + sliceAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const d = `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;
      path.setAttribute("d", d);
      const color = getColor(i, trace.y.length);
      path.setAttribute("fill", color);
      g.appendChild(path);

      const midAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + (radius / 1.6) * Math.cos(midAngle);
      const labelY = centerY + (radius / 1.6) * Math.sin(midAngle);
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", labelX);
      label.setAttribute("y", labelY);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "12");
      label.setAttribute("fill", "#222");
      label.textContent = trace.labels?.[i] || '';
      g.appendChild(label);

      startAngle += sliceAngle;
    });
  }

  if (trace.type !== 'pie') {
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", 0);
    xAxis.setAttribute("y1", height);
    xAxis.setAttribute("x2", width);
    xAxis.setAttribute("y2", height);
    xAxis.setAttribute("stroke", "black");
    g.appendChild(xAxis);

    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", 0);
    yAxis.setAttribute("y1", 0);
    yAxis.setAttribute("x2", 0);
    yAxis.setAttribute("y2", height);
    yAxis.setAttribute("stroke", "black");
    g.appendChild(yAxis);

    const xTickCount = 5;
    trace.x.forEach((xVal) => {
        const px = xScale(xVal);
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tick.setAttribute("x1", px);
        tick.setAttribute("y1", height);
        tick.setAttribute("x2", px);
        tick.setAttribute("y2", height + 5);
        tick.setAttribute("stroke", "black");
        g.appendChild(tick);
    
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", px);
        label.setAttribute("y", height + 20);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "10");
        label.textContent = xVal;
        g.appendChild(label);
      });
    

    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
      const val = yMin + (i * (yMax - yMin)) / yTickCount;
      const py = yScale(val);
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
      tick.setAttribute("x1", -5);
      tick.setAttribute("y1", py);
      tick.setAttribute("x2", 0);
      tick.setAttribute("y2", py);
      tick.setAttribute("stroke", "black");
      g.appendChild(tick);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", -10);
      label.setAttribute("y", py + 3);
      label.setAttribute("text-anchor", "end");
      label.setAttribute("font-size", "10");
      label.textContent = val.toFixed(2);
      g.appendChild(label);
    }
  }

  const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
  title.setAttribute("x", 400);
  title.setAttribute("y", 30);
  title.setAttribute("text-anchor", "middle");
  title.setAttribute("font-size", "20");
  title.textContent = layout.title || '';
  svg.appendChild(title);

  const xlabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  xlabel.setAttribute("x", 400);
  xlabel.setAttribute("y", 590);
  xlabel.setAttribute("text-anchor", "middle");
  xlabel.setAttribute("font-size", "14");
  xlabel.textContent = layout.xaxis?.title || '';
  svg.appendChild(xlabel);

  const ylabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  ylabel.setAttribute("transform", `rotate(-90)`);
  ylabel.setAttribute("x", -300);
  ylabel.setAttribute("y", 20);
  ylabel.setAttribute("text-anchor", "middle");
  ylabel.setAttribute("font-size", "14");
  ylabel.textContent = layout.yaxis?.title || '';
  svg.appendChild(ylabel);
}

function downloadPNG() {
  const svg = document.querySelector('#plot svg');
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    const link = document.createElement('a');
    link.download = 'graphexo_plot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
}
let customColormap = [];

document.getElementById('colormapPicker')?.addEventListener('change', (e) => {
  if (e.target.value === 'custom') {
    document.getElementById('customColormapUpload').click();
  }
});

document.getElementById('customColormapUpload')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      customColormap = JSON.parse(ev.target.result);
    } catch (err) {
      alert("Invalid colormap file. Must be JSON array of color strings.");
    }
  };
  reader.readAsText(file);
});
function resetPlotOptions() {
    const picker = document.getElementById("colormapPicker");
    const upload = document.getElementById("customColormapUpload");
    if (picker) picker.value = "default";
    if (upload) upload.value = "";
    customColormap = [];
  }
  