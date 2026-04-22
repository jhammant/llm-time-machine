// Interactive timeline chart for the LLM Time Machine microsite.
// Relies on Chart.js (loaded via CDN in index.html) + window.LLM_DATA from data.js.

(function () {
  const { models, projections, dateToNum, fitsIn, formatDate, estimateTps } = window.LLM_DATA;

  const archPalette = {
    dense: "#d81b60",
    moe:   "#1e88e5",
  };
  const publisherHue = {
    "Alibaba":    "#d81b60",
    "Meta":       "#1877f2",
    "Mistral AI": "#ff7000",
    "Google":     "#4285f4",
    "OpenAI":     "#43a047",
    "DeepSeek":   "#8e24aa",
  };

  // --- State ---
  const state = {
    benchmark: "mmluPro",
    ramGb: 128,
    showProjections: false,
  };

  // --- DOM ---
  const ctx = document.getElementById("timeline-chart").getContext("2d");
  const benchmarkSel = document.getElementById("benchmark-select");
  const ramSlider = document.getElementById("ram-slider");
  const ramValueEl = document.getElementById("ram-value");
  const projCheckbox = document.getElementById("show-projections");

  // --- Helpers ---
  function benchmarkLabel(key) {
    return ({
      mmluPro: "MMLU-Pro (general reasoning)",
      gpqaDiamond: "GPQA Diamond (graduate-level science)",
      sweBenchVerified: "SWE-bench Verified (real software engineering)",
    })[key];
  }

  function pointRadius(totalB) {
    // Active param count would be more "correct" but total params reads better
    // here — viewers intuitively expect bigger model = bigger dot.
    return Math.max(5, Math.min(22, Math.sqrt(totalB) * 1.6));
  }

  function makeDataset(list, opts = {}) {
    return list.map((m) => ({
      x: dateToNum(m.releaseDate),
      y: m[state.benchmark],
      model: m,
    })).filter((p) => p.y != null);
  }

  // --- Chart ---
  let chart;
  function render() {
    const fittingModels = models.filter((m) => fitsIn(m, state.ramGb));
    const nonFitting = models.filter((m) => !fitsIn(m, state.ramGb));

    const densePoints = makeDataset(fittingModels.filter((m) => m.arch === "dense"));
    const moePoints   = makeDataset(fittingModels.filter((m) => m.arch === "moe"));
    const ghostPoints = makeDataset(nonFitting);

    const datasets = [
      {
        label: "Dense (fits on " + state.ramGb + "GB)",
        data: densePoints,
        backgroundColor: densePoints.map((p) => archPalette.dense),
        borderColor: "#000",
        borderWidth: (ctx) => ctx.raw?.model?.isHero ? 3 : 1,
        pointRadius: (ctx) => pointRadius(ctx.raw?.model?.totalB || 10),
        pointHoverRadius: (ctx) => pointRadius(ctx.raw?.model?.totalB || 10) + 4,
        showLine: false,
      },
      {
        label: "MoE (fits on " + state.ramGb + "GB)",
        data: moePoints,
        backgroundColor: "rgba(30,136,229,0.15)",
        borderColor: archPalette.moe,
        borderWidth: 2.5,
        pointRadius: (ctx) => pointRadius(ctx.raw?.model?.totalB || 10),
        pointHoverRadius: (ctx) => pointRadius(ctx.raw?.model?.totalB || 10) + 4,
        showLine: false,
      },
      {
        label: "Too big for " + state.ramGb + "GB",
        data: ghostPoints,
        backgroundColor: "rgba(0,0,0,0.05)",
        borderColor: "rgba(0,0,0,0.25)",
        borderDash: [3, 3],
        borderWidth: 1,
        pointStyle: "crossRot",
        pointRadius: 8,
        pointHoverRadius: 10,
        showLine: false,
      },
    ];

    if (state.showProjections) {
      datasets.push({
        label: "Projection",
        data: makeDataset(projections),
        backgroundColor: "rgba(216,27,96,0.35)",
        borderColor: archPalette.dense,
        borderDash: [6, 4],
        borderWidth: 2,
        pointStyle: "triangle",
        pointRadius: 12,
        pointHoverRadius: 16,
        showLine: true,
      });
    }

    // Frontier line — connects the best-score-so-far model at each release date
    const allFitting = [...densePoints, ...moePoints].sort((a, b) => a.x - b.x);
    let maxSoFar = -Infinity;
    const frontier = [];
    for (const p of allFitting) {
      if (p.y > maxSoFar) {
        frontier.push({ x: p.x, y: p.y });
        maxSoFar = p.y;
      }
    }
    if (state.showProjections) {
      for (const p of projections) {
        frontier.push({ x: dateToNum(p.releaseDate), y: p[state.benchmark] });
      }
    }

    datasets.unshift({
      label: "Frontier on your box",
      data: frontier,
      type: "line",
      borderColor: "rgba(216,27,96,0.35)",
      backgroundColor: "rgba(216,27,96,0.08)",
      borderWidth: 2,
      borderDash: [],
      pointRadius: 0,
      fill: true,
      stepped: "before",
      order: 10,
    });

    if (chart) {
      chart.data.datasets = datasets;
      chart.options.scales.y.title.text = benchmarkLabel(state.benchmark);
      chart.options.scales.x.max = state.showProjections ? 2028.5 : 2026.5;
      chart.update();
      return;
    }

    chart = new Chart(ctx, {
      type: "scatter",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, right: 20, bottom: 10, left: 10 } },
        scales: {
          x: {
            type: "linear",
            min: 2023.4,
            max: 2026.5,
            title: { display: true, text: "Release date", font: { size: 13, weight: "600" } },
            ticks: {
              stepSize: 0.5,
              callback: (v) => {
                const y = Math.floor(v);
                const m = Math.round((v - y) * 12);
                if (m === 0) return String(y);
                if (m === 6) return "mid-" + y;
                return "";
              },
              font: { size: 11 },
            },
            grid: { color: "rgba(0,0,0,0.06)" },
          },
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: benchmarkLabel(state.benchmark),
              font: { size: 13, weight: "600" },
            },
            grid: { color: "rgba(0,0,0,0.06)" },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: { font: { size: 12 }, padding: 16, usePointStyle: true },
          },
          tooltip: {
            padding: 12,
            backgroundColor: "rgba(13,17,23,0.96)",
            titleFont: { size: 13, weight: "700" },
            bodyFont: { size: 12 },
            displayColors: false,
            callbacks: {
              title: (items) => {
                const m = items[0].raw.model;
                return m.name + (m.isProjection ? "  (projection)" : "");
              },
              label: (item) => {
                const m = item.raw.model;
                const tps = estimateTps(m, m.isMeasured && m.id === "qwen3.6-27b" ? "Q8" : "Q4");
                const lines = [
                  `${formatDate(m.releaseDate)}  ·  ${m.publisher}`,
                  `Arch: ${m.arch === "dense" ? "Dense " + m.totalB + "B" : "MoE " + m.totalB + "B / " + m.activeB + "B active"}`,
                  `${benchmarkLabel(state.benchmark).split(" (")[0]}: ${item.parsed.y ?? "n/r"}`,
                  `Q4 size: ${m.sizeQ4Gb}GB  ·  est. ${tps} TPS`,
                ];
                if (m.isMeasured) lines.push("✓ measured on this Mac");
                if (m.notes) lines.push("");
                if (m.notes) lines.push(m.notes);
                return lines;
              },
            },
          },
        },
      },
    });
  }

  // --- Wire up controls ---
  benchmarkSel.addEventListener("change", (e) => {
    state.benchmark = e.target.value;
    render();
  });
  ramSlider.addEventListener("input", (e) => {
    state.ramGb = parseInt(e.target.value, 10);
    ramValueEl.textContent = state.ramGb + "GB";
    render();
  });
  projCheckbox.addEventListener("change", (e) => {
    state.showProjections = e.target.checked;
    render();
  });

  render();
})();
