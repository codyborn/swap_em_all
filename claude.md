# Claude Code Session Guidelines

## Git Workflow Rules

**IMPORTANT**: Do NOT push changes to `main` until the user explicitly approves and asks for it.

### Workflow:
1. Make changes locally
2. Commit locally
3. Build and test
4. Wait for user approval
5. Only push when user says "push to main" or similar explicit instruction

## Current Work

Backend API system with database and price tracking completed:
- ✅ Database schema (Prisma + SQLite)
- ✅ Token capture registration API with on-chain verification
- ✅ User stats API with profit/loss calculations
- ✅ Price update cron job (runs every minute)
- ⚠️ Only basic local testing done - needs comprehensive testing
- ⚠️ Code pushed to GitHub but NOT deployed to production

**Note**: Two recent commits were pushed without explicit approval (API fixes and backend API). Going forward, will strictly follow the no-push rule.
