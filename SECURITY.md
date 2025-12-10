# Security Policy

## Reporting Security Vulnerabilities

We take the security of PharmaNet seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do not open a public issue.**

Instead, send your report privately to:

- **Email**: security@pharmanet.com
- **PGP Key**: Available upon request

Include the following information in your report:

1. **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
2. **Affected versions** of the software
3. **Steps to reproduce** the vulnerability
4. **Potential impact** if exploited
5. **Proof of concept** or exploit code (if available)
6. **Suggested fix** (optional)

### Response Timeline

- **Initial response**: Within 24 hours
- **Detailed assessment**: Within 3 business days
- **Resolution timeline**: Depends on severity

## Security Measures

### Implemented Security Features

#### Authentication & Authorization

- **Secure Authentication**: JWT-based authentication via Supabase Auth
- **Role-Based Access Control**: Three distinct roles (admin, vendor, consumer)
- **Password Security**: Enforced strong password requirements
- **Multi-Factor Authentication**: Optional 2FA support
- **Session Management**: Secure session handling with automatic timeout

#### Data Protection

- **Encryption at Rest**: All data encrypted in PostgreSQL
- **Encryption in Transit**: TLS 1.3 for all communications
- **API Security**: Row Level Security (RLS) on all database tables
- **Input Validation**: Comprehensive input sanitization and validation
- **SQL Injection Prevention**: Parameterized queries throughout

#### Application Security

- **XSS Protection**: Content Security Policy (CSP) headers
- **CSRF Protection**: Anti-CSRF tokens for state-changing operations
- **Secure Headers**: Security headers including HSTS, X-Frame-Options
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Upload Security**: Restrict file types, sizes, and scan for malware

#### Infrastructure Security

- **CDN Protection**: Cloudflare protection against DDoS attacks
- **Environment Variables**: All secrets stored securely in environment variables
- **Access Control**: Minimal access principle for service accounts
- **Regular Updates**: Dependabot for automated dependency updates
- **Monitoring**: Security event logging and monitoring

### Compliance

- **GDPR Compliant**: User data protection rights implemented
- **PDPA Compliant**: Malaysian Personal Data Protection Act compliance
- **PCI DSS**: Secure handling of payment information via Stripe
- **SST Compliance**: Proper tax calculation and reporting for Malaysia

## Security Best Practices for Contributors

### Development Guidelines

1. **Never commit secrets**
   ```bash
   # Bad
   const API_KEY = 'sk_live_...';

   # Good
   const API_KEY = process.env.STRIPE_SECRET_KEY;
   ```

2. **Validate all inputs**
   ```typescript
   // Always validate user input
   const schema = z.object({
     email: z.string().email(),
     quantity: z.number().min(1).max(100)
   });
   ```

3. **Use secure defaults**
   ```typescript
   // Deny by default
   const isPublic = user.role === 'admin' ? false : true;
   ```

4. **Sanitize user-generated content**
   ```typescript
   // Sanitize HTML content
   const cleanHTML = DOMPurify.sanitize(userInput);
   ```

### Database Security

1. **Enable RLS on all tables**
   ```sql
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   ```

2. **Use least privilege policies**
   ```sql
   CREATE POLICY "Users can view own data"
     ON sensitive_data
     FOR SELECT USING (auth.uid() = user_id);
   ```

3. **Never expose service role key in client code**

### API Security

1. **Validate permissions on every request**
   ```typescript
   const canEdit = await checkPermission(user.id, 'edit', resource);
   if (!canEdit) {
     throw new AuthorizationError();
   }
   ```

2. **Use prepared statements**
   ```typescript
   // Good
   const { data } = await supabase
     .from('products')
     .select('*')
     .eq('id', productId);

   // Bad - vulnerable to SQL injection
   const query = `SELECT * FROM products WHERE id = ${productId}`;
   ```

## Supported Versions

| Version | Supported          | Security Updates |
|---------|--------------------|------------------|
| 1.x.x   | :white_check_mark: | Yes              |
| < 1.0   | :x:                | No               |

## Vulnerability Disclosure Program

### Scope

This program applies to:

- The PharmaNet web application
- Official mobile applications
- API endpoints
- Infrastructure components

### Out of Scope

The following are explicitly out of scope:

- Third-party services we use
- Social engineering attacks
- Denial of service attacks
- Physical attacks on infrastructure

### Rewards

We offer rewards based on severity:

| Severity | Reward Range |
|----------|--------------|
| Critical | $500 - $2000 |
| High     | $200 - $500  |
| Medium   | $100 - $200  |
| Low      | $50 - $100   |

Rewards are paid at our discretion and may include:

- Cash payment via PayPal or Wise
- Store credit
- Recognition in our Hall of Fame
- SWAG merchandise

### Hall of Fame

We thank the following security researchers for their contributions:

- [Researcher Name] - XSS vulnerability discovery
- [Researcher Name] - SQL injection prevention
- [Researcher Name] - Authentication bypass report

## Security Updates

### How We Communicate

1. **Critical Updates**: Immediate email notification
2. **High Priority**: Notification within 24 hours
3. **Medium/Low**: Included in monthly security newsletter
4. **Patch Notes**: Available on GitHub releases

### Update Process

1. **Discovery**: Vulnerability reported or discovered
2. **Assessment**: Security team evaluates impact
3. **Development**: Patch developed and tested
4. **Deployment**: Patch deployed to production
5. **Disclosure**: Public disclosure (if applicable)

## Security Configuration

### Environment Variables

```bash
# Security-related environment variables
VITE_ENABLE_CSP=true
VITE_ENABLE_HSTS=true
VITE_RATE_LIMIT_REQUESTS=100
VITE_RATE_LIMIT_WINDOW=900000
VITE_SESSION_TIMEOUT=3600000
```

### Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Guide](https://supabase.com/docs/guides/security)
- [React Security Best Practices](https://snyk.io/blog/10-react-security-best-practices/)
- [TypeScript Security](https://microsoft.github.io/TypeScript/security/)

## Contact

For security-related questions:

- **Email**: security@pharmanet.com
- **PGP Fingerprint**: Available on request

Thank you for helping keep PharmaNet secure! 🛡️