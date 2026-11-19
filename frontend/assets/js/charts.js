/**
 * E-Voting OSIS - Charts Service
 * Unified Chart.js Bar & Donut charts with consistent candidate colors
 */
import { getCandidateColor } from './config.js';

export function renderBarChart(ctx, candidates, existingChart = null) {
  if (!window.Chart) {
    console.error('Chart.js not loaded');
    return null;
  }

  const labels = candidates.map(c => `#0${c.number} ${c.chairman_name}`);
  const data = candidates.map(c => c.votes_count);
  const backgroundColors = candidates.map(c => getCandidateColor(c.number).primary);
  const borderColors = candidates.map(c => getCandidateColor(c.number).border);

  if (existingChart) {
    existingChart.data.labels = labels;
    existingChart.data.datasets[0].data = data;
    existingChart.data.datasets[0].backgroundColor = backgroundColors;
    existingChart.data.datasets[0].borderColor = borderColors;
    existingChart.update();
    return existingChart;
  }

  return new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Jumlah Suara',
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 12,
          borderSkipped: false,
          maxBarThickness: 64,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#25351f',
          titleColor: '#ffffff',
          bodyColor: '#eaf2df',
          borderColor: '#8dbb50',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          displayColors: true,
          callbacks: {
            label(context) {
              const cand = candidates[context.dataIndex];
              return ` ${context.parsed.y} Suara (${cand?.percentage || 0}%)`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#64748b',
            font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 12 },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#eef2ea' },
          ticks: {
            precision: 0,
            color: '#788174',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
          },
        },
      },
    },
  });
}

export function renderDonutChart(ctx, candidates, existingChart = null) {
  if (!window.Chart) {
    console.error('Chart.js not loaded');
    return null;
  }

  const labels = candidates.map(c => `#0${c.number} ${c.chairman_name}`);
  const data = candidates.map(c => c.votes_count);
  const backgroundColors = candidates.map(c => getCandidateColor(c.number).primary);
  const borderColors = candidates.map(c => getCandidateColor(c.number).border);

  // If all votes are 0, show a faint placeholder slice
  const total = data.reduce((a, b) => a + b, 0);
  const chartData = total === 0 ? [1] : data;
  const chartColors = total === 0 ? ['#eef2ea'] : backgroundColors;

  if (existingChart) {
    existingChart.data.labels = total === 0 ? ['Belum ada suara'] : labels;
    existingChart.data.datasets[0].data = chartData;
    existingChart.data.datasets[0].backgroundColor = chartColors;
    existingChart.data.datasets[0].borderColor = total === 0 ? ['transparent'] : borderColors;
    existingChart.update();
    return existingChart;
  }

  return new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: total === 0 ? ['Belum ada suara'] : labels,
      datasets: [
        {
          data: chartData,
          backgroundColor: chartColors,
          borderColor: total === 0 ? ['transparent'] : borderColors,
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#25351f',
          titleColor: '#ffffff',
          bodyColor: '#eaf2df',
          borderColor: '#8dbb50',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label(context) {
              if (total === 0) return ' Belum ada data suara';
              const cand = candidates[context.dataIndex];
              return ` ${cand.votes_count} Suara (${cand.percentage}%)`;
            },
          },
        },
      },
    },
  });
}
