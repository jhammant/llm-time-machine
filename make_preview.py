#!/usr/bin/env python3
"""
Generates the social-share preview image (Open Graph / Twitter card)
for https://jhammant.github.io/llm-time-machine/

Output: images/og.png (1200x630, standard OG aspect)
"""
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

OUT = Path(__file__).parent / "images" / "og.png"

BG = "#0d1117"
BG_END = "#1a0912"
ACCENT = "#d81b60"
WHITE = "#ffffff"
FG_DIM = "#d0d4da"
STAT_BG = "#ffffff10"
STAT_BORDER = "#ffffff18"

def main():
    fig, ax = plt.subplots(figsize=(12, 6.3), dpi=100)
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis("off")

    # Diagonal accent gradient via a pink-to-dark patch on the right
    for i in range(50):
        alpha = 0.018 * (50 - i) / 50
        ax.add_patch(patches.Rectangle((100 - i * 2, 0), 2, 100,
                                       color=ACCENT, alpha=alpha, zorder=0))

    # Bottom border — the site's accent line
    ax.add_patch(patches.Rectangle((0, 0), 100, 1.2, color=ACCENT, zorder=10))

    # Eyebrow
    ax.text(5, 86, "T H E   L L M   T I M E   M A C H I N E",
            fontsize=12, color=ACCENT, fontweight="bold",
            family="sans-serif")

    # Title — two lines
    ax.text(5, 76, "The hardware stayed still.",
            fontsize=38, color=WHITE, fontweight="bold",
            family="sans-serif")
    ax.text(5, 65, "The models got dramatically",
            fontsize=38, color=WHITE, fontweight="bold",
            family="sans-serif")
    ax.text(5, 54, "smarter.",
            fontsize=38, color=ACCENT, fontweight="bold",
            family="sans-serif")

    # Subtitle
    ax.text(5, 44,
            "Open-weight LLMs got ~4× smarter on fixed consumer hardware",
            fontsize=14, color=FG_DIM, family="sans-serif")
    ax.text(5, 39,
            "between 2023 and 2026. Here's the data nobody's tracking.",
            fontsize=14, color=FG_DIM, family="sans-serif")

    # Three stat blocks across the bottom
    stats = [
        ("72B → 27B", "Smaller", "Params for best-in-class"),
        ("71 → 86",   "Smarter", "MMLU-Pro, same hardware"),
        ("8 → 22",    "Faster",  "Tokens/sec @ Q4"),
    ]
    card_w = 28
    card_h = 22
    card_gap = 3
    card_y = 8
    start_x = 5
    for i, (big, label, small) in enumerate(stats):
        x0 = start_x + i * (card_w + card_gap)
        box = FancyBboxPatch(
            (x0, card_y), card_w, card_h,
            boxstyle="round,pad=0,rounding_size=1.2",
            linewidth=1, edgecolor=STAT_BORDER, facecolor=STAT_BG,
            zorder=3,
        )
        ax.add_patch(box)
        # Big number
        ax.text(x0 + card_w / 2, card_y + card_h - 7, big,
                fontsize=22, color=ACCENT, fontweight="bold",
                ha="center", family="monospace")
        # Label
        ax.text(x0 + card_w / 2, card_y + card_h - 13.5, label,
                fontsize=12, color=WHITE, fontweight="600",
                ha="center", family="sans-serif")
        # Sublabel
        ax.text(x0 + card_w / 2, card_y + 4, small,
                fontsize=9, color=FG_DIM,
                ha="center", family="sans-serif")

    # Domain / credit in the top-right corner
    ax.text(95, 92, "jhammant.github.io/llm-time-machine",
            fontsize=9.5, color="#8b95a1", ha="right",
            family="monospace")

    plt.subplots_adjust(left=0, right=1, top=1, bottom=0)
    plt.savefig(OUT, dpi=100, facecolor=BG,
                bbox_inches="tight", pad_inches=0)
    print(f"Saved {OUT}")


if __name__ == "__main__":
    main()
