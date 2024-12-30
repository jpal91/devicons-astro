#!/bin/bash

# Create new directory
rm -rf ./dist
mkdir ./dist

# Download latest devicons.json
curl -o ./dist/devicons.json https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/devicon.json

# Run tsc
tsc -p ./tsconfig.json --outDir dist

# Copy astro component
cp ./src/DevIcon.astro ./dist/

# Copy README
cp ../README.md ./dist/
