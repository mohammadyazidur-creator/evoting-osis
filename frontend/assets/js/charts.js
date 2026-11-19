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
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 60,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(4, 19, 14, 0.95)',
          titleColor: '#fbbf24',
          bodyColor: '#ffffff',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          borderWidth: 1,
          padding: 12,
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
            color: '#9ca3af',
            font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 12 },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            precision: 0,
            color: '#9ca3af',
            font: { family: 'Plus Jakarta Sans', size: 11 },
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
  const chartColors = total === 0 ? ['rgba(255, 255, 255, 0.1)'] : backgroundColors;

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
          backgroundColor: 'rgba(4, 19, 14, 0.95)',
          titleColor: '#fbbf24',
          bodyColor: '#ffffff',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          borderWidth: 1,
          padding: 12,
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
