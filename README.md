# The LLM Time Machine

> Your Mac didn't get smarter. The models running on it did.

An interactive microsite showing how much open-weight LLMs improved on the
same consumer hardware from July 2023 to April 2026 — and projecting where
they go next.

Live site: **https://jhammant.github.io/llm-time-machine/**

## What this covers

- **Rearview timeline** — notable open-weight releases plotted against
  benchmark scores, filtered by what actually fits on your chosen RAM budget.
- **Side-by-side** — same hardware, 18 months apart. Llama 3 70B (Oct 2024)
  vs Qwen 3.6 27B (Apr 2026).
- **Four levers** — architecture, quantization, training data, post-training.
  Why hardware-free progress is compounding.
- **Dense vs MoE** — why the smartest model in the lineup is also the slowest.
- **Projections** — conservative extrapolation to 2027 and 2028.

## Data

Benchmark scores are pulled directly from each model's Hugging Face card
where available. The most recent five models (Qwen 3.6 27B, Gemma 4 26B
A4B, Qwen 3.5 35B A3B, gpt-oss 20B, Qwen 3 Next 80B) were **directly
measured** on a 128GB M-series Mac via LM Studio, 3 iterations per
scenario, with unique prompts per iteration to defeat KV-cache reuse.

Older models (Llama 2/3, Mistral, Mixtral) use MMLU scores rescaled to
approximate MMLU-Pro equivalent — MMLU-Pro wasn't standardized until 2024.

TPS estimates for models not directly measured come from a simple
bandwidth-bound estimator calibrated against the measured runs.

## Tech

Single-page static site. No build step.

- `index.html` — markup
- `css/style.css` — styles
- `js/data.js` — the model dataset + estimator helpers
- `js/charts.js` — Chart.js wiring
- `images/` — static figures

Deployed via GitHub Pages from `main` branch root.

## License

MIT on the code. Benchmark numbers belong to their respective publishers;
this site just plots them. Corrections welcome via PR or issue.
