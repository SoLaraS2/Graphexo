function plotGraph(containerId, trace, layout) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
  
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    container.appendChild(canvas);
  
    const ctx = canvas.getContext('2d');
  
    // Plot margins
    const margin = { top: 40, left: 60, right: 20, bottom: 60 };
    const plotWidth = canvas.width - margin.left - margin.right;
    const plotHeight = canvas.height - margin.top - margin.bottom;
  
    const xMin = Math.min(...trace.x);
    const xMax = Math.max(...trace.x);
    const yMin = Math.min(...trace.y);
    const yMax = Math.max(...trace.y);
  
    const xScale = (x) => margin.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const yScale = (y) => margin.top + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight;
  
    // Draw axes
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotHeight);
    ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
    ctx.stroke();
  
    // Plot points
    ctx.fillStyle = trace.marker.color || 'blue';
    for (let i = 0; i < trace.x.length; i++) {
      const cx = xScale(trace.x[i]);
      const cy = yScale(trace.y[i]);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  
    // Title
    ctx.fillStyle = 'black';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(layout.title || '', canvas.width / 2, 30);
  
    // Axis labels
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(layout.xaxis?.title || '', canvas.width / 2, canvas.height - 20);
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(layout.yaxis?.title || '', 0, 0);
    ctx.restore();
  }
  
  function downloadPNG() {
    const canvas = document.querySelector('#plot canvas');
    const link = document.createElement('a');
    link.download = 'graphexo_plot.png';
    link.href = canvas.toDataURL();
    link.click();
  }
  