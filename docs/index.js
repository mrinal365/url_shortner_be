const fs = require('fs');
const path = require('path');

/**
 * Automatically loads and merges all modular documentation files (*.doc.js)
 * and schemas from the docs/ directory.
 * Clears require cache in development for instant reload without restarting.
 */
function loadModularDocs() {
  const mergedPaths = {};
  const tagsMap = new Map();

  const files = fs.readdirSync(__dirname);
  for (const file of files) {
    if (file.endsWith('.doc.js')) {
      const filePath = path.join(__dirname, file);

      // Invalidate require cache so edits reload instantly
      delete require.cache[require.resolve(filePath)];
      const doc = require(filePath);

      if (doc.paths) {
        Object.assign(mergedPaths, doc.paths);
      }
      if (Array.isArray(doc.tags)) {
        for (const tag of doc.tags) {
          tagsMap.set(tag.name, tag);
        }
      }
    }
  }

  // Reload schemas
  delete require.cache[require.resolve('./schemas')];
  const schemas = require('./schemas');

  return {
    paths: mergedPaths,
    tags: Array.from(tagsMap.values()),
    schemas,
  };
}

module.exports = {
  loadModularDocs,
};
