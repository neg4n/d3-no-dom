import * as d3 from "d3";
import type { PartialDeep, RequiredDeep } from "type-fest";
import { JSDOM, type ConstructorOptions as JsDomOptions } from "jsdom";
import { safeHtml } from "common-tags";
import { dset as deepSet } from "dset";
import { isString, mergeDeep } from "remeda";

type PrepareSvgServerSideRenderOptions = {
  svg?: PartialDeep<{
    width: number;
    height: number;
  }>;
  safe?: boolean;
  asBase64?: boolean;
  dom?: JsDomOptions;
};

type PrepareSvgServerSideRenderParams = {
  options?: PrepareSvgServerSideRenderOptions;
};

type SvgServerSideRenderParams = {
  dom: JSDOM;
  d3: typeof d3;
  svg: SVGSVGElement;
};

type PrepareSvgServerSideRendererFn = ({
  dom,
  d3,
  svg,
}: SvgServerSideRenderParams) => Promise<void> | Promise<string>;

const DEFAULT_OPTIONS: PrepareSvgServerSideRenderOptions = {
  svg: {
    width: 100,
    height: 100,
  },
  safe: true,
  asBase64: false,
  dom: {
    pretendToBeVisual: true,
  },
};

export function prepareSvgServerSideRenderer({
  options: incomingOptions = {},
}: PrepareSvgServerSideRenderParams) {
  const options = mergeDeep(
    DEFAULT_OPTIONS,
    incomingOptions,
  ) as RequiredDeep<PrepareSvgServerSideRenderOptions>;

  const dom = new JSDOM("<body></body>", options.dom);
  const body = d3.select(dom.window.document.body);

  const createPaintingArea = () =>
    body
      .append("svg")
      .attr("id", "painting-area")
      .attr("width", options.svg.width)
      .attr("height", options.svg.height)
      .node()!;

  const svgElement = createPaintingArea();

  const safeSvgElement = new Proxy(svgElement, {
    set(target, property, value) {
      const allowedProps = ["innerHTML", "outerHTML"];
      if (
        allowedProps.includes(property.toString()) &&
        typeof value === "string"
      ) {
        deepSet(target, property.toString(), safeHtml`${value}`);
        return true;
      }

      deepSet(target, property.toString(), value);
      return true;
    },
  });

  const render = async (fn: PrepareSvgServerSideRendererFn) => {
    const svg = options.safe ? safeSvgElement : svgElement;
    const result = await fn({ dom, svg, d3 });

    if (options.asBase64) {
      if (isString(result)) return toSvgBase64(result);
      return toSvgBase64(svg.outerHTML);
    }

    return isString(result) ? result : svg.outerHTML;
  };

  const clear = async () => {
    const svg = options.safe ? safeSvgElement : svgElement;
    svg.innerHTML = "";
  };

  return {
    render,
    clear,
  };
}

export function toSvgBase64(string: string) {
  const base64String = btoa(encodeURIComponent(string));
  return `data:image/svg+xml;base64,${base64String}`;
}
