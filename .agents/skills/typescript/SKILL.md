---
name: typescript
description: Use this skill when writing code in .ts or .tsx files
---

# TypeScript

When writing TypeScript code, follow these guidelines:

- Never use `any` unless absolutely necessary. Type-safety is the number one priority when writing TypeScript code
- Use Effect-TS and its different modules whenever possible
- Make impossible states unrepresentable by using union types and discriminated unions
- Prefer pattern matching over `if` and `switch` statements. Use the `Match` module from Effect for pattern matching
- Use `Option` instead of `null` or `undefined` for optional values. Use the `Option` module from Effect for working with optional values
- Use `Result` instead of throwing exceptions for error handling. Use the `Result` module from Effect when working with results that can either succeed or fail
- Use readonly types and interfaces as a default. Mutability should be opt-in when absolutely necessary
- Model state using Effect `Schema`
