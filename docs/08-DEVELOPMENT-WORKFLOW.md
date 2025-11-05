# Development Workflow

## Git Workflow

### Branch Strategy

Cultivo follows a **feature branch workflow** with protection on the main branch.

```
main (protected)
  ├── feature/add-worker-search
  ├── feature/improve-map-ui
  ├── bugfix/fix-auth-token
  └── hotfix/critical-security-patch
```

### Branch Naming Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/add-weather-alerts` |
| `bugfix/` | Bug fixes | `bugfix/fix-worker-deletion` |
| `hotfix/` | Critical production fixes | `hotfix/security-patch` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `docs/` | Documentation updates | `docs/update-api-guide` |
| `refactor/` | Code refactoring | `refactor/simplify-auth-logic` |

### Workflow Steps

#### 1. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or in one command
git checkout -b feature/add-worker-filters
```

#### 2. Make Changes

```bash
# Check status
git status

# Add files
git add .
# Or add specific files
git add frontend/src/components/worker/WorkerList.tsx

# Commit with descriptive message
git commit -m "feat: add status filter to worker list"
```

#### 3. Keep Branch Updated

```bash
# Fetch latest changes from main
git fetch origin main

# Rebase your branch on top of main
git rebase origin/main

# If conflicts occur:
# 1. Resolve conflicts in files
# 2. git add <resolved-files>
# 3. git rebase --continue
```

#### 4. Push to Remote

```bash
# First push (set upstream)
git push -u origin feature/your-feature-name

# Subsequent pushes
git push
```

#### 5. Create Pull Request

1. Navigate to GitHub repository
2. Click "Pull requests" → "New pull request"
3. Select your branch
4. Fill in PR template:
   - **Title**: Clear, concise description
   - **Description**: What changed and why
   - **Testing**: How to test the changes
   - **Screenshots**: (if UI changes)
5. Request reviewers
6. Link related issues (e.g., "Closes #123")

#### 6. Code Review Process

**Author Responsibilities:**
- Respond to comments
- Make requested changes
- Push updates to same branch
- Mark conversations as resolved

**Reviewer Responsibilities:**
- Review code for:
  - Functionality correctness
  - Code quality and readability
  - Performance implications
  - Security concerns
  - Test coverage
- Provide constructive feedback
- Approve or request changes

#### 7. Merge to Main

After approval:

```bash
# Squash and merge (preferred for feature branches)
# - Creates single commit on main
# - Keeps history clean

# Merge commit (use for large features)
# - Preserves all commits
# - Useful for tracking feature history

# Rebase and merge (use for small changes)
# - Linear history
# - No merge commit
```

#### 8. Cleanup

```bash
# Delete local branch
git branch -d feature/your-feature-name

# Delete remote branch (if not auto-deleted)
git push origin --delete feature/your-feature-name
```

---

## Commit Message Conventions

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Usage | Example |
|------|-------|---------|
| `feat` | New feature | `feat: add worker search functionality` |
| `fix` | Bug fix | `fix: resolve auth token expiration issue` |
| `docs` | Documentation | `docs: update API endpoint documentation` |
| `style` | Formatting, styling | `style: format code with Prettier` |
| `refactor` | Code refactoring | `refactor: simplify farm service logic` |
| `test` | Add/update tests | `test: add unit tests for worker controller` |
| `chore` | Maintenance | `chore: update dependencies` |
| `perf` | Performance improvement | `perf: optimize database queries` |
| `build` | Build system changes | `build: update Docker configuration` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |

### Examples

**Good Commit Messages:**

```bash
feat(worker): add status filter to worker list

- Added dropdown to filter workers by active/inactive status
- Updated workerService to support status query parameter
- Updated WorkerList component with filter UI

Closes #45

---

fix(auth): prevent token expiration on page reload

Fixed issue where JWT token was not being refreshed on
page reload, causing users to be logged out unexpectedly.

Solution: Check token expiration in App.tsx useEffect and
refresh if within 24 hours of expiration.

Fixes #67

---

docs: add database schema documentation

Added comprehensive documentation for all database models
including field descriptions, relationships, and indexes.
```

**Bad Commit Messages:**

```bash
# Too vague
fix: bug fix

# Not descriptive
update files

