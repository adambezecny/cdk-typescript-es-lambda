# CDK Typescript Lambda as ES module with top level awaits

This project demonstrates how to create AWS Lambda functions using ES modules with top-level await support in CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


## Deploy eslambda stack

```bash
npx cdk deploy EslambdaStack
```

## Key Configuration Steps

#### 1. Package.json Configuration
Add `"type": "module"` to enable ES module support:
```json
{
  "type": "module"
}
```

Install `tsx` for running TypeScript with ES modules:
```bash
npm install --save-dev tsx
```

The original CDK templates uses **ts-node**, which doesn't handle ES modules well by default. This is resolved by using **tsx** instead:

* Built from the ground up with ES module support
* Works seamlessly with "type": "module"
* Zero configuration needed
* Faster execution than ts-node with loaders

#### 2. TypeScript Configuration (tsconfig.json)
Configure TypeScript for ES modules with top-level await:
```json
{
  "compilerOptions": {
    "target": "ES2022",             // Required for top-level await
    "module": "nodenext",           // ES module support
    "moduleResolution": "nodenext", // Proper module resolution
    "outDir": "./dist",             // Output directory
    "lib": ["es2022"]               // ES2022 standard library types
  },
  "exclude": ["node_modules", "cdk.out", "dist"]
}
```

**Understanding `lib` option:**
The `"lib"` option specifies which built-in JavaScript/TypeScript type definitions to include. Here we use `"es2022"` which provides all ES2022 standard library types (Promise, Array methods, String methods, etc.). We don't need `"dom"` since this is backend code, not browser code.

#### 3. CDK Configuration (cdk.json)
Update the app command to use `tsx`:
```json
{
  "app": "npx tsx bin/eslambda.ts"
}
```

#### 4. Using `--conditions: module` in esbuildArgs

The `--conditions` flag tells esbuild which export conditions to use when resolving modules:

```typescript
esbuildArgs: {
  '--conditions': 'module',
}
```

- **Purpose**: Ensures esbuild uses the ES module exports from dependencies
- **How it works**: Many npm packages have multiple export formats (CommonJS, ES modules) defined in their `package.json` via conditional exports
- **Example**: When a package has both `"require"` and `"import"` conditions, `--conditions: module` tells esbuild to prefer the ES module version
- **Result**: Proper ES module bundling without CommonJS fallbacks, enabling features like top-level await

Without this, esbuild might use CommonJS versions of dependencies, which would break ES module semantics.

#### 5. Source Maps

Source maps enable debugging of TypeScript code in Lambda CloudWatch logs:

```typescript
bundling: {
  sourceMap: true,  // Generate source maps during build
}
environment: {
  NODE_OPTIONS: '--enable-source-maps',  // Enable in Lambda runtime
}
```
