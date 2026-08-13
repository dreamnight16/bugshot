# Contributing to ComiRadar

## Development Setup

```bash
git clone https://github.com/dreamnight16/anime-con-radar.git
cd anime-con-radar
npm install
npm run dev
```

**Requirements:** Node.js ≥ 20, npm ≥ 10

## Project Structure

See the [Architecture section in README.md](README.md#architecture).

## Code Style

- TypeScript strict mode
- React functional components with hooks
- Prefer immutability — create new objects, don't mutate
- Functions < 50 lines, files < 800 lines
- Use the shared canvas primitives in `src/lib/canvas.ts` for all drawing

## Before Submitting

```bash
npm run typecheck    # Must pass
npm run lint          # Must pass
npm test             # Must pass with ≥80% coverage
npm run build        # Must succeed
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add window capture mode
fix: correct coordinate offset in region capture
refactor: extract shared canvas primitives
test: add useHistory undo/redo tests
docs: update README with MCP protocol docs
```

## Pull Request Checklist

- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Lint passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] New features have tests
- [ ] README updated if needed
- [ ] No hardcoded secrets or credentials
