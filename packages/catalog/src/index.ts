/**
 * Browser-safe entry point.
 *
 * Deliberately excludes the YAML loader: it reads the filesystem, and the cart
 * runs in the browser. The loader lives behind `@buildour/catalog/node`, which
 * only build scripts and server code import.
 */
export * from "./schema.js";
export * from "./dependencies.js";
export * from "./conditions.js";
