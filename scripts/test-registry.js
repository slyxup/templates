#!/usr/bin/env node
/**
 * Test loading the local registry with the schema
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '../..');
const LOCAL_REGISTRY_PATH = path.join(PROJECT_ROOT, 'registry/local-registry.json');

async function testRegistry() {
  try {
    console.log('Loading registry from:', LOCAL_REGISTRY_PATH);
    const content = fs.readFileSync(LOCAL_REGISTRY_PATH, 'utf8');
    const data = JSON.parse(content);
    
    console.log('\nRegistry version:', data.version);
    console.log('Templates:', Object.keys(data.templates).length);
    console.log('Features:', Object.keys(data.features).length);
    
    // Check first feature
    const firstFeature = Object.values(data.features)[0][0];
    console.log('\nFirst feature:');
    console.log('  Name:', firstFeature.name);
    console.log('  Download URL:', firstFeature.downloadUrl);
    console.log('  SHA256:', firstFeature.sha256);
    console.log('  SHA256 length:', firstFeature.sha256.length);
    
    console.log('\n✓ Registry loaded successfully');
  } catch (error) {
    console.error('✗ Failed to load registry:', error.message);
    console.error(error);
  }
}

testRegistry();
