import type { PartialDeep, Promisable, RequiredDeep } from "type-fest";
import { safeHtml } from "common-tags";
import { dset as deepSet } from "dset";
import { clone, isString, mergeDeep } from "remeda";
import type { BaseType as D3BaseType } from "d3";

type DomProvider<T> = new (html: string) => T;
type InferDomType<T> = T extends DomProvider<infer U> ? U : never;

type DomWithBody = {
  window: Window
};

type PrepareSvgServerSideRendererParams<T extends DomProvider<DomWithBody>> = {
  domProvider: T;
  d3Instance: typeof import("d3");
};

type D3Selection<T extends D3BaseType> = import("d3").Selection<T, unknown, null, undefined>;

type PrepareSvgServerSideRender<T extends DomWithBody> = ({
  currentDom,
  d3Selection,
  svgNode,
}: {
  currentDom: T;
  d3Selection: D3Selection<SVGSVGElement>
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

  const render = async (
    fn: PrepareSvgServerSideRender<DomType>,
    options: PrepareSvgServerSideRenderOptions = {},
  ) => {
    const renderOptions = mergeDeep(
      DEFAULT_RENDER_OPTIONS,
      options,
    ) as RequiredDeep<PrepareSvgServerSideRenderOptions>;
    const svgNode = dom.window.document.createElementNS("http://www.w3.org/2000/svg", "svg")

    dom.window.document.body.appendChild(svgNode)

    svgNode.setAttribute("width", `${renderOptions.svg.width}`);
    svgNode.setAttribute("height", `${renderOptions.svg.height}`);
    svgNode.setAttribute("viewBox", `${renderOptions.svg.viewBox}`);

    const svgToOperate = renderOptions.safe ? new Proxy(svgNode, {
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
    }) : svgNode

    const result = await fn({
      currentDom: dom,
      svgNode: svgToOperate,
      d3Selection: body.select("svg"),
    });

    const renderedHtmlString = clone(isString(result) ? result : svgToOperate.outerHTML)
    dom.window.document.body.removeChild(svgNode)
    return renderOptions.asBase64 ? toSvgBase64(renderedHtmlString) : renderedHtmlString
  };

  return {
    render,
  };
}

export function toSvgBase64(string: string) {
  const base64String = btoa(string);
  return `data:image/svg+xml;base64,${base64String}`;
}

