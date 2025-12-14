#!/bin/bash
set -e

echo "Building HRM System client..."
npm run build

echo "Build completed successfully"
echo "Output directory: dist/public"
ls -la dist/public/
