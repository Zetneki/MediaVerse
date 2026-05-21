# Blockchain Setup

## Run Once

1. `generate-backend-wallet.ts`
2. `fund-backend-wallet.ts`
3. Save in:
   - `blockchain/.env`
   - `backend/.env`

## Localhost

1. Save `http://localhost:8545` in:
   - backend `.env`
   - frontend `environment`

   (once)

2. Delete:

```txt
deployments/chain-1337
```

3. Start local node:

```bash
npm run node
```

4. Run setup:

```bash
npm run setup
```

5. Save deployment addresses in:
   - backend `.env`
   - frontend `environment`

## Sepolia

1. Save:

```txt
https://ethereum-sepolia-rpc.publicnode.com
```

in:

- backend `.env`
- blockchain `.env`
- frontend `environment.sepolia`

(once)

2. Deploy:

```bash
npm run deploy-sepolia
```

3. Save contract addresses in:
   - backend `.env`
   - frontend `environment.sepolia`

4. Start frontend with Sepolia:

```bash
ng serve --configuration=sepolia
```

## Network Change

1. On blockchain:
   - Sepolia deploy only once
   - localhost setup every time

2. In backend `.env`, change:
   - RPC URL
   - contract addresses

3. Start frontend:

```bash
ng serve
```

or

```bash
ng serve --configuration=sepolia
```

4. In the wallet:
   - change token source
   - select:
     - Hardhat Local
     - Sepolia
