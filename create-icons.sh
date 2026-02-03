#!/bin/bash

# Create simple PNG icons using ImageMagick
# This creates basic app icons to replace Expo defaults

# Create a simple 1024x1024 PNG icon
convert -size 1024x1024 xc:"#4F46E5" \
  -fill white \
  -draw "rectangle 312 412 712 612" \
  -fill "#6366F1" \
  -draw "rectangle 312 412 712 472" \
  -fill white \
  -draw "circle 512 512 487 537" \
  -fill "#4F46E5" \
  -font Arial -pointsize 48 -gravity center \
  -text 0,0 "\$" \
  assets/images/icon.png

# Copy for adaptive icon
cp assets/images/icon.png assets/images/adaptive-icon.png

# Create favicon
convert assets/images/icon.png -resize 32x32 assets/images/favicon.png

echo "Icons created successfully!"
echo "Files created:"
echo "- assets/images/icon.png (1024x1024)"
echo "- assets/images/adaptive-icon.png (1024x1024)" 
echo "- assets/images/favicon.png (32x32)"
