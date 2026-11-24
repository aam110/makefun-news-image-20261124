# The World in One Page — Tuesday 24 November 2026

[![make.fun](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/aam110/makefun-news-image-20261124/rank.svg)](https://make.fun/bounty/news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/aam110/makefun-news-image-20261124/reward.svg)](https://make.fun/bounty/news-image-20261124)

One image that sums up the world's news of **Tuesday 24 November 2026** — 20 verified
stories across 5 regions, on a single 1024×1024 front page.

## The day in one glance

- **Tokyo roars back** — Nikkei futures point to a near-3% reopen (+2.97%, CME last print 58,110)
- **The youngest title match in chess history begins** — Gukesh, 20, defends against Sindarov, 20, in Geneva
- **"Pervert glasses" is Australia's Word of the Year** — Macquarie Dictionary's pick for camera smart glasses
- Plus 10 more stories and 7 one-liners, a 6-stat key-numbers strip, a world map with
  numbered pins, and a DATE CHECK box listing the big stories deliberately left out
  because they broke on another day (Nvidia +31%, the Banten fire, COP31, and more).

Every story was first reported or occurred on 24 November 2026, with its source labelled
(OFFICIAL / CONFIRMED / REPORTED) on the page. Two scheduled events — the CAS ruling on
Senegal's AFCON title appeal and Jannik Sinner's knee surgery — are shown as due today,
not as decided results.

## Run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Writes one deterministic 1024×1024 PNG (`out/entry.png`, under 1 MiB). Node 22,
standard library only, no network. Two runs produce byte-identical output.

## How it is drawn

`main.ts` draws the whole page itself — its own PNG encoder and its own text engine —
using real serif outlines embedded in `glyphs.ts`, extracted at build time from OFL
system fonts (Liberation Serif, Noto Serif Display Black, Noto Sans Bold) with fontTools.
No hand-drawn letterforms, no images, no network.

## Bounty

Entry for the [make.fun bounty "Sum up 24 November's world news in one image"](https://make.fun/bounty/news-image-20261124).

## License

MIT — see [LICENSE](LICENSE).
