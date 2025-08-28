# Linting and Formatting Setup

This project uses ESLint and Prettier for code quality and consistent formatting.

## Tools Configured

### ESLint

- **Configuration**: `eslint.config.mjs`
- **Rules**: Next.js TypeScript rules + custom quality rules
- **Purpose**: Code quality, bug prevention, and consistency

### Prettier

- **Configuration**: `.prettierrc`
- **Purpose**: Automatic code formatting
- **Settings**: 100 character line width, single quotes, trailing commas

### Lint-staged

- **Configuration**: `package.json` under `lint-staged`
- **Purpose**: Run linting and formatting on staged files before commit

## Available Scripts

```bash
# Lint all files
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Format all files with Prettier
npm run format

# Check if files are properly formatted
npm run format:check

# Type check without building
npm run type-check
```

## VS Code Integration

The `.vscode/settings.json` file is configured to:

- Auto-format on save
- Run ESLint fixes on save
- Organize imports automatically
- Use proper formatters for each file type

## Recommended Extensions

Install these VS Code extensions for the best experience:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitHub Copilot

## Pre-commit Hooks

The project uses lint-staged to automatically:

1. Run ESLint with auto-fix on TypeScript/JavaScript files
2. Format all files with Prettier
3. Only commit if no errors remain

## Rules Overview

### ESLint Rules

- No unused variables (except those prefixed with `_`)
- Warn on explicit `any` types
- Prefer `const` over `let`
- Console statements allowed for `warn` and `error`
- React: self-closing components, no unnecessary braces
- TypeScript: proper variable declarations

### Prettier Rules

- Single quotes for strings
- Semicolons required
- 100 character line width
- 2 space indentation
- Trailing commas where valid
- Arrow function parentheses only when needed

## Running Quality Checks

Before committing or pushing code:

```bash
# Check everything
npm run type-check && npm run lint && npm run format:check

# Fix common issues
npm run lint:fix && npm run format
```

## Integration with Development Workflow

1. **During Development**: VS Code auto-formats and shows lint errors
2. **Before Commit**: lint-staged runs automatically
3. **In CI/CD**: Can run `npm run lint` and `npm run format:check`
4. **Code Review**: Consistent formatting reduces noise in diffs
