import { describe, it, expect } from "vitest";
import { prepareSvgServerSideRenderer, toSvgBase64 } from "../src/index.js";

import { JSDOM } from "jsdom";
import * as d3 from "d3";

describe("prepareSvgServerSideRenderer", () => {
  it("should render SVG with default options", async () => {
    const { render } = prepareGenericRenderer();
    const result = await render(async () => {});

    expect(result).toContain("<svg");
    expect(result).toContain('width="100"');
    expect(result).toContain('height="100"');
  });

  it("should render SVG with custom options", async () => {
    const { render } = prepareGenericRenderer();
    const result = await render(async () => {}, {
      svg: {
        width: 200,
        height: 300
      }
    });

    expect(result).toContain("<svg");
    expect(result).toContain('width="200"');
    expect(result).toContain('height="300"');
  });

  it("should render SVG with custom rendering function", async () => {
    const { render } = prepareGenericRenderer();
    const result = await render(async ({ d3Selection }) => {
      d3Selection
        .append("circle")
        .attr("cx", 50)
        .attr("cy", 50)
        .attr("r", 40);
    });

    expect(result).toContain("<svg");
    expect(result).toContain('<circle cx="50" cy="50" r="40">');
  });

  it("should render SVG safely by setting sanitized using innerHTML directly", async () => {
    const { render } = prepareGenericRenderer();
    const result = await render(async ({ svgNode }) => {
      svgNode.innerHTML = '<script>alert("xss")</script>';
    });

    expect(result).toContain("<svg");
    expect(result).not.toContain("<script>");
  });

  it("should render SVG unsafely by setting sanitized using innerHTML directly", async () => {
    const { render } = prepareGenericRenderer();

    const result = await render(
      async ({ svgNode }) => {
        svgNode.innerHTML = '<script>alert("xss")</script>';
      },
      {
        safe: false
      }
    );

    expect(result).toContain("<svg");
    expect(result).toContain("<script>");
  });

  it("should render SVG as base64 when options.asBase64 is true", async () => {
    const { render } = prepareGenericRenderer();
    const result = await render(
      async ({ d3Selection }) => {
        d3Selection
          .append("circle")
          .attr("cx", 50)
          .attr("cy", 50)
          .attr("r", 40);
      },
      {
        asBase64: true
      }
    );

    expect(result).toContain("data:image/svg+xml;base64,");
  });
});

describe("toSvgBase64", () => {
  it("should convert SVG string to base64", () => {
    const svgString =
      '<svg><rect x="10" y="10" width="100" height="100" /></svg>';
    const base64 = toSvgBase64(svgString);

    expect(base64).toContain(
      "data:image/svg+xml;base64,JTNDc3ZnJTNFJTNDcmVjdCUyMHglM0QlMjIxMCUyMiUyMHklM0QlMjIxMCUyMiUyMHdpZHRoJTNEJTIyMTAwJTIyJTIwaGVpZ2h0JTNEJTIyMTAwJTIyJTIwJTJGJTNFJTNDJTJGc3ZnJTNF"
    );
  });
});

function prepareGenericRenderer() {
  return prepareSvgServerSideRenderer({
    jsdomInstance: JSDOM,
    d3Instance: d3
  });
}
