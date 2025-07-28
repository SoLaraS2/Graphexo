function plotGraph(containerId, trace, layout) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", 800);
  svg.setAttribute("height", 600);
  svg.style.background = "white";
  container.appendChild(svg);

  const margin = { top: 50, right: 20, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${margin.left},${margin.top})`);
  svg.appendChild(g);

  const xMin = Math.min(...trace.x);
  const xMax = Math.max(...trace.x);
  const yMin = Math.min(...trace.y);
  const yMax = Math.max(...trace.y);

  const xScale = d => (d - xMin) / (xMax - xMin) * width;
  const yScale = d => height - (d - yMin) / (yMax - yMin) * height;

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
