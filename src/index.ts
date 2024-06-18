import type { PartialDeep, RequiredDeep } from "type-fest";
import type {  ConstructorOptions as JsDomOptions } from "jsdom";
import { safeHtml } from "common-tags";
import { dset as deepSet } from "dset";
import { isString, mergeDeep } from "remeda";


type PrepareSvgServerSideRendererParams = {
  jsdomInstance: typeof import("jsdom").JSDOM;
  d3Instance:  typeof import("d3");
  options?: {
    dom?: JsDomOptions;
  };
};

type PrepareSvgServerSideRender = ({
  currentDom,
  d3Selection,
  svgNode,
}: {
  currentDom: import("jsdom").JSDOM;
  d3Selection: import("d3").Selection<SVGSVGElement, unknown, null, undefined>;
  svgNode: SVGSVGElement;
}) => Promise<void> | Promise<string>;

type PrepareSvgServerSideRenderOptions = PartialDeep<{
  svg: {
    width: number;
    height: number;
  };
  safe: boolean;
  asBase64: boolean;
}>;

const DEFAULT_OPTIONS: Pick<PrepareSvgServerSideRendererParams, "options"> = {
  options: {
    dom: {
      pretendToBeVisual: true,
    },
  },
};

const DEFAULT_RENDER_OPTIONS: RequiredDeep<PrepareSvgServerSideRenderOptions> =
  {
    svg: {
      width: 100,
      height: 100,
    },
    safe: true,
    asBase64: false,
  };

export function prepareSvgServerSideRenderer({
  options: incomingRendererOptions = {},
  d3Instance,
  jsdomInstance,
}: PrepareSvgServerSideRendererParams) {
  const rendererOptions = mergeDeep(DEFAULT_OPTIONS, incomingRendererOptions);

  const dom = new jsdomInstance("<body></body>", rendererOptions.dom);
  const body = d3Instance.select(dom.window.document.body);

  const createPaintingArea = () =>
    body.append("svg").attr("id", "painting-area").node()!;

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

  const render = async (
    fn: PrepareSvgServerSideRender,
    options: PrepareSvgServerSideRenderOptions = {},
  ) => {
    const renderOptions = mergeDeep(
      DEFAULT_RENDER_OPTIONS,
      options,
    ) as RequiredDeep<PrepareSvgServerSideRenderOptions>;

    const svg = renderOptions.safe ? safeSvgElement : svgElement;
    const d3SelectedSvg = d3Instance.select(svg);

    d3SelectedSvg
      .attr("width", renderOptions.svg.width)
      .attr("height", renderOptions.svg.height);

    const result = await fn({
      currentDom: dom,
      svgNode: svg,
      d3Selection: d3SelectedSvg,
    });

    // d3SelectedSvg.html(null).attr("width", null).attr("height", null);

    if (renderOptions.asBase64) {
      if (isString(result)) return toSvgBase64(result);
      return toSvgBase64(svg.outerHTML);
    }

    return isString(result) ? result : svg.outerHTML;
  };

  return {
    render,
  };
}

export function toSvgBase64(string: string) {
  const base64String = btoa(encodeURIComponent(string));
  return `data:image/svg+xml;base64,${base64String}`;
}
