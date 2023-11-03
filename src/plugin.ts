import { Graphviz } from "@hpcc-js/wasm/graphviz";
import type { ElementContent, Root } from "hast";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { type Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Options for `rehypeGraphviz`.
 */
export type RehypeGraphvizOption = Readonly<{
  /**
   * `@phcc-js/wasm/graphviz`'s `Graphviz` instance.
   * @see https://hpcc-systems.github.io/hpcc-js-wasm/getting-started.html
   * @example
   * ```js
   * import { Graphviz } from "@hpcc-js/wasm/graphviz";
   * const options = {
   *   graphviz: await Graphviz.load(),
   * }
   * ```
   */
  graphviz: Graphviz;

  /**
   * Language associations.
   * @default
   * ```json
   * { "dot": ["graphviz"] }
   * ```
   * @example
   * Generage graphviz diagram from `graphviz`, `graphviz-diagram`, and `graphviz-dot` language code blocks:
   * ```js
   * const options = {
   *   langAssociations: {
   *     dot: ["graphviz", "graphviz-diagram", "graphviz-dot"],
   *   }
   * }
   * ```
   */
  langAssociations?: Readonly<{
    dot?: readonly string[];
  }>;

  /**
   * Class name to be added to the container element of the graphviz diagram.
   * @default "graphviz-diagram"
   * @example
   * ```js
   * const options = {
   *   className: "graphviz",
   * }
   * ```
   * Yield:
   * ```html
   * <div class="graphviz">
   *   <svg>...</svg>
   * </div>
   * ```
   */
  className?: string;

  /**
   * Style to be added to the container element of the graphviz diagram.
   * @default "overflow: auto;"
   * @example
   * ```js
   * const options = {
   *   style: "overflow: clip;"
   * }
   * ```
   * Yield:
   * ```html
   * <div style="overflow: clip;">
   *   <svg>...</svg>
   * </div>
   * ```
   */
  style?: string;

  /**
   * Post processing function for rendered SVG element.
   * @argument svg - SVG element as string
   * @returns post processed SVG element as string
   * @default (svg) => svg
   * @example
   * ```js
   * // Replace black and white colors with currentColor and background-primary
   * // for dark mode support.
   * const options = {
   *   postProcess: (svg) => svg
   *     .replaceAll(/("#000"|"black")/g, `"currentColor"`)
   *		 .replaceAll(/("#fff"|"white")/g, `"var(--background-primary)"`)
   * }
   * ```
   */
  postProcess?: (svg: string) => string;
}>;

export const defaultRehypeGraphvizOption = {
  graphviz: await Graphviz.load(),
  langAssociations: {
    dot: ["graphviz"],
  },
  className: "graphviz-diagram",
  style: "overflow: auto;",
  postProcess: (svg: string) => svg,
} as const satisfies Required<RehypeGraphvizOption>;

export const rehypeGraphviz: Plugin<[RehypeGraphvizOption], Root> = (
  options,
) => {
  const mergedOptions: Required<RehypeGraphvizOption> = {
    ...defaultRehypeGraphvizOption,
    ...options,
  };

  const graphviz = mergedOptions.graphviz;

  return (tree, file) => {
    visit(tree, "element", (code, index, pre) => {
      // check if the current node is a block code element
      // if not, return
      if (
        code.tagName !== "code" ||
        pre?.type !== "element" ||
        pre.tagName !== "pre" ||
        index === undefined
      ) {
        return;
      }

      // check if the language is dot
      const lang = getLangFromClassNames(
        code.properties.className as string[],
        mergedOptions.langAssociations,
      );
      if (lang !== "dot") return;

      // check if the current code is not empty
      if (code.children.length === 0 || code.children[0].type !== "text") {
        return;
      }

      // Generate SVG from the code
      const dotCode = code.children[0].value;
      const svg = mergedOptions.postProcess(graphviz.dot(dotCode));
      const svgHast = fromHtmlIsomorphic(svg, {
        fragment: true,
      });

      // update the node to be a generated SVG
      pre.properties.className = mergedOptions.className;
      pre.properties.style = mergedOptions.style;
      pre.tagName = "div";
      pre.children = svgHast.children as ElementContent[];

      // biome-ignore lint/style/noParameterAssign:
      index += 1; // skip the generated SVG

      return index;
    });
  };
};

const getLangFromClassNames = (
  classNames?: string[],
  associations: Required<RehypeGraphvizOption>["langAssociations"] = {},
) => {
  const prefix = "language-" as const;
  const lang = classNames
    ?.find((className) => className.startsWith(prefix))
    ?.slice(prefix.length);

  for (const [mappedLang, patterns] of Object.entries(associations)) {
    for (const pattern of patterns) {
      if (lang?.match(pattern)) return mappedLang;
    }
  }
  return lang;
};
