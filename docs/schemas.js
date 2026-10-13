module.exports = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'b5a6c3f0-462f-48db-9238-d7b328a8d11c',
      },
      name: {
        type: 'string',
        example: 'Jane Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'jane.doe@example.com',
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        example: '2026-10-13T12:00:00.000Z',
      },
    },
  },
  AuthResponse: {
    type: 'object',
    properties: {
      user: {
        $ref: '#/components/schemas/User',
      },
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSJ9...',
      },
    },
  },
  SignupRequest: {
    type: 'object',
    required: ['name', 'email', 'password'],
    properties: {
      name: {
        type: 'string',
        example: 'Jane Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'jane.doe@example.com',
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'securepassword123',
      },
    },
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'jane.doe@example.com',
      },
      password: {
        type: 'string',
        format: 'password',
        example: 'securepassword123',
      },
    },
  },
  ShortenRequest: {
    type: 'object',
    required: ['originalUrl'],
    properties: {
      originalUrl: {
        type: 'string',
        format: 'uri',
        example: 'https://github.com/mrinal365/url_shortner_be',
        description: 'The full URL to shorten (with or without http/https)',
      },
    },
  },
  UrlItem: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'e7f12e87-6e47-4971-893c-c9d300bcf423',
      },
      user_id: {
        type: 'string',
        format: 'uuid',
        example: 'b5a6c3f0-462f-48db-9238-d7b328a8d11c',
      },
      original_url: {
        type: 'string',
        example: 'https://github.com/mrinal365/url_shortner_be',
      },
      short_code: {
        type: 'string',
        example: '8hXq2PZ',
      },
      clicks: {
        type: 'integer',
        example: 12,
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        example: '2026-10-13T12:00:00.000Z',
      },
      shortUrl: {
        type: 'string',
        format: 'uri',
        example: 'http://localhost:5000/api/urls/8hXq2PZ',
      },
    },
  },
  UrlListResponse: {
    type: 'object',
    properties: {
      urls: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/UrlItem',
        },
      },
    },
  },
  UrlDetailResponse: {
    type: 'object',
    properties: {
      originalUrl: {
        type: 'string',
        example: 'https://github.com/mrinal365/url_shortner_be',
      },
      shortCode: {
        type: 'string',
        example: '8hXq2PZ',
      },
      clicks: {
        type: 'integer',
        example: 12,
      },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Error message description',
      },
    },
  },
  HealthResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        example: 'OK',
      },
      database: {
        type: 'string',
        example: 'connected',
      },
      error: {
        type: 'string',
        nullable: true,
      },
    },
  },
};
