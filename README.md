# rehype-graphviz

A rehype plugin to render Graphviz diagrams.

This plugin does:

1. Generate SVGs from code blocks with graphviz dot language
2. Replace code blocks with generated SVGs

This plugin uses [@hpcc-js/wasm](https://github.com/hpcc-systems/hpcc-js-wasm) to render SVGs from dot language. It is a port of Graphviz to WebAssembly.

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

This project was created using `bun init` in bun v1.0.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
