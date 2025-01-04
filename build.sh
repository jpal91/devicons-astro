#!/bin/bash

pnpm changeset
pnpm changeset version

git add .
git commit -m "chore: update version"

cd package

# Create new directory
rm -rf ./dist
mkdir ./dist

# Download latest devicons.json
curl -o ./dist/devicons.json https://raw.githubusercontent.com/devicons/devicon/refs/heads/master/devicon.json

# Run tsc
tsc -p ./tsconfig.json --outDir dist

# Copy astro component
cp ./src/DevIcon.astro ./dist/

cd ../

pnpm changeset publish
git push --follow-tags
