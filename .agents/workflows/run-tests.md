---
description: Run all DeployKaro tests — frontend type checks, content service tests, and mentor AI tests
---

# Run Tests

Use this workflow to validate the full DeployKaro codebase before committing or deploying.

## Steps

### Frontend — TypeScript Type Check
```bash
cd d:\deploykaro\frontend
npx tsc --noEmit
```

### Frontend — Lint
```bash
cd d:\deploykaro\frontend
npm run lint
```

### Frontend — Unit Tests (if configured)
```bash
cd d:\deploykaro\frontend
npm run test
```

---

### Content Service — Type Check
```bash
cd d:\deploykaro\services\content
npx tsc --noEmit
```

### Content Service — Unit Tests
```bash
cd d:\deploykaro\services\content
npm run test
```

---

### Mentor AI — Python Tests
```bash
cd d:\deploykaro\services\mentor-ai
python -m pytest tests\ -v
```

### Mentor AI — Lint (ruff)
```bash
cd d:\deploykaro\services\mentor-ai
ruff check app\
```

---

## All-in-One (run in sequence)

```bash
# Frontend checks
cd d:\deploykaro\frontend && npx tsc --noEmit && npm run lint

# Content service checks
cd d:\deploykaro\services\content && npx tsc --noEmit

# Mentor AI checks
cd d:\deploykaro\services\mentor-ai && python -m pytest tests\ -v
```

## What to Look For

- **TypeScript errors** → Fix type issues in identified files
- **Lint warnings** → Review and fix ESLint / Ruff issues
- **Test failures** → Check test output for assertion errors or missing mocks
- **Import errors in Python** → Check venv activation and `requirements.txt`
