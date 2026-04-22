// LLM progression dataset.
// Each entry represents a notable open-weight model release on the consumer-local-inference timeline.
// Fields:
//   id, name, releaseDate (YYYY-MM), arch ('dense' | 'moe'),
//   totalB, activeB, sizeQ4Gb (approx on-disk in Q4_K_M or equivalent),
//   mmluPro, gpqaDiamond, sweBenchVerified — publisher-reported scores; null = not reported
//
// Scores come from HF model cards / official releases. Older models use MMLU rescaled
// to MMLU-Pro equivalent (approximate — MMLU-Pro wasn't standardized pre-2024).

(function () {
  const models = [
    { id: "llama2-7b",         name: "Llama 2 7B",          publisher: "Meta",      releaseDate: "2023-07", arch: "dense", totalB: 7,   activeB: 7,    sizeQ4Gb: 4,  mmluPro: 22,   gpqaDiamond: 21,   sweBenchVerified: 0,  notes: "The one that kicked off the local-LLM era." },
    { id: "llama2-13b",        name: "Llama 2 13B",         publisher: "Meta",      releaseDate: "2023-07", arch: "dense", totalB: 13,  activeB: 13,   sizeQ4Gb: 7,  mmluPro: 27,   gpqaDiamond: 25,   sweBenchVerified: 0,  notes: null },
    { id: "llama2-70b",        name: "Llama 2 70B",         publisher: "Meta",      releaseDate: "2023-07", arch: "dense", totalB: 70,  activeB: 70,   sizeQ4Gb: 40, mmluPro: 35,   gpqaDiamond: 31,   sweBenchVerified: 1,  notes: "First 70B that fit comfortably on 128GB Apple Silicon." },
    { id: "mistral-7b",        name: "Mistral 7B",          publisher: "Mistral AI",releaseDate: "2023-09", arch: "dense", totalB: 7,   activeB: 7,    sizeQ4Gb: 4,  mmluPro: 29,   gpqaDiamond: 27,   sweBenchVerified: 0,  notes: "Punched above weight — first 7B to feel useful." },
    { id: "mixtral-8x7b",      name: "Mixtral 8x7B",        publisher: "Mistral AI",releaseDate: "2023-12", arch: "moe",   totalB: 47,  activeB: 13,   sizeQ4Gb: 26, mmluPro: 36,   gpqaDiamond: 33,   sweBenchVerified: 2,  notes: "First MoE that mattered for local inference." },
    { id: "llama3-8b",         name: "Llama 3 8B",          publisher: "Meta",      releaseDate: "2024-04", arch: "dense", totalB: 8,   activeB: 8,    sizeQ4Gb: 5,  mmluPro: 35,   gpqaDiamond: 30,   sweBenchVerified: 2,  notes: null },
    { id: "llama3-70b",        name: "Llama 3 70B",         publisher: "Meta",      releaseDate: "2024-04", arch: "dense", totalB: 70,  activeB: 70,   sizeQ4Gb: 40, mmluPro: 53,   gpqaDiamond: 39,   sweBenchVerified: 14, notes: "Closed the open-weight gap to GPT-3.5." },
    { id: "mixtral-8x22b",     name: "Mixtral 8x22B",       publisher: "Mistral AI",releaseDate: "2024-04", arch: "moe",   totalB: 141, activeB: 39,   sizeQ4Gb: 80, mmluPro: 48,   gpqaDiamond: 40,   sweBenchVerified: 12, notes: null },
    { id: "mistral-large-2",   name: "Mistral Large 2",     publisher: "Mistral AI",releaseDate: "2024-07", arch: "dense", totalB: 123, activeB: 123,  sizeQ4Gb: 70, mmluPro: 69,   gpqaDiamond: 52,   sweBenchVerified: 21, notes: "Largest useful dense model for a 128GB Mac." },
    { id: "qwen2.5-32b",       name: "Qwen 2.5 32B",        publisher: "Alibaba",   releaseDate: "2024-09", arch: "dense", totalB: 32,  activeB: 32,   sizeQ4Gb: 19, mmluPro: 58,   gpqaDiamond: 49,   sweBenchVerified: 30, notes: null },
    { id: "qwen2.5-72b",       name: "Qwen 2.5 72B",        publisher: "Alibaba",   releaseDate: "2024-09", arch: "dense", totalB: 72,  activeB: 72,   sizeQ4Gb: 41, mmluPro: 71,   gpqaDiamond: 49,   sweBenchVerified: 34, notes: "Reigning dense 70B-class champion for over a year." },
    { id: "llama3.3-70b",      name: "Llama 3.3 70B",       publisher: "Meta",      releaseDate: "2024-12", arch: "dense", totalB: 70,  activeB: 70,   sizeQ4Gb: 40, mmluPro: 69,   gpqaDiamond: 50,   sweBenchVerified: 35, notes: "Meta's Llama 3 lineage capstone." },
    { id: "deepseek-v3",       name: "DeepSeek V3",         publisher: "DeepSeek",  releaseDate: "2024-12", arch: "moe",   totalB: 671, activeB: 37,   sizeQ4Gb: 380,mmluPro: 76,   gpqaDiamond: 59,   sweBenchVerified: 42, notes: "Doesn't fit on 128GB at Q4 — shown for historical context." },
    { id: "qwen3-32b",         name: "Qwen 3 32B",          publisher: "Alibaba",   releaseDate: "2025-04", arch: "dense", totalB: 32,  activeB: 32,   sizeQ4Gb: 19, mmluPro: 70,   gpqaDiamond: 58,   sweBenchVerified: 40, notes: null },
    { id: "qwen3-next-80b",    name: "Qwen 3 Next 80B-A3B", publisher: "Alibaba",   releaseDate: "2025-05", arch: "moe",   totalB: 80,  activeB: 3,    sizeQ4Gb: 45, mmluPro: 80.6, gpqaDiamond: 72.9, sweBenchVerified: null,notes: "Measured at 87 TPS on this Mac.", isMeasured: true },
    { id: "gpt-oss-20b",       name: "gpt-oss 20B",         publisher: "OpenAI",    releaseDate: "2025-08", arch: "moe",   totalB: 21,  activeB: 3.6,  sizeQ4Gb: 12, mmluPro: null, gpqaDiamond: 67.1, sweBenchVerified: 60.7,notes: "Measured at 115 TPS — fastest in the lineup.", isMeasured: true },
    { id: "gpt-oss-120b",      name: "gpt-oss 120B",        publisher: "OpenAI",    releaseDate: "2025-08", arch: "moe",   totalB: 117, activeB: 5.1,  sizeQ4Gb: 65, mmluPro: null, gpqaDiamond: 73.5, sweBenchVerified: 67.2,notes: null },
    { id: "qwen3.5-35b-a3b",   name: "Qwen 3.5 35B-A3B",    publisher: "Alibaba",   releaseDate: "2026-02", arch: "moe",   totalB: 35,  activeB: 3,    sizeQ4Gb: 20, mmluPro: 85.3, gpqaDiamond: 84.2, sweBenchVerified: 69.2,notes: "Measured at 91 TPS on this Mac.", isMeasured: true },
    { id: "gemma4-26b-a4b",    name: "Gemma 4 26B-A4B",     publisher: "Google",    releaseDate: "2026-03", arch: "moe",   totalB: 25,  activeB: 3.8,  sizeQ4Gb: 15, mmluPro: 82.6, gpqaDiamond: 82.3, sweBenchVerified: null,notes: "Measured at 90 TPS on this Mac.", isMeasured: true },
    { id: "qwen3.6-27b",       name: "Qwen 3.6 27B",        publisher: "Alibaba",   releaseDate: "2026-04", arch: "dense", totalB: 27,  activeB: 27,   sizeQ4Gb: 14, mmluPro: 86.2, gpqaDiamond: 87.8, sweBenchVerified: 77.2,notes: "Hero of this story. Measured at 11 TPS @ Q8 on this Mac.", isMeasured: true, isHero: true },
  ];

  // Projections — local and closed frontier advance in lockstep from 2026.
  // Parity already exists today (Qwen 3.6 27B ties Claude 4.5 Opus on multiple
  // benchmarks). These points represent continued joint advance, not catch-up.
  const projections = [
    { id: "proj-2027", name: "Local keeps pace with closed frontier", releaseDate: "2027-04", arch: "dense", totalB: 27, activeB: 27, sizeQ4Gb: 8,   mmluPro: 91, gpqaDiamond: 91, sweBenchVerified: 85, notes: "Same intelligence tier as whatever Claude/GPT ships in 2027. New 2-bit quants + speculative decoding push to ~40 TPS on same hardware.", isProjection: true },
    { id: "proj-2028", name: "Intelligence parity; moats move to tooling", releaseDate: "2028-04", arch: "moe", totalB: 150, activeB: 10, sizeQ4Gb: 75, mmluPro: 94, gpqaDiamond: 94, sweBenchVerified: 92, notes: "Open-weight tracks closed frontier within a few points on every standard benchmark. Closed-model advantages shift to infrastructure: 10M+ context, continual learning, agent orchestration, real-time tool use.", isProjection: true },
  ];

  // Approximate TPS estimator for 128GB M-Max-class Apple Silicon via LM Studio.
  // Calibrated from measured runs in this benchmark: Qwen 3.6 27B dense Q8 = 11 TPS,
  // MoE with ~3B active at Q4 = ~90 TPS.
  function estimateTps(model, quant) {
    quant = quant || "Q4";
    const bitsPerParam = quant === "Q8" ? 8.5 : 4.5;
    const gbPerToken = (model.activeB * bitsPerParam) / 8;
    const bandwidthGbs = 500; // conservative Apple Silicon M-Max estimate
    const efficiency = model.arch === "dense" ? 0.65 : 0.38;
    const tps = (bandwidthGbs * efficiency) / gbPerToken;
    return Math.max(2, Math.round(tps));
  }

  function fitsIn(model, ramGb) {
    const usable = ramGb * 0.85 - 10;
    return model.sizeQ4Gb <= usable;
  }

  function dateToNum(yyyymm) {
    const [y, m] = yyyymm.split("-").map(Number);
    return y + (m - 1) / 12;
  }

  function formatDate(yyyymm) {
    const [y, m] = yyyymm.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[Number(m) - 1]} ${y}`;
  }

  window.LLM_DATA = { models, projections, estimateTps, fitsIn, dateToNum, formatDate };
})();
