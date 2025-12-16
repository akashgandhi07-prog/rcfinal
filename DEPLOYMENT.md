# Deployment Configuration

This project uses **npm** as the package manager, not pnpm.

## Configuration Files

- `package.json` - Contains `packageManager: "npm@10.9.2"` to specify npm
- `.npmrc` - Ensures npm is used
- `package-lock.json` - npm lockfile (committed)
- `pnpm-lock.yaml` - Should NOT exist (in .gitignore)

## Platform-Specific Configs

- **Cloudflare Pages**: `wrangler.toml`
- **Vercel**: `vercel.json`
- **Netlify**: `netlify.toml`

## Build Command

All platforms should use:
```bash
npm install && npm run build
```

## If CI Still Uses pnpm

If your CI/CD platform still tries to use pnpm, you can:

1. **Delete pnpm-lock.yaml** (already in .gitignore)
2. **Set environment variable**: `NPM_CONFIG_USER_AGENT=npm`
3. **Override build command**: Use `npm install` explicitly