# Multiple changes, should be separate commits
feat: add worker search, fix map bug, update styles
```

### Commit Best Practices

1. **Atomic Commits**: Each commit should represent one logical change
2. **Present Tense**: Use "add" not "added", "fix" not "fixed"
3. **Imperative Mood**: "Change" not "Changes" or "Changed"
4. **50-Character Subject**: Keep subject line under 50 characters
5. **Body for Context**: Use body to explain "why" not "what"
6. **Reference Issues**: Link to GitHub issues when applicable

---

## Code Review Guidelines

### What to Review

#### 1. Functionality

- [ ] Does the code work as intended?
- [ ] Are edge cases handled?
- [ ] Is error handling implemented?
- [ ] Are there any potential bugs?

#### 2. Code Quality

- [ ] Is the code readable and maintainable?
- [ ] Are functions/components appropriately sized?
- [ ] Are variable/function names descriptive?
- [ ] Is there duplicate code that could be extracted?

#### 3. TypeScript & Types

- [ ] Are types properly defined?
- [ ] Are there any `any` types that should be specific?
- [ ] Are interfaces/types reused appropriately?

#### 4. Performance

- [ ] Are there any performance concerns?
- [ ] Are expensive operations necessary?
- [ ] Could queries be optimized?
- [ ] Are there unnecessary re-renders (React)?

#### 5. Security

- [ ] Is user input validated/sanitized?
- [ ] Are secrets properly managed?
- [ ] Are there any security vulnerabilities?

#### 6. Testing

- [ ] Are there tests for new functionality?
- [ ] Do existing tests still pass?
- [ ] Is test coverage adequate?

#### 7. Documentation

- [ ] Are complex logic sections commented?
- [ ] Are API changes documented?
- [ ] Is README updated if needed?

### Review Comments

**Constructive Feedback:**

```markdown
✅ Good:
"Consider extracting this logic into a separate function for better reusability."

❌ Bad:
"This is wrong."

---

✅ Good:
"This could cause a performance issue with large datasets. Have you considered pagination?"

❌ Bad:
"This will be slow."

---

✅ Good:
"Nice use of TypeScript generics here! This makes the component very flexible."

❌ Bad:
"OK."
```

### Approval Criteria

**Approve if:**
- Code works as intended
- No major issues found
- Minor comments can be addressed later

**Request Changes if:**
- Functionality is broken
- Major security concerns
- Significant refactoring needed
- Missing critical tests

**Comment (no approval) if:**
- Suggestions for improvement
- Questions about approach
- Non-blocking feedback

---

## Testing Strategy

### Current Testing Setup

**Frontend:**
- **Framework**: Jest + React Testing Library
- **Location**: `frontend/src/**/*.test.tsx`
- **Run**: `npm test` (from frontend directory)

**Backend:**
- **Framework**: Not yet configured
- **Recommendation**: Jest + Supertest for API testing

### Testing Pyramid

```
        ┌───────────────┐
        │   E2E Tests   │  (Few) - User workflows
        │   (Future)    │
        ├───────────────┤
        │ Integration   │  (Some) - API endpoints
        │     Tests     │
        ├───────────────┤
        │  Unit Tests   │  (Many) - Functions, components
        └───────────────┘
```

### Writing Tests

#### Frontend Component Tests

```typescript
// WorkerList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkerList from './WorkerList';
import * as workerService from '../../services/workerService';

// Mock service
jest.mock('../../services/workerService');

