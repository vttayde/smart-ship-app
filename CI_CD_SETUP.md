# CI/CD Pipeline Documentation

This document outlines the continuous integration and deployment pipeline for the Smart Ship application.

## Overview

The CI/CD pipeline is built using GitHub Actions and includes the following workflows:

### 1. Continuous Integration (CI) - `ci.yml`

**Triggers:** Push to main/develop, Pull requests to main/develop

**Jobs:**

- **Lint and Type Check**: ESLint, Prettier, TypeScript validation
- **Build**: Application build with artifact upload
- **Security Scan**: npm audit and dependency vulnerability checks

### 2. Production Deployment - `deploy.yml`

**Triggers:** Push to main branch, Manual dispatch

**Jobs:**

- **Deploy to Vercel**: Full quality checks + production deployment

**Required Secrets:**

- `VERCEL_TOKEN`: Vercel CLI authentication token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `NEXTAUTH_SECRET`: NextAuth.js secret for production
- `NEXTAUTH_URL`: Production URL for NextAuth.js

### 3. Staging Deployment - `deploy-staging.yml`

**Triggers:** Push to develop, Pull requests to main

**Jobs:**

- **Deploy Preview**: Creates preview deployments with PR comments

**Required Secrets:**

- Same as production plus:
- `NEXTAUTH_SECRET_STAGING`: NextAuth.js secret for staging
- `NEXTAUTH_URL_STAGING`: Staging URL for NextAuth.js

### 4. Test Suite - `test.yml`

**Triggers:** Push, Pull requests, Daily schedule

**Jobs:**

- **Unit Tests**: Jest/testing framework (ready for implementation)
- **Integration Tests**: Database integration tests with PostgreSQL
- **E2E Tests**: Playwright end-to-end tests (ready for implementation)

### 5. Code Quality - `code-quality.yml`

**Triggers:** Push, Pull requests

**Jobs:**

- **Code Quality Analysis**: ESLint reporting, bundle size checks
- **Dependency Review**: Security review of dependency changes
- **License Check**: Validate acceptable licenses

### 6. Dependency Updates - `update-deps.yml`

**Triggers:** Weekly schedule (Mondays), Manual dispatch

**Jobs:**

- **Update Dependencies**: Automated dependency updates with PR creation

### 7. Release - `release.yml`

**Triggers:** Version tags (v\*)

**Jobs:**

- **Create Release**: Automated GitHub releases with changelog

## Setup Instructions

### 1. GitHub Secrets Configuration

In your GitHub repository, go to Settings > Secrets and variables > Actions, and add:

```bash
# Vercel Deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Authentication
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET_STAGING=your_staging_secret
NEXTAUTH_URL_STAGING=https://your-staging-domain.vercel.app
```

### 2. Vercel Setup

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Get project info: `vercel project ls`

### 3. Environment Setup

Create environment files:

**.env.local (Development)**

```bash
NEXTAUTH_SECRET=your_dev_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Branch Protection Rules

Recommended branch protection for `main`:

- Require pull request reviews
- Require status checks to pass (CI workflow)
- Require up-to-date branches
- Include administrators

## Workflow Details

### Quality Gates

Before any deployment, the pipeline runs:

1. ESLint code quality checks
2. Prettier formatting validation
3. TypeScript type checking
4. Build verification
5. Security vulnerability scanning

### Deployment Strategy

- **Feature Development**: Push to feature branches
- **Staging**: Merge to `develop` for staging deployment
- **Production**: Merge to `main` for production deployment

### Testing Strategy (Ready for Implementation)

```bash
# Add these scripts to package.json when implementing tests
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:integration": "jest --config jest.integration.config.js",
"test:e2e": "playwright test"
```

### Monitoring and Alerts

The pipeline includes:

- Build failure notifications
- Security vulnerability alerts
- Dependency update notifications
- Performance regression detection

## Usage Examples

### Creating a Release

```bash
# Tag a release
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically:
# 1. Run all quality checks
# 2. Create GitHub release
# 3. Deploy to production
```

### Manual Deployment

```bash
# Trigger manual production deployment
# Go to Actions > Deploy to Production > Run workflow
```

### Updating Dependencies

```bash
# Manual dependency update
# Go to Actions > Update Dependencies > Run workflow
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check environment variables and secrets
2. **Vercel Deployment**: Verify VERCEL_TOKEN and project IDs
3. **Type Errors**: Run `npm run type-check` locally
4. **Lint Errors**: Run `npm run lint:fix` to auto-fix

### Debug Commands

```bash
# Local testing of CI steps
npm run lint
npm run type-check
npm run format:check
npm run build

# Vercel CLI debugging
vercel --debug
```

## Performance Monitoring

The pipeline tracks:

- Build times
- Bundle sizes
- Test coverage (when implemented)
- Deployment success rates

## Security

- All secrets are encrypted in GitHub
- Dependencies are scanned for vulnerabilities
- License compliance is enforced
- Branch protection prevents direct pushes to main

## Future Enhancements

- [ ] Implement Jest testing framework
- [ ] Add Playwright E2E tests
- [ ] Set up Codecov integration
- [ ] Add performance budgets
- [ ] Implement blue-green deployments
- [ ] Add staging environment promotion
- [ ] Set up monitoring and alerting
