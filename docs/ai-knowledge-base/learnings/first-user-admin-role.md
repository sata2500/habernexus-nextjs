# First User Auto-Admin Role Assignment

**Date:** 07 January 2026  
**Category:** Authentication  
**Status:** Implemented

---

## Problem

When deploying a fresh installation of HaberNexus, the first user who signs up gets the default `USER` role instead of `ADMIN`. This requires manual database intervention to grant admin access.

## Root Cause

The Prisma schema defines `USER` as the default role:

```prisma
model User {
  // ...
  role Role @default(USER)
  // ...
}
```

There was no mechanism to automatically promote the first user to admin.

## Solution

Implemented automatic first-user admin assignment in `auth.ts`:

```typescript
/**
 * Check if this is the first user in the system
 * If so, they should be assigned ADMIN role automatically
 */
async function checkAndAssignFirstUserAdmin(userId: string): Promise<Role> {
  // Count total users in the system
  const userCount = await prisma.user.count()
  
  // If this is the first user (count is 1, meaning only this user exists)
  if (userCount === 1) {
    // Update the user to ADMIN role
    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
    })
    return "ADMIN"
  }
  
  // Otherwise, fetch the current role from database
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  
  return dbUser?.role ?? "USER"
}
```

This function is called in the JWT callback during sign-in.

## Key Learnings

1. **JWT callback is the right place:** The JWT callback runs on every sign-in, making it ideal for role assignment.
2. **Count-based detection:** Using `prisma.user.count()` is efficient and reliable for detecting the first user.
3. **No seed scripts needed:** This approach eliminates the need for database seed scripts or manual intervention.
4. **Idempotent design:** The function only promotes to admin if count is exactly 1, preventing issues with subsequent logins.

## Alternative Approaches Considered

| Approach | Pros | Cons |
|----------|------|------|
| Seed script | Explicit, controlled | Requires manual execution |
| Environment variable | Configurable | Requires env setup |
| First-user detection (chosen) | Automatic, zero-config | Slightly more complex logic |

## Related Files

- `auth.ts` - Main authentication configuration
- `prisma/schema.prisma` - User model with role enum

## Testing

1. Fresh database with no users
2. First user signs in via Google OAuth
3. User automatically receives ADMIN role
4. Subsequent users receive USER role

## References

- [Auth.js Callbacks](https://authjs.dev/guides/basics/callbacks)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
