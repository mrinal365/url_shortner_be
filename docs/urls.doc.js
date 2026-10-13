module.exports = {
  tags: [
    {
      name: 'URLs',
      description: 'URL shortening, retrieval, redirection, and link management',
    },
  ],
  paths: {
    '/api/shorten': {
      post: {
        tags: ['URLs'],
        summary: 'Shorten a long URL',
        description: 'Creates a unique 7-character short URL code for any valid HTTP/HTTPS URL. Requires Bearer authentication.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ShortenRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Short URL created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UrlItem' },
              },
            },
          },
          400: {
            description: 'Missing originalUrl or invalid URL format',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - missing or invalid token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error or failed to generate unique code',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/urls/{code}': {
      get: {
        tags: ['URLs'],
        summary: 'Redirect to original URL or get URL details',
        description: 'Resolves a short code. In a browser or standard client, it issues an HTTP 302 redirect to the original destination URL and increments the click count. If `?redirect=false` or `Accept: application/json` is sent, it returns JSON with the destination URL and click statistics.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              example: '8hXq2PZ',
            },
            description: '7-character unique short code',
          },
          {
            name: 'redirect',
            in: 'query',
            required: false,
            schema: {
              type: 'boolean',
              default: true,
            },
            description: 'Set to false to return JSON metadata instead of 302 redirecting',
          },
        ],
        responses: {
          302: {
            description: 'Redirecting to original URL',
            headers: {
              Location: {
                description: 'Destination URL',
                schema: { type: 'string' },
              },
            },
          },
          200: {
            description: 'URL metadata returned as JSON',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UrlDetailResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Bearer token required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Short URL not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/urls': {
      get: {
        tags: ['URLs'],
        summary: 'Get all URLs created by current user',
        description: 'Returns a list of all shortened URLs created by the authenticated user, ordered with newest first.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of URLs retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UrlListResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized - Bearer token required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};
