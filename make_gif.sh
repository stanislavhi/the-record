#!/bin/bash
set -e
SRC="/Users/stanislavhiznicenco/.gemini/antigravity/brain/b7b1c8bd-4ffc-4279-9daa-cecdf62315be/.tempmediaStorage"
OUT="/Users/stanislavhiznicenco/.gemini/antigravity/scratch/the-record/public/demo.gif"
TMP="/tmp/gif_frames_30"
SCALED="/tmp/gif_scaled"
PAL="/tmp/gif_palette"

rm -rf "$TMP" "$SCALED" "$PAL"
mkdir -p "$TMP" "$SCALED" "$PAL"

# Copy and rename frames in sorted order
i=1
for f in $(ls "$SRC"/media_b7b1c8bd*.png | sort); do
  cp "$f" "$TMP/$(printf 'f%04d' $i).png"
  ((i++))
done
COUNT=$(ls "$TMP"/f*.png | wc -l | tr -d ' ')
echo "Frames staged: $COUNT"

# Pre-scale all frames to exactly 900x446
j=1
for f in $(ls "$TMP"/f*.png | sort); do
  ffmpeg -y -i "$f" -vf "scale=900:446:flags=lanczos" "$SCALED/$(printf 'f%04d' $j).png" 2>/dev/null
  ((j++))
done
echo "Scaled: $(ls $SCALED/f*.png | wc -l | tr -d ' ') frames to 900x446"

# Generate palette from scaled frames
ffmpeg -y -framerate 30 -pattern_type glob -i "$SCALED/f*.png" \
  -vf "palettegen=max_colors=128:stats_mode=full" \
  -update 1 -frames:v 1 "$PAL/palette.png" 2>/dev/null
echo "Palette generated"

# Build 30fps GIF
ffmpeg -y -framerate 30 -pattern_type glob -i "$SCALED/f*.png" \
  -i "$PAL/palette.png" \
  -lavfi "[0:v][1:v] paletteuse=dither=bayer:bayer_scale=5" \
  -loop 0 "$OUT"

echo "Done: $(ls -lh $OUT)"
rm -rf "$TMP" "$SCALED" "$PAL"
