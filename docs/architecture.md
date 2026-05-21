# Application Architecture

## Overview

The application follows a modular multi-layer architecture consisting of:

- Angular frontend
- Node.js backend
- PostgreSQL database
- Hardhat blockchain environment
- External TMDB API integration

# Frontend Architecture

The frontend was developed using Angular.

Main responsibilities:

- user interface rendering,
- authentication handling,
- media browsing,
- progress tracking,
- blockchain interaction,
- theme customization.

## Main Frontend Modules

### Components

Reusable UI elements such as:

- movie cards,
- review forms,
- quest widgets,
- profile sections.

### Pages

Route-level pages:

- home,
- discover,
- library,
- profile,
- quests,
- details pages.

### Services

Responsible for:

- API communication,
- blockchain communication,
- authentication,
- notifications.

### Guards and Interceptors

Used for:

- route protection,
- JWT handling,
- global error handling,
- rate-limit handling.

# Backend Architecture

The backend follows a layered Express.js architecture.

## Main Layers

### Routes

Define API endpoints.

### Controllers

Handle incoming requests and responses.

### Services

Contain business logic.

### DAO Layer

Responsible for database communication.

### Middlewares

Provide:

- authentication,
- rate limiting,
- wallet verification,
- error handling.

### Cron Jobs

Background tasks for:

- cache refresh,
- user activity tracking.

# Blockchain Architecture

The blockchain module uses Hardhat and Solidity smart contracts.

## Smart Contracts

### MediaVerseToken.sol

ERC-20 token implementation.

### ThemeMarketplace.sol

Handles blockchain-based theme purchases.

## Scripts

Used for:

- wallet generation,
- wallet funding,
- deployment automation.

# Database Layer

PostgreSQL is used as the primary database system.

The database stores:

- users,
- media cache,
- progress tracking,
- quests,
- reviews,
- themes.

Detailed schema documentation is available in `database_schema.md`.

# External Integrations

## TMDB API

Used for:

- movie metadata,
- series metadata,
- genres,
- images,
- trailers.

Cached locally to reduce external API calls.

# Testing

The project contains:

- unit tests,
- API tests,
- blockchain tests,
- load tests.

# Deployment Structure

The application supports:

- local Hardhat blockchain network,
- Sepolia Ethereum test network.

Environment-specific configuration files are used for deployment.
