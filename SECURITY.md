# Enhanced Security Implementation

This document outlines the comprehensive security measures implemented in the School Finder application.

## Security Middleware

### Overview
The application now includes a robust security middleware system located at `src/lib/middleware/api-security.ts` that provides:

- **Authentication & Authorization**: JWT token validation and role-based access control
- **Input Validation**: Zod schema validation for all API inputs
- **Rate Limiting**: Configurable rate limiting per endpoint
- **Security Headers**: Comprehensive security headers including CSP
- **Request Sanitization**: Input sanitization to prevent XSS and injection attacks
- **Error Handling**: Secure error responses that don't leak sensitive information

### Security Configurations

The middleware provides predefined security configurations:

#### Public Endpoints (`SecurityConfigs.public`)
- Rate limit: 100 requests/minute
- No authentication required
- Basic security headers
- Input sanitization enabled

#### User Endpoints (`SecurityConfigs.user`)
- Rate limit: 60 requests/minute
- JWT authentication required
- Enhanced security headers
- Input validation required

#### Admin Endpoints (`SecurityConfigs.admin`)
- Rate limit: 30 requests/minute
- Admin role required
- Maximum security headers
- Strict input validation

#### API Key Endpoints (`SecurityConfigs.apiKey`)
- Rate limit: 1000 requests/minute
- API key validation required
- Service-to-service communication

#### Search Endpoints (`SecurityConfigs.search`)
- Rate limit: 120 requests/minute
- Optimized for search operations
- Caching headers included

#### Write Operations (`SecurityConfigs.write`)
- Rate limit: 20 requests/minute
- Authentication required
- CSRF protection enabled
- Strict validation

## Validation Schemas

### Existing Schemas (`src/lib/validations/index.ts`)

The application includes comprehensive Zod validation schemas for:

- **User Management**: Registration, login, profile updates
- **School Operations**: Search, reviews, ratings
- **Admin Functions**: User management, system settings
- **Communication**: Contact forms, newsletters

### Schema Usage

All API endpoints should use appropriate validation schemas:

```typescript
import { createSecuredHandler, SecurityConfigs } from '@/lib/middleware/api-security';
import { userRegistrationSchema } from '@/lib/validations';

const handler = createSecuredHandler(
  async (request) => {
    // request.validatedData contains the validated input
    const userData = request.validatedData;
    // ... handle request
  },
  {
    ...SecurityConfigs.user,
    validateSchema: userRegistrationSchema
  }
);
```

## Security Headers

### Content Security Policy (CSP)
The application implements a strict CSP that:
- Prevents XSS attacks
- Controls resource loading
- Restricts inline scripts and styles
- Allows only trusted domains

### Additional Headers
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

## Rate Limiting

### Implementation
Rate limiting is implemented using a sliding window algorithm with Redis-like storage:

- **Per-IP tracking**: Each IP address has its own rate limit counter
- **Configurable windows**: Different time windows for different endpoints
- **Graceful degradation**: Returns 429 status with retry information

### Rate Limit Configurations
- **Public endpoints**: 100 requests/minute
- **User endpoints**: 60 requests/minute
- **Admin endpoints**: 30 requests/minute
- **Search endpoints**: 120 requests/minute
- **Write operations**: 20 requests/minute
- **API key endpoints**: 1000 requests/minute

## Authentication & Authorization

### JWT Token Validation
- Validates token signature and expiration
- Extracts user information and roles
- Handles token refresh scenarios

### Role-Based Access Control
- **User**: Basic authenticated user
- **Admin**: Administrative privileges
- **System**: Service-to-service communication

### API Key Authentication
- Validates API keys for external integrations
- Supports different permission levels
- Tracks API usage and quotas

## Input Sanitization

### XSS Prevention
- HTML entity encoding
- Script tag removal
- Event handler sanitization

### SQL Injection Prevention
- Parameterized queries (via Prisma ORM)
- Input validation and type checking
- Schema-based validation

## Error Handling

### Secure Error Responses
- No sensitive information in error messages
- Consistent error format
- Proper HTTP status codes
- Rate limit information in headers

### Logging
- Security events are logged
- Failed authentication attempts tracked
- Rate limit violations recorded

## Implementation Examples

### Securing an API Route

```typescript
import { createSecuredHandler, SecurityConfigs } from '@/lib/middleware/api-security';
import { schoolReviewSchema } from '@/lib/validations';

const handler = createSecuredHandler(
  async (request, context) => {
    // Access validated data
    const reviewData = request.validatedData;
    
    // Access authenticated user
    const user = request.user;
    
    // Handle the request
    return NextResponse.json({ success: true });
  },
  {
    ...SecurityConfigs.user,
    allowedMethods: ['POST'],
    validateSchema: schoolReviewSchema,
    rateLimitConfig: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      message: 'Too many review submissions'
    }
  }
);

export const POST = handler;
```

### Custom Security Configuration

```typescript
const customConfig = {
  requireAuth: true,
  allowedRoles: ['admin', 'moderator'],
  allowedMethods: ['GET', 'POST'],
  validateSchema: customSchema,
  rateLimitConfig: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
    message: 'Custom rate limit message'
  },
  securityHeaders: {
    'X-Custom-Header': 'value'
  }
};
```

## Security Best Practices

### For Developers

1. **Always use the security middleware** for API routes
2. **Validate all inputs** using Zod schemas
3. **Use appropriate security configurations** for different endpoint types
4. **Never expose sensitive information** in error messages
5. **Log security events** for monitoring and auditing
6. **Test security measures** regularly

### For Deployment

1. **Set secure environment variables** for JWT secrets and API keys
2. **Configure HTTPS** for all production traffic
3. **Monitor rate limits** and adjust as needed
4. **Review security logs** regularly
5. **Keep dependencies updated** for security patches

## Monitoring and Alerting

### Security Metrics
- Failed authentication attempts
- Rate limit violations
- Suspicious request patterns
- Error rates by endpoint

### Recommended Alerts
- High number of failed login attempts
- Rate limit threshold exceeded
- Unusual traffic patterns
- Security header violations

## Future Enhancements

### Planned Security Features
- **Two-factor authentication** for admin accounts
- **IP whitelisting** for admin endpoints
- **Advanced threat detection** using ML
- **Security audit logging** with detailed tracking
- **Automated security testing** in CI/CD pipeline

### Security Roadmap
1. Implement 2FA for admin users
2. Add IP-based access controls
3. Integrate with security monitoring tools
4. Implement automated security scanning
5. Add security compliance reporting