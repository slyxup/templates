#!/bin/bash

# Script to package React template

echo "📦 Packaging React template v1.0.0..."

cd react/v1.0.0

# Create tar.gz archive
tar -czf react.tar.gz \
  --exclude='*.tar.gz' \
  --exclude='node_modules' \
  --exclude='dist' \
  .

echo "✅ Created react.tar.gz"

# Generate SHA-256 hash
if command -v sha256sum &> /dev/null; then
  HASH=$(sha256sum react.tar.gz | awk '{print $1}')
elif command -v shasum &> /dev/null; then
  HASH=$(shasum -a 256 react.tar.gz | awk '{print $1}')
else
  echo "❌ sha256sum or shasum not found"
  exit 1
fi

echo "✅ SHA-256: $HASH"

# Get file size
SIZE=$(stat -f%z react.tar.gz 2>/dev/null || stat -c%s react.tar.gz 2>/dev/null)
echo "✅ Size: $SIZE bytes"

# Test extraction
echo ""
echo "🧪 Testing extraction..."
mkdir -p /tmp/slyxup-test-react
tar -xzf react.tar.gz -C /tmp/slyxup-test-react

if [ -f "/tmp/slyxup-test-react/package.json" ]; then
  echo "✅ Extraction successful!"
  rm -rf /tmp/slyxup-test-react
else
  echo "❌ Extraction failed!"
  rm -rf /tmp/slyxup-test-react
  exit 1
fi

echo ""
echo "📋 Update registry.json with:"
echo "{"
echo "  \"downloadUrl\": \"https://cdn.slyxup.online/templates/react.tar.gz\","
echo "  \"sha256\": \"$HASH\","
echo "  \"size\": $SIZE"
echo "}"

echo ""
echo "✅ Template packaged successfully!"
