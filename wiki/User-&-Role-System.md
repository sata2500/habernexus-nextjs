# User & Role System

This page provides a detailed overview of the User & Role System in HaberNexus.

## 1. Overview

The User & Role System is responsible for:

- User authentication via Google OAuth.
- Role-based access control (RBAC).
- Storing user data in the database.

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| **Auth.js (NextAuth.js v5)** | Handles the Google OAuth authentication flow. |
| **Prisma** | Stores user data, including roles, in the SQLite database. |

## 3. Roles

There are three user roles in HaberNexus:

| Role | Description |
|---|---|
| **ADMIN** | Can manage all aspects of the system, including users, RSS feeds, and system settings. |
| **AUTHOR** | Can write and publish articles. |
| **USER** | Can read articles and manage their own profile. |

## 4. Authentication Flow

1.  A user clicks the "Login" button.
2.  The user is redirected to Google to authenticate.
3.  After successful authentication, the user is redirected back to HaberNexus.
4.  Auth.js creates a new user in the database if one does not already exist.
5.  The user is assigned the `USER` role by default. The first user to sign up is assigned the `ADMIN` role.
6.  A session is created for the user.

## 5. Future Enhancements

- **Credentials-based authentication:** Allow users to sign up with a username and password.
- **Magic Links:** Allow users to sign in with a one-time link sent to their email address.
- **WebAuthn:** Allow users to sign in with a passkey.
