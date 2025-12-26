# Getting Started

This guide provides a complete walkthrough for setting up your local development environment for HaberNexus.

## 1. GitHub Repository Setup

### Cloning the Repository

First, clone the project from GitHub to your local machine:

```bash
git clone https://github.com/sata2500/habernexus-nextjs.git
cd habernexus-nextjs
```

### Pulling the Latest Updates

Before you start, always make sure you have the latest version of the code:

```bash
git pull origin main
```

For more details, see the [GitHub Updates Guide](https://github.com/sata2500/habernexus-nextjs/blob/main/docs/guides/GIT_PULL_GUIDE.md).

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

## 3. Environment Variables Setup

The project uses a `.env` file to manage secret keys and API credentials. 

### Create the `.env` File

Copy the example file to create your own local configuration:

```bash
cp .env.example .env
```

### Obtain and Fill in the API Keys

You will need to get API keys for Google OAuth and Google Gemini. Follow the detailed, step-by-step instructions in the guide below to get your keys and fill in your `.env` file:

➡️ **[Complete Guide: .env Setup Guide](https://github.com/sata2500/habernexus-nextjs/blob/main/docs/guides/ENV_SETUP_GUIDE.md)**

## 4. Installing Dependencies and Running the Project

Once your Node.js version is correct and your `.env` file is ready, you can install the project dependencies and start the development server.

### Install Dependencies

This command reads the `package.json` file and installs all the necessary libraries.

```bash
npm install
```

### Initialize the Database

This command reads your `prisma/schema.prisma` file, creates the SQLite database (`data.db`), and generates the Prisma Client.

```bash
npx prisma migrate dev --name init
```

### Start the Development Server

This command starts the Next.js development server with Turbopack for fast performance.

```bash
npm run dev
```

## ✅ Success!

If everything is set up correctly, you should see output similar to this:

```
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://your-local-ip:3000
- Environments: .env

✓ Ready in 5.4s
```

You can now open your web browser and navigate to **[http://localhost:3000](http://localhost:3000)** to see the running application.