describe('WorkerList', () => {
  it('renders worker list', async () => {
    const mockWorkers = [
      { id: 'W001', name: 'John Doe', role: 'Manager', status: 'active' }
    ];

    (workerService.getWorkers as jest.Mock).mockResolvedValue({
      success: true,
      data: mockWorkers
    });

    render(<WorkerList farmId="123" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('filters workers by status', async () => {
    // Test implementation
  });
});
```

#### Backend API Tests (Recommended)

```typescript
// farmController.test.ts
import request from 'supertest';
import app from '../src/index';
import Farm from '../src/models/Farm';

describe('Farm API', () => {
  beforeEach(async () => {
    // Clear database
    await Farm.deleteMany({});
  });

  it('GET /api/farms - returns all farms', async () => {
    // Create test farms
    await Farm.create({
      name: 'Test Farm',
      type: 'Crop',
      operationDate: '2023-01-01',
      areaSize: '50 hectares',
      owner: 'user_id'
    });

    const response = await request(app)
      .get('/api/farms')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
  });

  it('POST /api/farms - creates new farm', async () => {
    const farmData = {
      name: 'New Farm',
      type: 'Livestock',
      operationDate: '2023-10-01',
      areaSize: '100 hectares',
      owner: 'user_id'
    };

    const response = await request(app)
      .post('/api/farms')
      .send(farmData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('New Farm');
  });
});
```

### Test Coverage Goals

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| **Services** | 80%+ | High |
| **Controllers** | 70%+ | High |
| **Components** | 60%+ | Medium |
| **Utilities** | 90%+ | High |

### Running Tests

```bash
# Frontend tests
cd frontend
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch         # Watch mode

# Backend tests (when configured)
cd backend
npm test
npm run test:watch
npm run test:coverage
```

---

## Code Quality Tools

### ESLint (JavaScript/TypeScript Linting)

**Configuration:** `frontend/.eslintrc.json`, `backend/.eslintrc.json`

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

**Recommended Rules:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Prettier (Code Formatting)

**Configuration:** `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

```bash
# Format code
npm run format

# Check formatting
npm run format:check
```

### Pre-commit Hooks (Husky + lint-staged)

**Setup:**

```bash
# Install dependencies
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky-init && npm install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

**Configuration:** `package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

**Benefit:** Automatically format code before committing

---

## Environment Management

### Development Environment

```bash
# Frontend
REACT_APP_GOOGLE_MAPS_API_KEY=dev_api_key
REACT_APP_API_URL=http://localhost:8080

# Backend
MONGODB_URI=mongodb://localhost:27017/cultivo_dev
PORT=8080
JWT_SECRET=dev_secret_key
NODE_ENV=development
```

### Staging Environment

```bash
# Backend
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/cultivo_staging
PORT=8080
JWT_SECRET=staging_secret_key
NODE_ENV=staging
```

### Production Environment

```bash
# Backend
MONGODB_URI=mongodb+srv://...@cluster.mongodb.net/cultivo_production
PORT=8080
JWT_SECRET=production_secret_key_strong_random_string
NODE_ENV=production
```

### Environment Variable Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use `.env.example`** - Template with dummy values
3. **Strong secrets in production** - Generate random strings
4. **Different databases per environment** - Separate dev/staging/prod
5. **Use secret managers in production** - GCP Secret Manager, AWS Secrets Manager

---

## Continuous Integration (CI)

### GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run frontend tests
        working-directory: ./frontend
        run: npm test -- --coverage

      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run backend tests
        working-directory: ./backend
        run: npm test

      - name: TypeScript type check
        run: |
          cd frontend && npx tsc --noEmit
          cd ../backend && npx tsc --noEmit

  lint:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci

      - name: Run ESLint
        run: |
          cd frontend && npm run lint
          cd ../backend && npm run lint
```

---

## Release Management

### Versioning (Semantic Versioning)

Format: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating a Release

```bash
# Update version in package.json
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# Tag and push
git push origin main --tags

# Create GitHub release
# - Navigate to Releases → Create new release
# - Select tag
# - Add release notes
```

### Changelog

**File:** `CHANGELOG.md`

```markdown
# Changelog

## [1.2.0] - 2023-11-05

### Added
- Worker status filtering
- Farm boundary editing
- Weather forecast integration

### Fixed
- Auth token expiration bug
- Map polygon rendering issue

### Changed
- Improved worker list UI
- Updated dependencies

## [1.1.0] - 2023-10-15

### Added
- CCTV streaming feature
- Worker management CRUD
```

---

## Development Best Practices

### General Principles

1. **DRY (Don't Repeat Yourself)**: Extract reusable logic
2. **KISS (Keep It Simple, Stupid)**: Favor simplicity over cleverness
3. **YAGNI (You Aren't Gonna Need It)**: Don't add features until needed
4. **Separation of Concerns**: Clear boundaries between layers
5. **Fail Fast**: Validate early, fail loudly

### Code Organization

1. **One Component Per File**: Each component in its own file
2. **Colocation**: Keep related files together
3. **Consistent Naming**: Follow established patterns
4. **Meaningful Names**: Self-documenting code
5. **Small Functions**: Max 20-30 lines per function

### Performance

1. **Avoid Premature Optimization**: Profile first
2. **Lazy Load Routes**: Code splitting for large apps
3. **Memoize Expensive Calculations**: React.memo, useMemo
4. **Debounce User Input**: Reduce API calls
5. **Optimize Images**: Compress and use appropriate formats

### Security

1. **Validate Input**: Never trust user input
2. **Sanitize Data**: Prevent XSS attacks
3. **Use Parameterized Queries**: Prevent SQL/NoSQL injection
4. **Secure Passwords**: bcrypt with salt
5. **HTTPS Only**: Enforce HTTPS in production

---

## Troubleshooting Common Issues

### Git Issues

**Merge Conflicts:**

```bash
# 1. See conflicted files
git status

# 2. Open files, resolve conflicts (look for <<<<<<, ======, >>>>>>)
# 3. Mark as resolved
git add <resolved-file>

# 4. Continue merge/rebase
git commit  # for merge
git rebase --continue  # for rebase
```

**Undo Last Commit:**

```bash
# Keep changes (soft reset)
git reset --soft HEAD~1

# Discard changes (hard reset)
git reset --hard HEAD~1
```

### Build Issues

**Node Modules Issues:**

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors:**

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run build
```

---

## Next Steps

- **[Features Guide](./09-FEATURES-GUIDE.md)** - Detailed feature implementation
- **[API Reference](./05-BACKEND-API.md)** - API endpoint documentation
