import type { PartialDeep, Promisable, RequiredDeep } from "type-fest";
import { safeHtml } from "common-tags";
import { dset as deepSet } from "dset";
import { isString, mergeDeep } from "remeda";

type DomProvider<T> = new (html: string) => T;
type InferDomType<T> = T extends DomProvider<infer U> ? U : never;

type DomWithBody = {
  window: {
    document: {
      body: Element;
    };
  };
};

type PrepareSvgServerSideRendererParams<T extends DomProvider<DomWithBody>> = {
  domProvider: T;
  d3Instance: typeof import("d3");
};

type PrepareSvgServerSideRender<T extends DomWithBody> = ({
  currentDom,
  d3Selection,
  svgNode,
}: {
  currentDom: T;
  d3Selection: import("d3").Selection<SVGSVGElement, unknown, null, undefined>;
  svgNode: SVGSVGElement;
}) => Promisable<void> | Promisable<string>;

type NumericString = `${number}` | `${number}e${number}` | `${number}E${number}`;

type SvgViewbox = `${NumericString},${NumericString},${NumericString},${NumericString}` | `${NumericString} ${NumericString} ${NumericString} ${NumericString}`;

type PrepareSvgServerSideRenderOptions = PartialDeep<{
  svg: {
    width: number;
    height: number;
    viewBox: SvgViewbox;
  };
  safe: boolean;
  asBase64: boolean;
}>;

const DEFAULT_RENDER_OPTIONS: RequiredDeep<PrepareSvgServerSideRenderOptions> = {
  svg: {
    width: 100,
    height: 100,
    viewBox: "0 0 100 100",
  },
  safe: true,
  asBase64: false,
};

export function prepareSvgServerSideRenderer<T extends DomProvider<DomWithBody>>({
  d3Instance,
  domProvider,
}: PrepareSvgServerSideRendererParams<T>) {
  type DomType = InferDomType<T>;

  const dom = new domProvider("<body></body>") as DomType;
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
    fn: PrepareSvgServerSideRender<DomType>,
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
      .attr("height", renderOptions.svg.height)
      .attr("viewBox", renderOptions.svg.viewBox)

    const result = await fn({
      currentDom: dom,
      svgNode: svg,
      d3Selection: d3SelectedSvg,
    });

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

