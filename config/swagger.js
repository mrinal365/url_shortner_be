const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { loadModularDocs } = require('../docs');

// Known route file patterns and their mount prefixes in index.js
const ROUTE_FILE_MAPPINGS = [
  { pattern: /auth\.routes\.js$/, prefix: '/api/auth', tag: 'Auth' },
  { pattern: /urls?\.routes\.js$/, prefix: '/api', tag: 'URLs' },
  { pattern: /index\.js$/, prefix: '', tag: 'System' },
];

const baseDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'URL Shortener API',
    version: '1.0.0',
    description: `
Interactive API documentation for the **URL Shortener** backend service.

### 🚀 Architecture:
- **Clean & Modular**: Route files stay minimal and clean; API documentation is modularized in the \`docs/\` directory.
- **Auto-Discovery**: Any new route added to \`routes/\` is automatically discovered and testable here.
- **Authentication**: JWT-based Bearer token authentication.

### 🔑 How to test protected endpoints:
1. Execute \`POST /api/auth/signup\` or \`POST /api/auth/login\` via **Try it out**.
2. Copy the \`token\` from the response.
3. Click the **Authorize 🔓** button (top right), enter \`Bearer <token>\` or just \`<token>\`, and click **Authorize**.
4. Test any protected endpoint right from your browser!
    `,
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5000}`,
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token (e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")',
      },
    },
    schemas: {},
  },
  tags: [],
  paths: {},
};

/**
 * Scans route files in routes/ to auto-detect any routes added by developers
 * that might not have been documented yet.
 */
function autoDiscoverRoutes(pathsObj) {
  try {
    const routesDir = path.join(__dirname, '..', 'routes');
    const filesToScan = [];

    if (fs.existsSync(routesDir)) {
      const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
      filesToScan.push(...routeFiles.map(f => path.join(routesDir, f)));
    }

    const indexFile = path.join(__dirname, '..', 'index.js');
    if (fs.existsSync(indexFile)) {
      filesToScan.push(indexFile);
    }

    for (const filePath of filesToScan) {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);

      // Determine mount prefix
      const mapping = ROUTE_FILE_MAPPINGS.find(m => m.pattern.test(filename));
      const prefix = mapping ? mapping.prefix : '/api';
      const defaultTag = mapping ? mapping.tag : 'Auto-Discovered';

      // Scan for route registrations
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip commented lines
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          continue;
        }

        const match = trimmed.match(/(?:router|app)\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/);
        if (match) {
          const method = match[1].toLowerCase();
          const routePath = match[2];

          // Convert Express :param to OpenAPI {param}
          const swaggerPathSegment = routePath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
          const fullPath = (prefix + (swaggerPathSegment.startsWith('/') ? swaggerPathSegment : '/' + swaggerPathSegment)).replace(/\/+/g, '/');

          // If not already documented, auto-generate placeholder endpoint
          if (!pathsObj[fullPath] || !pathsObj[fullPath][method]) {
            if (!pathsObj[fullPath]) {
              pathsObj[fullPath] = {};
            }

            const paramNames = (routePath.match(/:([a-zA-Z0-9_]+)/g) || []).map(p => p.slice(1));
            const requiresAuth = trimmed.includes('authMiddleware');

            pathsObj[fullPath][method] = {
              tags: [defaultTag],
              summary: `${method.toUpperCase()} ${fullPath} (Auto-Discovered)`,
              description: `⚡ Automatically discovered from \`${filename}\`. Document modularly in \`docs/${filename.replace('.routes.js', '.doc.js')}\` to customize.`,
              parameters: paramNames.map(name => ({
                name,
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: `Parameter ${name}`,
              })),
              security: requiresAuth ? [{ bearerAuth: [] }] : [],
              responses: {
                200: {
                  description: 'Successful response',
                },
                401: requiresAuth ? {
                  description: 'Unauthorized - Bearer token required',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/ErrorResponse' },
                    },
                  },
                } : undefined,
              },
            };

            if (['post', 'put', 'patch'].includes(method)) {
              pathsObj[fullPath][method].requestBody = {
                description: 'Request payload',
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      example: {},
                    },
                  },
                },
              };
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[Swagger] Error during route auto-discovery:', err.message);
  }

  return pathsObj;
}

/**
 * Generates the full OpenAPI specification by combining:
 * 1. Modular documentation from docs/
 * 2. Optional JSDoc comments
 * 3. Route auto-discovery fallback
 */
function getSwaggerSpec() {
  const modularDocs = loadModularDocs();

  // Deep clone base definition
  const spec = JSON.parse(JSON.stringify(baseDefinition));

  // Merge schemas
  spec.components.schemas = Object.assign({}, modularDocs.schemas);

  // Merge tags
  const tagsMap = new Map();
  for (const t of modularDocs.tags) {
    tagsMap.set(t.name, t);
  }
  if (!tagsMap.has('Auto-Discovered')) {
    tagsMap.set('Auto-Discovered', {
      name: 'Auto-Discovered',
      description: 'Endpoints automatically detected in code without explicit documentation',
    });
  }
  spec.tags = Array.from(tagsMap.values());

  // Merge modular paths
  spec.paths = Object.assign({}, modularDocs.paths);

  // Auto-discover any new/undocumented routes
  autoDiscoverRoutes(spec.paths);

  return spec;
}

/**
 * Custom styling for Swagger UI
 */
const customCss = `
  .swagger-ui .topbar {
    background: #0f172a;
    border-bottom: 2px solid #3b82f6;
    padding: 10px 0;
  }
  .swagger-ui .topbar-wrapper {
    align-items: center;
  }
  .swagger-ui .topbar-wrapper .link {
    color: #ffffff;
    font-weight: 700;
    font-size: 1.15rem;
  }
  .swagger-ui .info {
    margin: 25px 0 20px 0;
  }
  .swagger-ui .info .title {
    color: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-weight: 800;
  }
  .swagger-ui .scheme-container {
    background: #f8fafc;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    padding: 15px 0;
    margin-bottom: 20px;
    border-radius: 8px;
  }
  .swagger-ui .btn.authorize {
    background-color: #2563eb;
    color: white;
    border-color: #2563eb;
    border-radius: 6px;
    font-weight: 600;
  }
  .swagger-ui .btn.authorize svg {
    fill: white;
  }
  .swagger-ui .opblock.opblock-post {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.04);
  }
  .swagger-ui .opblock.opblock-get {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.04);
  }
  .swagger-ui .opblock-tag {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 8px;
    margin-top: 24px;
  }
`;

/**
 * Mounts Swagger UI and JSON spec endpoints on the Express application.
 */
function setupSwagger(app) {
  // Raw OpenAPI specification JSON (dynamically reloads modular files)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(getSwaggerSpec());
  });

  // Friendly redirects
  app.get(['/docs', '/swagger'], (req, res) => {
    res.redirect('/api-docs');
  });

  // Swagger UI with persistent authorization
  const uiOptions = {
    customCss,
    customSiteTitle: 'URL Shortener API Docs',
    swaggerOptions: {
      url: '/api-docs.json',
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
    },
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, uiOptions));
}

module.exports = {
  setupSwagger,
  getSwaggerSpec,
};
