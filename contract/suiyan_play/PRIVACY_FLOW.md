# Anonymous Prize Claiming Flow

## Overview
This lottery implements privacy-preserving prize claims using Walrus storage and cryptographic commitments. The secret is generated ONCE when creating the lottery, making it simple for players while maintaining privacy.

## How It Works

### 1. **Creator Creates Lottery with Secret**

**Off-chain (Frontend):**
```typescript
// Generate a random secret (256-bit random bytes)
const secret = crypto.randomBytes(32);

// Hash the secret for on-chain commitment
const secretHash = keccak256(secret);

// Encrypt the secret for Walrus storage
const encryptedSecret = encrypt(secret, creatorPassword);

// Upload encrypted secret to Walrus
const walrusBlobId = await walrus.upload(encryptedSecret);

// Create lottery with the commitment
await contract.create_lottery(
  payment,         // 0.1 SUI prize
  secretHash,      // On-chain commitment
  walrusBlobId,    // Where to find encrypted secret
  ctx
);
```

**On-chain:**
- Stores `claim_secret_hash` and `walrus_blob_id` in the Lottery object
- These are set once at creation and never change

### 2. **Player Picks a Slot (Simple!)**

**Off-chain (Frontend):**
```typescript
// Just pick a slot - no secret needed!
await contract.pick_slot(
  slotIndex,
  lottery,
  random,
  payment,  // 0.015 SUI fee
  ctx
);
```

**On-chain:**
- If player wins, emits `WinnerClaimInfoEvent` with:
  - `claim_secret_hash`: The hash to verify against
  - `walrus_blob_id`: Where to find the encrypted secret
- Winner sees this event in their transaction logs

### 3. **Winner Claims Prize Anonymously**

**Off-chain (Frontend):**
```typescript
// Winner gets walrus_blob_id from WinnerClaimInfoEvent in their transaction logs

// Retrieve encrypted secret from Walrus
const encryptedSecret = await walrus.fetch(walrusBlobId);

// Decrypt with creator's password (shared off-chain or via secure channel)
const secret = decrypt(encryptedSecret, creatorPassword);

// Claim from ANY address (not the winning address!)
const freshAddress = generateNewWallet();
await contract.claim_prize_with_secret(
  lottery,
  secret,  // Proves you know the secret
  freshCtx // Can be any address for anonymity!
);
```

**On-chain:**
- Verifies `keccak256(secret) == claim_secret_hash`
- Transfers prize to **caller's address** (breaks the link!)
- Marks prize as claimed

## Privacy Benefits

### ✅ **Anonymous Claiming**
- Winner can claim from a completely different address
- No on-chain link between winner and claimer

### ✅ **Encrypted Storage**
- Secret is encrypted before storing on Walrus
- Only winner knows decryption password

### ✅ **Commitment Scheme**
- On-chain only stores hash, not the secret itself
- Secret reveals nothing until used to claim

### ✅ **Walrus Integration**
- Decentralized storage (no single point of failure)
- Winner controls when to retrieve secret

## Security Considerations

### Encryption
```typescript
// Example using Web Crypto API
async function encryptSecret(secret: Uint8Array, password: string) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive key from password
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    secret
  );

  // Return: salt + iv + encrypted
  return concatenate(salt, iv, new Uint8Array(encrypted));
}
```

### Important Notes

⚠️ **Password Security**
- Winner must remember the decryption password
- Lost password = lost access to prize
- Consider using a key derivation function (PBKDF2, Argon2)

⚠️ **Walrus Availability**
- Ensure Walrus blob is available when claiming
- Consider storing encrypted secret in multiple locations

⚠️ **Gas Consistency**
- Both win/lose paths write same amount of data
- Prevents detecting wins via gas cost

⚠️ **One-Time Claim**
- Prize can only be claimed once (`prize_claimed` flag)
- Secret becomes useless after claim

## Legal Considerations

⚠️ **Regulatory Compliance**
- Check local laws regarding financial privacy
- Some jurisdictions restrict anonymous transactions
- Tornado Cash was sanctioned by OFAC

⚠️ **Know Your Customer (KYC)**
- May not be compliant with KYC/AML requirements
- Consult legal counsel before deployment

## Example Frontend Integration

```typescript
import { WalrusClient } from '@walrus/sdk';
import { SuiClient } from '@mysten/sui.js';

class PrivateLottery {
  constructor(
    private suiClient: SuiClient,
    private walrusClient: WalrusClient
  ) {}

  async pickSlot(slotIndex: number, password: string) {
    // Generate secret
    const secret = crypto.randomBytes(32);
    const secretHash = keccak256(secret);

    // Encrypt and upload
    const encrypted = await encryptSecret(secret, password);
    const blobId = await this.walrusClient.upload(encrypted);

    // Pick slot on-chain
    const result = await this.suiClient.executeMoveCall({
      target: `${PACKAGE}::random_poc::pick_slot`,
      arguments: [
        slotIndex,
        lottery,
        random,
        payment,
        Array.from(secretHash),
        Array.from(blobId)
      ]
    });

    // Check if won
    if (result.events.some(e => e.type.includes('WinnerClaimInfoEvent'))) {
      console.log('🎉 You won! Save this info:');
      console.log('Blob ID:', blobId.toString('hex'));
      console.log('Remember your password!');
    }

    return result;
  }

  async claimPrize(blobId: string, password: string, claimAddress: string) {
    // Download and decrypt
    const encrypted = await this.walrusClient.fetch(blobId);
    const secret = await decryptSecret(encrypted, password);

    // Claim from new address
    await this.suiClient.executeMoveCall({
      target: `${PACKAGE}::random_poc::claim_prize_with_secret`,
      arguments: [lottery, Array.from(secret)],
      gasBudget: 10000000,
      // Use fresh address!
      signer: claimAddress
    });
  }
}
```

## Testing the Flow

See updated tests in `tests/random_poc_tests.move` for examples of:
- Generating secrets and hashes
- Simulating Walrus blob IDs
- Anonymous claiming with correct secret
- Rejecting invalid secrets
