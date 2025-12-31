# API Documentation

This directory contains API documentation for the Next-Pelak CMS system.

## OpenAPI Specification

The API is documented using OpenAPI 3.0.3 specification in `openapi.yaml`.

### Viewing the Documentation

You can view the API documentation using various tools:

#### Swagger UI

1. Install Swagger UI:
   ```bash
   npm install -g swagger-ui-serve
   ```

2. Serve the documentation:
   ```bash
   swagger-ui-serve docs/api/openapi.yaml
   ```

3. Open http://localhost:3000 in your browser

#### Online Tools

- **Swagger Editor**: https://editor.swagger.io/
  - Copy the contents of `openapi.yaml` and paste into the editor

- **SwaggerHub**: https://swagger.io/tools/swaggerhub/
  - Upload the `openapi.yaml` file

#### VS Code Extension

Install the "OpenAPI (Swagger) Editor" extension in VS Code to view and edit the specification with syntax highlighting and validation.

### Generating Client SDKs

You can generate client SDKs from the OpenAPI specification using tools like:

- **OpenAPI Generator**: https://openapi-generator.tech/
  ```bash
   npx @openapitools/openapi-generator-cli generate \
     -i docs/api/openapi.yaml \
     -g typescript-axios \
     -o ./generated/client
   ```

- **Swagger Codegen**: https://swagger.io/tools/swagger-codegen/

### API Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/logout-all` - Logout from all devices
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/otp` - Send or verify OTP
- `POST /api/auth/verification-user` - Verify user account
- `POST /api/auth/verification-register` - Register new user
- `POST /api/auth/verification-password` - Set or reset password

#### Health & Monitoring

- `GET /api/health` - Health check
- `POST /api/logger` - Client-side logging

### Authentication

Most endpoints require authentication using Bearer tokens:

```http
Authorization: Bearer <access_token>
```

### CSRF Protection

State-changing requests (POST, PUT, DELETE, PATCH) require a CSRF token:

```http
X-CSRF-Token: <csrf_token>
```

### Rate Limiting

API requests are rate-limited. Check response headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

### Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "title": "Error Title",
  "message": "Error message"
}
```

### Success Responses

Success responses follow this format:

```json
{
  "success": true,
  "title": "Success Title",
  "message": "Success message",
  // ... additional data
}
```

### Updating the Documentation

When adding or modifying API endpoints:

1. Update `openapi.yaml` with the new endpoint definition
2. Include request/response schemas
3. Add examples
4. Update this README if needed
5. Test the documentation using Swagger UI

### Validation

Validate the OpenAPI specification:

```bash
# Using swagger-cli
npm install -g swagger-cli
swagger-cli validate docs/api/openapi.yaml

# Using online validator
# https://validator.swagger.io/
```

