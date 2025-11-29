# Deploy Lottery to Mainnet with Existing SUIYAN Token

## Overview

**Testnet Setup:**
- Custom SUIYAN token: `0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9::suiyan::SUIYAN`
- Lottery package: `0xc63e38207267469fa9a4ee0e3104292eafe33a49a9874da2714b093150c86aa8`

**Mainnet Setup:**
- Existing Super Suiyan token: `0xe0fbaffa16409259e431b3e1ff97bf6129641945b42e5e735c99aeda73a595ac::suiyan::SUIYAN`
- Need to deploy lottery package (will use existing token)

## Steps to Deploy

### 1. Update Lottery Move.toml for Mainnet

Edit `/Users/pluto/sui/suiyan/contract/suiyan_play/Move.toml`:

```toml
[addresses]
suiyan_play = "0x0"
suiyan_token = "0xe0fbaffa16409259e431b3e1ff97bf6129641945b42e5e735c99aeda73a595ac"
```

**Note:** Change `suiyan_token` address to the mainnet Super Suiyan package address.

### 2. Update Import in suiyan.move

The import should still work, but verify it references:
```move
use suiyan_token::suiyan::SUIYAN;
```

**Important:** The mainnet token module is named `suiyan` (not `suiyan_token`), and the type is `SUIYAN` (not `SUIYAN_TOKEN`).

You'll need to update all references:
- Change `SUIYAN_TOKEN` to `SUIYAN` throughout the code
- Update the import to match the mainnet module structure

### 3. Switch to Mainnet

```bash
# Check current network
sui client envs

# Switch to mainnet (if not already)
sui client switch --env mainnet

# Or add mainnet if not configured
sui client new-env --alias mainnet --rpc https://fullnode.mainnet.sui.io:443
```

### 4. Build and Deploy

```bash
cd /Users/pluto/sui/suiyan/contract/suiyan_play
sui move build
sui client publish --gas-budget 100000000
```

### 5. Note the Package ID

Save the deployed lottery package ID for mainnet configuration.

## Frontend Configuration

You'll need to configure the frontend to use different addresses based on the network:

**constants.ts** should support both networks:
```typescript
// Network detection
const isMainnet = /* your network detection logic */

export const PACKAGE_ID = isMainnet
  ? "0x<MAINNET_LOTTERY_PACKAGE_ID>"
  : "0xc63e38207267469fa9a4ee0e3104292eafe33a49a9874da2714b093150c86aa8"

export const SUIYAN_TOKEN_PACKAGE_ID = isMainnet
  ? "0xe0fbaffa16409259e431b3e1ff97bf6129641945b42e5e735c99aeda73a595ac"
  : "0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9"

export const SUIYAN_TOKEN_TYPE = isMainnet
  ? `${SUIYAN_TOKEN_PACKAGE_ID}::suiyan::SUIYAN`
  : `${SUIYAN_TOKEN_PACKAGE_ID}::suiyan::SUIYAN`
```

## Important Differences

**Mainnet Token:**
- Module: `suiyan` (not `suiyan_token`)
- Type: `SUIYAN` (not `SUIYAN_TOKEN`)
- Package: `0xe0fb...`

**Testnet Token:**
- Module: `suiyan` (same as mainnet)
- Type: `SUIYAN` (same as mainnet)
- Package: `0x145f...`

## Notes

- You won't be able to mint the mainnet Super Suiyan tokens (unless you have the treasury cap)
- Lottery creators will need to provide their own SUIYAN tokens for prizes
- Consider how users will obtain SUIYAN tokens on mainnet for creating lotteries
