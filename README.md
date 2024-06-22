# rehype-graphviz

[![CI](https://github.com/r4ai/rehype-graphviz/actions/workflows/ci.yml/badge.svg)](https://github.com/r4ai/rehype-graphviz/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/r4ai/rehype-graphviz/graph/badge.svg?token=O53KL0SJ3N)](https://codecov.io/gh/r4ai/rehype-graphviz)

A rehype plugin to render Graphviz diagrams.

This plugin does:

1. Generate SVGs from code blocks with graphviz dot language
2. Replace code blocks with generated SVGs

This plugin uses [@hpcc-js/wasm](https://github.com/hpcc-systems/hpcc-js-wasm) to render SVGs from dot language. It is a port of Graphviz to WebAssembly.

## Installation

```bash
# npm
npm install rehype-graphviz @hpcc-js/wasm

# pnpm
pnpm add rehype-graphviz @hpcc-js/wasm

# bun
bun add rehype-graphviz @hpcc-js/wasm
```

## Usage

```ts
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeGraphviz from "rehype-graphviz";
import rehypeStringify from "rehype-stringify";
import { Graphviz } from "@hpcc-js/wasm";

const md = `
# Hello World

\`\`\`dot
digraph {
  a -> b
}
\`\`\`
`;

const html = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeGraphviz, {
    graphviz: await Graphviz.load(),
  })
  .use(rehypeStringify)
  .processSync(md)
  .toString();

console.log(html);
```

Yields:

<!-- prettier-ignore -->
```html
<h1>Hello World</h1>
<div class="graphviz-diagram" style="overflow: auto;">
  <!--?xml version="1.0" encoding="UTF-8" standalone="no"?-->
  <!-- Generated by graphviz version 9.0.0 (0) -->
  <!-- Pages: 1 -->
  <svg width="62pt" height="116pt" viewBox="0.00 0.00 62.00 116.00" xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(4 112)">
      <polygon fill="white" stroke="none" points="-4,4 -4,-112 58,-112 58,4 -4,4"></polygon>
      <!-- a -->
      <g id="node1" class="node">
        <title>a</title>
        <ellipse fill="none" stroke="black" cx="27" cy="-90" rx="27" ry="18"></ellipse>
        <text text-anchor="middle" x="27" y="-85.8" font-family="Times,serif" font-size="14.00">a</text>
      </g>
      <!-- b -->
      <g id="node2" class="node">
        <title>b</title>
        <ellipse fill="none" stroke="black" cx="27" cy="-18" rx="27" ry="18"></ellipse>
        <text text-anchor="middle" x="27" y="-13.8" font-family="Times,serif" font-size="14.00">b</text>
      </g>
      <!-- a&#45;&gt;b -->
      <g id="edge1" class="edge">
        <title>a->b</title>
        <path fill="none" stroke="black" d="M27,-71.7C27,-64.41 27,-55.73 27,-47.54"></path>
        <polygon fill="black" stroke="black" points="30.5,-47.62 27,-37.62 23.5,-47.62 30.5,-47.62"></polygon>
      </g>
    </g>
  </svg>
</div>
```

## Options

### `graphviz`

`@phcc-js/wasm/graphviz`'s `Graphviz` instance.

- **See:** https://hpcc-systems.github.io/hpcc-js-wasm/getting-started.html

- **Example:**

  ```js
  import { Graphviz } from "@hpcc-js/wasm/graphviz";
  const options = {
    graphviz: await Graphviz.load(),
  };
  ```

- **Type:**[`Graphviz`](https://hpcc-systems.github.io/hpcc-js-wasm/classes/graphviz.Graphviz.html)

### `langAssociations`

Language associations.

- **Default value:**

  ```js
  {
    dot: ["graphviz"];
  }
  ```

- **Example:**

  Generage graphviz diagram from `graphviz`, `graphviz-diagram`, and `graphviz-dot` language code blocks:

  ```js
  const options = {
    langAssociations: {
      dot: ["graphviz", "graphviz-diagram", "graphviz-dot"],
    },
  };
  ```

- **Type:**

  ```ts
  Readonly<{
    dot?: readonly string[];
  }>;
  ```

### `tagName`

Tag name for the container element of the graphviz diagram.

- **Default value:** `"div"`
- **Example:**

  ```js
  const options = {
    tagName: "figure",
  };
  ```

  Yields:

  ```html
  <figure>
    <svg>...</svg>
  </figure>
  ```

- **Type:** `string`

### `properties`

Properties to be added to the container element of the graphviz diagram.

- **Default value:**

  ```js
  {
    className: "graphviz-diagram",
    style: "overflow: auto;",
  }
  ```

- **Example:**

  ```js
  const options = {
    properties: {
      className: "graphviz",
      style: "overflow: clip;",
    },
  };
  ```

  Yields:

  ```html
  <div class="graphviz" style="overflow: clip;">
    <svg>...</svg>
  </div>
  ```

- **Type:** [`Properties`](https://github.com/syntax-tree/hast?tab=readme-ov-file#properties)

### ~~`className`~~ (deprecated)

> [!WARNING]
> Use [`properties.className`](#properties) instead. When both are set, [`properties.className`](#properties) will be used.

Class name to be added to the container element of the graphviz diagram.

- **Default value:** `"graphviz-diagram"`

- **Example:**

  ```js
  const options = {
    className: "graphviz",
  };
  ```

  Yields:

  ```html
  <div class="graphviz-diagram graphviz">
    <svg>...</svg>
  </div>
  ```

- **Type:** `string`

### ~~`style`~~ (deprecated)

> [!WARNING]
> Use [`properties.style`](#properties) instead. When both are set, [`properties.style`](#properties) will be used.

Style to be added to the container element of the graphviz diagram.

- **Default value:** "overflow: auto;"

- **Example:**

  ```js
  const options = {
    style: "overflow: clip;",
  };
  ```

  Yields:

  ```html
  <div style="overflow: clip;">
    <svg>...</svg>
  </div>
  ```

- **Type:** `string`

### `postProcess`

Post processing function for rendered SVG element.

- **Default value:** `(svg) => svg`

- **Example:**

  ```js
  // Replace black and white colors with currentColor and background-primary
  // for dark mode support.
  const options = {
    postProcess: (svg) =>
      svg
        .replaceAll(/("#000"|"black")/g, `"currentColor"`)
        .replaceAll(/("#fff"|"white")/g, `"var(--background-primary)"`),
  };
  ```

- **Type:** `(svg: string) => string`

  - **Parameters:**
    - `svg`: SVG element as string
  - **Returns:** post processed SVG element as string

## Development

### Commands

| Command         | Description          |
| --------------- | -------------------- |
| `bun install`   | Install dependencies |
| `bun run build` | Build the project    |
| `bun run test`  | Run tests            |
| `bun run check` | Lint and format      |

This project was created using `bun init` in bun v1.0.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

### Versioning

1. Commit changes
2. Run `bun run changeset`
3. Push to GitHub

## License

MIT License © 2023-2024 rai
