# How to Mint SUIYAN Tokens via CLI

## Package Information

**SUIYAN Token Package ID:**
```
0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9
```

**Treasury Cap Object ID:**
```
0x22490f97528c35ab3695b418b24b51e057041055cf0b7c70c4de30aa4409a99a
```

**Token Type:**
```
0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9::suiyan::SUIYAN
```

## Minting Tokens

To mint SUIYAN tokens to yourself, use the following command:

```bash
sui client call \
  --package 0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9 \
  --module suiyan \
  --function mint_and_transfer \
  --args 0x22490f97528c35ab3695b418b24b51e057041055cf0b7c70c4de30aa4409a99a <AMOUNT> <YOUR_ADDRESS> \
  --gas-budget 10000000
```

Replace:
- `<AMOUNT>` with the number of tokens in base units (9 decimals)
- `<YOUR_ADDRESS>` with your wallet address (or use `$(sui client active-address)` to auto-fill your active address)

### Examples:

**Mint 100 SUIYAN tokens to yourself:**
```bash
sui client call \
  --package 0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9 \
  --module suiyan \
  --function mint_and_transfer \
  --args 0x22490f97528c35ab3695b418b24b51e057041055cf0b7c70c4de30aa4409a99a 100000000000 $(sui client active-address) \
  --gas-budget 10000000
```

**Mint 1 SUIYAN token to yourself:**
```bash
sui client call \
  --package 0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9 \
  --module suiyan \
  --function mint_and_transfer \
  --args 0x22490f97528c35ab3695b418b24b51e057041055cf0b7c70c4de30aa4409a99a 1000000000 $(sui client active-address) \
  --gas-budget 10000000
```

**Mint 0.1 SUIYAN tokens to yourself:**
```bash
sui client call \
  --package 0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9 \
  --module suiyan \
  --function mint_and_transfer \
  --args 0x22490f97528c35ab3695b418b24b51e057041055cf0b7c70c4de30aa4409a99a 100000000 $(sui client active-address) \
  --gas-budget 10000000
```

**Mint to a specific address:**
```bash
sui client call \
  --package 0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9 \
  --module suiyan \
  --function mint_and_transfer \
  --args 0x22490f97528c35ab3695b418b24b51e057041055cf0b7c70c4de30aa4409a99a 1000000000 0x1234...5678 \
  --gas-budget 10000000
```

## Important Notes

- SUIYAN tokens use 9 decimals, same as SUI
- Only the treasury cap holder can mint tokens
- The minted tokens will be sent to your active address
- Make sure you have enough SUI for gas fees

## Conversion Table

| Display Amount | Base Units (9 decimals) |
|----------------|-------------------------|
| 1 SUIYAN       | 1,000,000,000           |
| 0.1 SUIYAN     | 100,000,000             |
| 0.01 SUIYAN    | 10,000,000              |
| 0.001 SUIYAN   | 1,000,000               |

## Check Your Balance

To check your SUIYAN token balance:

```bash
sui client balance --coin-type 0x145fbaf00fa5ffad7eeef2c3a0eac1a7dc45ced91c7552e4a964a1c1139adca9::suiyan::SUIYAN
```
