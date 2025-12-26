# Getting Started

This guide provides a complete walkthrough for setting up your local development environment for HaberNexus.

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Minimum Version | Check Command |
|-------------|-----------------|---------------|
| Node.js | v20.9.0 | `node -v` |
| npm | v10.0.0 | `npm -v` |
| Git | Any recent version | `git --version` |

---

## 1. Clone the Repository

```bash
# Clone the project
git clone https://github.com/sata2500/habernexus-nextjs.git

# Navigate to the project directory
cd habernexus-nextjs
```

### Pulling the Latest Updates

Before you start, always make sure you have the latest version of the code:

```bash
git pull origin master
```

---

## 2. Node.js Version Management

The project requires **Node.js version 20.9.0 or higher**. We strongly recommend using `nvm` (Node Version Manager) to manage your Node.js versions.

### Installing `nvm` and Node.js

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload your terminal configuration
source ~/.bashrc  # Or source ~/.zshrc

# Install the latest LTS version of Node.js
nvm install --lts

# Verify the installation
node -v  # Should be v20.9.0 or higher
```

For detailed troubleshooting, see the [Node.js Update Guide](https://github.com/sata2500/habernexus-nextjs/blob/main/docs/guides/NODE_JS_UPDATE_GUIDE.md).

---

## 3. Install Dependencies

> ⚠️ **CRITICAL STEP:** This step is mandatory. Skipping it will cause "Module not found" errors.

```bash
# Install all dependencies from package.json
npm install
```

### Verify Installation

After installation, verify that key packages are installed:

```bash
# Check if node_modules exists and has content
ls node_modules | wc -l  # Should show a number > 100

# Verify specific packages
ls node_modules | grep -E "clsx|lucide-react|tailwind-merge"
```

If you see errors like `Module not found: Can't resolve 'clsx'`, run `npm install` again.

---

## 4. Environment Variables Setup

The project uses a `.env` file to manage secret keys and API credentials.

### Create the `.env` File

```bash
cp .env.example .env
```

### Configure Environment Variables

Open `.env` and fill in the required values. See the [.env Setup Guide](https://github.com/sata2500/habernexus-nextjs/blob/main/docs/guides/ENV_SETUP_GUIDE.md) for detailed instructions.

---

## 5. Database Setup

HaberNexus uses SQLite with Prisma ORM.

### Generate Prisma Client

```bash
npx prisma generate
```

### Create the Database

```bash
npx prisma db push
```

This creates the SQLite database file (`prisma/data.db`) and applies the schema.

---

## 6. Start the Development Server

```bash
npm run dev
```

### Expected Output

```
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://your-local-ip:3000
- Environments: .env

✓ Ready in 2.7s
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## Quick Setup (Copy & Paste)

For experienced developers, here's the complete setup in one block:

```bash
# Clone and enter directory
git clone https://github.com/sata2500/habernexus-nextjs.git
cd habernexus-nextjs

# Install dependencies (REQUIRED!)
npm install

# Setup environment
cp .env.example .env

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

---

## Troubleshooting

### Error: Module not found

```
Module not found: Can't resolve 'clsx'
Module not found: Can't resolve 'lucide-react'
Module not found: Can't resolve 'tailwind-merge'
```

**Solution:** Run `npm install` to install all dependencies.

### Error: Prisma Client not generated

```
Error: @prisma/client did not initialize yet
```

**Solution:** Run `npx prisma generate`.

### Error: Database not found

```
Error: The table `main.User` does not exist
```

**Solution:** Run `npx prisma db push`.

### Error: Node.js version too old

```
error habernexus-nextjs@1.0.0: The engine "node" is incompatible
```

**Solution:** Update Node.js to v20.9.0 or higher using nvm.

---

## Verification Checklist

Before starting development, verify:

- [ ] `node -v` shows v20.9.0 or higher
- [ ] `npm install` completed without errors
- [ ] `.env` file exists
- [ ] `npx prisma generate` completed
- [ ] `npx prisma db push` completed
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads in browser

---

## Next Steps

Once your development environment is set up:

1. Read the [Project Philosophy & Architecture](./Project-Philosophy-&-Architecture.md)
2. Review the [Development & Contribution](./Development-&-Contribution.md) guide
3. Check the [ROADMAP.md](../ROADMAP.md) for current development goals

For AI agents, proceed to [AI_DEVELOPMENT_GUIDE.md](../AI_DEVELOPMENT_GUIDE.md).
