# ORRIVANE

[![make.fun · the-poster-for-a-place-that-i-2-20261121-0539](https://make.fun/badge/the-poster-for-a-place-that-i-2-20261121-0539.svg)](https://make.fun/bounty/the-poster-for-a-place-that-i-2-20261121-0539?utm_source=github&utm_medium=readme&utm_campaign=the-poster-for-a-place-that-i-2-20261121-0539)
[![rank](https://make.fun/badge/the-poster-for-a-place-that-i-2-20261121-0539/Gillangzx/the-poster-for-a-place-that-i-2-20261121-0539-v4/rank.svg)](https://make.fun/bounty/the-poster-for-a-place-that-i-2-20261121-0539/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=the-poster-for-a-place-that-i-2-20261121-0539)
[![reward](https://make.fun/badge/the-poster-for-a-place-that-i-2-20261121-0539/Gillangzx/the-poster-for-a-place-that-i-2-20261121-0539-v4/reward.svg)](https://make.fun/bounty/the-poster-for-a-place-that-i-2-20261121-0539?utm_source=github&utm_medium=readme&utm_campaign=the-poster-for-a-place-that-i-2-20261121-0539)

A travel poster for a place that isn't there. ORRIVANE is a sunlit town built around one colossal intact waterwheel-aqueduct: the great wooden wheel turns in the sunlight, throwing a bright turquoise cascade into the basin below, where children play in the spray under striped parasols. One landmark, warm light, water you can almost hear.

## How it runs

`render.py` (Python 3, Pillow) resizes the painterly `base.png` to 1024x1024, adds a soft vignette and a light film grain, and saves `entry.png` (JPEG quality 92 if the PNG runs over 1 MiB). `main.ts` (Node 22, standard library only) copies the committed `entry.png` into `$MAKEFUN_OUTPUT_DIR` (falling back to `/output`), after verifying it is a PNG or JPEG, at most 1 MiB, and at most 1024x1024 — and fails loudly if any guard fails.
