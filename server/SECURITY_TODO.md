# Security Implementation TODOs

## Bonfire Token Encryption (CRITICAL - MUST IMPLEMENT BEFORE PRODUCTION)

The `bonfire_accounts` table stores OAuth access and refresh tokens. These tokens **MUST** be encrypted at rest before being stored in the database.

### Requirements:
1. **Encrypt tokens before insertion** using a secure encryption library
2. **Decrypt tokens before use** when making Bonfire API calls
3. **Use a KMS or secure key management** for encryption keys
4. **Never store encryption keys in the codebase** - use environment variables or secrets management

### Recommended Implementation:
```typescript
// Example using Node.js crypto module
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.BONFIRE_ENCRYPTION_KEY!; // 32-byte key
const IV_LENGTH = 16;

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(token);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

### Where to Implement:
- In `server/storage.ts` when inserting/retrieving Bonfire account data
- Encrypt before calling `db.insert()`
- Decrypt after calling `db.select()`

### Security Key:
- Generate a secure 32-byte encryption key: `openssl rand -base64 32`
- Store in environment variable: `BONFIRE_ENCRYPTION_KEY`
- Use Replit Secrets for production deployment
