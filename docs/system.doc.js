module.exports = {
  tags: [
    {
      name: 'System',
      description: 'Health check and database connectivity',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'System health and database connectivity check',
        description: 'Checks if the service is running and PostgreSQL database connection is alive.',
        responses: {
          200: {
            description: 'System and database are operational',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
          500: {
            description: 'Database disconnected or query failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
  },
};
