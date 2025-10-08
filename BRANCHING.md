# Branching Strategy

This document outlines the git branching strategy for separating foundation features from custom UI work.

## Branch Structure

### `main`
- **Purpose**: Production-ready code
- **Protection**: Should be protected, requires PR reviews
- **Merges from**: `foundation` and `custom-ui` (via PRs)
- **Description**: The main branch that gets deployed to production

### `foundation`
- **Purpose**: Core application features and infrastructure
- **Focus**: Backend functionality, authentication, API integrations, security, testing
- **Includes**:
  - Home Assistant WebSocket integration
  - Authentication (Supabase)
  - Rate limiting and security features
  - Caching layer
  - Input validation
  - API routes (`/api/*`)
  - Real-time updates (SSE)
  - Core utilities and libraries
  - Unit tests
- **Workflow**:
  - Create feature branches from `foundation` (e.g., `foundation/new-feature`)
  - Merge back to `foundation` via PR
  - Periodically merge `foundation` → `main` when features are stable

### `custom-ui`
- **Purpose**: UI customization and design work
- **Focus**: Frontend components, styling, layout, UX
- **Includes**:
  - React components
  - Tailwind CSS customization
  - UI/UX improvements
  - Custom themes
  - Page layouts
  - Design system
- **Workflow**:
  - Create feature branches from `custom-ui` (e.g., `custom-ui/dashboard-redesign`)
  - Merge back to `custom-ui` via PR
  - Periodically merge `custom-ui` → `main` when UI changes are complete

## Workflow Examples

### Working on Foundation Features

```bash
# Start from foundation branch
git checkout foundation
git pull origin foundation

# Create feature branch
git checkout -b foundation/add-mqtt-support

# Make changes, commit
git add .
git commit -m "Add MQTT broker integration"

# Push and create PR to foundation
git push -u origin foundation/add-mqtt-support

# After PR approval, merge to foundation
# Then periodically merge foundation to main
```

### Working on UI Customization

```bash
# Start from custom-ui branch
git checkout custom-ui
git pull origin custom-ui

# Create feature branch
git checkout -b custom-ui/dashboard-redesign

# Make changes, commit
git add .
git commit -m "Redesign dashboard layout with grid system"

# Push and create PR to custom-ui
git push -u origin custom-ui/dashboard-redesign

# After PR approval, merge to custom-ui
# Then periodically merge custom-ui to main
```

### Syncing Foundation Changes to Custom UI

When foundation changes need to be incorporated into custom-ui:

```bash
# Switch to custom-ui
git checkout custom-ui
git pull origin custom-ui

# Merge foundation changes
git merge foundation

# Resolve any conflicts
# Test thoroughly
git push origin custom-ui
```

### Syncing Both to Main

```bash
# Ensure both branches are tested and stable
git checkout main
git pull origin main

# Merge foundation first (infrastructure changes)
git merge foundation

# Then merge custom-ui
git merge custom-ui

# Resolve conflicts if any
# Run full test suite
npm test

# Push to main
git push origin main
```

## Conflict Resolution

When conflicts occur between `foundation` and `custom-ui`:

1. **API/Interface Changes**: Foundation takes precedence (infrastructure is the contract)
2. **Component Structure**: Evaluate on case-by-case basis
3. **Styling**: Custom UI takes precedence
4. **Testing**: Keep all tests from both branches

## Best Practices

1. **Keep branches in sync**: Regularly merge `foundation` into `custom-ui` to avoid large conflicts
2. **Semantic commits**: Use clear commit messages describing what changed
3. **Test before merging**: Always run tests before merging to main
4. **Feature branches**: Use descriptive branch names (e.g., `foundation/websocket-reconnect`, `custom-ui/dark-mode`)
5. **Small PRs**: Keep pull requests focused and reviewable
6. **Documentation**: Update relevant docs when merging to main

## Current State

- **main**: Production branch (protected)
- **foundation**: v1.0 - Core features complete
  - Authentication ✓
  - WebSocket integration ✓
  - Real-time updates ✓
  - Security (rate limiting, validation) ✓
  - Unit tests (validation, cache, rate-limit) ✓
- **custom-ui**: Starting point for UI customization
  - Currently matches main
  - Ready for UI/UX work

## Migration Path

If you need to move changes between branches:

```bash
# Cherry-pick specific commits
git checkout custom-ui
git cherry-pick <commit-hash>

# Or apply specific files from another branch
git checkout foundation -- lib/some-file.ts
```

## Protection Rules (Recommended)

For `main` branch on GitHub:
- Require pull request reviews (1+ approvals)
- Require status checks to pass (tests)
- Require branches to be up to date
- No force pushes
- No deletions

## Questions?

- **Where to add new API endpoints?** → `foundation` branch
- **Where to redesign a page?** → `custom-ui` branch
- **Where to add tests?** → `foundation` branch (infrastructure tests) or `custom-ui` (UI tests)
- **Where to update dependencies?** → `foundation` branch first, then sync
- **Where to fix bugs?** → In the appropriate branch, or `main` if urgent (then backport)
