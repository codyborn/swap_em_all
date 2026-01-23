# Claude Code Session Guidelines

## Git Workflow Rules

**IMPORTANT**: Do NOT push changes to `main` until the user explicitly approves and asks for it.

### Workflow:
1. Make changes locally
2. Commit locally
3. Build and test
4. Wait for user approval
5. Only push when user says "push to main" or similar explicit instruction

## Testing

### Test Mode (No Wallet Required)
For testing without wallet connection, use: **http://localhost:3000/game/test**

This bypasses the wallet connection requirement and allows direct game access for:
- Automated testing
- Development
- Debugging game mechanics without blockchain interaction