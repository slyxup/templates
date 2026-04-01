#!/usr/bin/env node
/**
 * Test Zod schema parsing with the local registry
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { RegistrySchema } from '../cli/dist/types/schemas.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const LOCAL_REGISTRY_PATH = join(PROJECT_ROOT, 'registry/local-registry.json');

async function testSchema() {
  try {
    console.log('Loading registry from:', LOCAL_REGISTRY_PATH);
    const content = readFileSync(LOCAL_REGISTRY_PATH, 'utf8');
    const data = JSON.parse(content);
    
    console.log('\nParsing with Zod schema...');
    const registry = RegistrySchema.parse(data);
    
    console.log('\n✓ Registry parsed successfully');
    console.log('Version:', registry.version);
    console.log('Templates:', Object.keys(registry.templates).length);
    console.log('Features:', Object.keys(registry.features).length);
  } catch (error) {
    console.error('\n✗ Failed to parse registry:');
    console.error(error);
    if (error.errors) {
      console.error('\nValidation errors:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
  }
}

testSchema();
