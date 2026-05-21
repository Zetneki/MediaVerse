# Testing Documentation

## Overview

The project was tested on multiple levels, including:

- frontend unit testing,
- backend unit testing,
- load testing,
- API testing,
- blockchain unit testing,
- network comparison testing.

---

# Frontend Testing

Frontend unit tests were implemented using Angular's built-in testing utilities.

## Tested Components

- `login.component.spec.ts`
- `auth.service.spec.ts`

## Run Tests

```bash
ng test
```

The tests verify:

- authentication logic,
- login validation,
- service communication,
- error handling.

---

# Backend Testing

Backend service tests were implemented using Jest.

## Test Files

- `quests.service.test.js`
- `users.service.test.js`

## Run Tests

```bash
npm test <filename>
```

The backend tests verify:

- quest progression,
- user authentication,
- database interaction,
- validation logic,
- reward handling.

---

# Load Testing

Load testing was performed using k6.

## Test File

- `load.test.js`

Before running the test:

```env
NODE_ENV=test
```

## Run Test

```bash
k6 run load.test.js
```

The load test evaluates:

- API response times,
- concurrent request handling,
- backend stability under load.

---

# API Testing

API endpoint testing was performed using Postman.

## Collection File

- `MediaVerse_API_Test.postman_collection.json`

The collection includes tests for:

- authentication endpoints,
- media retrieval,
- reviews,
- quests,
- user profile operations.

---

# Blockchain Testing

Smart contract testing was implemented using Hardhat and TypeScript.

## Test Files

- `MediaVerseTokenTest.ts`
- `ThemeMarketPlaceTest.ts`

## Run Tests

```bash
npx hardhat test
```

or:

```bash
npx hardhat test test/<filename>
```

The tests verify:

- token transfers,
- reward distribution,
- marketplace operations,
- contract validation,
- transaction execution.

---

# Network Comparison Testing

Network comparison testing was implemented using TypeScript and Mocha.

## Test File

- `NetworkComparisonTest.ts`

## Run Test

```bash
npx ts-mocha test/<filename>
```

This test compares:

- local Hardhat network performance,
- Sepolia testnet behavior,
- transaction execution differences.

---

# Summary

The project includes automated and manual testing methods covering frontend, backend, API, blockchain, and performance-related functionality.
