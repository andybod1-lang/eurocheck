/* charts.js
 * Chart.js helpers for EuroCheck analytics dashboard
 * Dark theme palette: indigo primary, cyan secondary
 */

let chartJsLoadPromise = null;

function loadChartJs() {
  if (window.Chart) return Promise.resolve(window.Chart);
  if (chartJsLoadPromise) return chartJsLoadPromise;

  chartJsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";
    script.async = true;
    script.onload = () => resolve(window.Chart);
    script.onerror = () => reject(new Error("Failed to load Chart.js"));
    document.head.appendChild(script);
  });

  return chartJsLoadPromise;
}

// Theme palette
const COLORS = {
  indigo: "#4f46e5",      // primary
  cyan: "#22d3ee",        // secondary
  indigoSoft: "rgba(79, 70, 229, 0.35)",
  cyanSoft: "rgba(34, 211, 238, 0.35)",
  text: "rgba(229, 231, 235, 0.9)",
  grid: "rgba(148, 163, 184, 0.15)",
  surface: "rgba(15, 23, 42, 0.6)",
};

function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        labels: {
          color: COLORS.text,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: COLORS.surface,
        titleColor: COLORS.text,
        bodyColor: COLORS.text,
        borderColor: COLORS.grid,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: COLORS.text },
        grid: { color: COLORS.grid },
      },
      y: {
        ticks: { color: COLORS.text },
        grid: { color: COLORS.grid },
      },
    },
  };
}

// Initialize installs trend line chart
async function initInstallsChart(canvasId, data) {
  const Chart = await loadChartJs();
  const ctx = document.getElementById(canvasId);
  if (!ctx) throw new Error(`Canvas not found: ${canvasId}`);

  const labels = data?.labels || [];
  const chrome = data?.chrome || [];
  const firefox = data?.firefox || [];

  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Chrome",
          data: chrome,
          borderColor: COLORS.indigo,
          backgroundColor: COLORS.indigoSoft,
          pointRadius: 3,
          tension: 0.35,
          fill: true,
        },
        {
          label: "Firefox",
          data: firefox,
          borderColor: COLORS.cyan,
          backgroundColor: COLORS.cyanSoft,
          pointRadius: 3,
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      ...baseOptions(),
    },
  });
}

// Initialize rating distribution bar chart
async function initRatingChart(canvasId, data) {
  const Chart = await loadChartJs();
  const ctx = document.getElementById(canvasId);
  if (!ctx) throw new Error(`Canvas not found: ${canvasId}`);

  const labels = data?.labels || ["1★", "2★", "3★", "4★", "5★"];
  const values = data?.values || [];

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Ratings",
          data: values,
          backgroundColor: [
            "rgba(79, 70, 229, 0.3)",
            "rgba(79, 70, 229, 0.45)",
            "rgba(79, 70, 229, 0.6)",
            "rgba(34, 211, 238, 0.6)",
            "rgba(34, 211, 238, 0.8)",
          ],
          borderColor: [
            COLORS.indigo,
            COLORS.indigo,
            COLORS.indigo,
            COLORS.cyan,
            COLORS.cyan,
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      ...baseOptions(),
    },
  });
}

// Initialize platform split doughnut chart
async function initPlatformChart(canvasId, data) {
  const Chart = await loadChartJs();
  const ctx = document.getElementById(canvasId);
  if (!ctx) throw new Error(`Canvas not found: ${canvasId}`);

  const labels = data?.labels || ["Chrome", "Firefox"];
  const values = data?.values || [];

  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [COLORS.indigo, COLORS.cyan],
          borderColor: "rgba(15, 23, 42, 0.9)",
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      ...baseOptions(),
      scales: {}, // doughnut doesn't use axes
      cutout: "62%",
    },
  });
}

// Export for use in dashboard.js
window.EuroCheckCharts = {
  initInstallsChart,
  initRatingChart,
  initPlatformChart,
  loadChartJs,
  COLORS
};
