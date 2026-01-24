# Claude Code Session Guidelines

## Git Workflow Rules

**IMPORTANT**: Do NOT push changes to `main` until the user explicitly approves and asks for it.

### Workflow:
1. Make changes locally
2. Commit locally
3. **Build and test** - ALWAYS run `npm run build` to verify the build succeeds before pushing
4. Run Playwright tests after every change: `npx playwright test`
5. Wait for user approval
6. Only push when user says "push to main" or similar explicit instruction

### Build Verification
**CRITICAL**: Before pushing to main, ALWAYS verify the build succeeds:
```bash
npm run build
```

This prevents deployment failures caused by TypeScript errors or other build issues.
If the build fails, fix the errors before pushing.

## Testing

### Test Mode (No Wallet Required)
For testing without wallet connection, use: **http://localhost:3000/game/test**

This bypasses the wallet connection requirement and allows direct game access for:
- Automated testing
- Development
- Debugging game mechanics without blockchain interaction