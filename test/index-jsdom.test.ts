import { describe, it, expect } from "vitest";
import { prepareSvgServerSideRenderer } from "../src/index.js";

import { JSDOM } from "jsdom";

import * as d3 from "d3";

describe("prepareSvgServerSideRenderer (jsdom)", () => {
  it("should create SVG with default options", async () => {
    const { render } = prepareGenericRenderer();

    const result = await render(() => { });

    expect(result).toContain("<svg");
    expect(result).toContain('width="100"');
    expect(result).toContain('height="100"');
  });

  it("should create SVG with custom dimensions options", async () => {
    const { render } = prepareGenericRenderer();

    const result = await render(() => { }, {
      svg: {
        width: 200,
        height: 300
      }
    });

    expect(result).toContain("<svg");
    expect(result).toContain('width="200"');
    expect(result).toContain('height="300"');
  });


  it("should create SVG with custom viewbox options", async () => {
    const { render } = prepareGenericRenderer();

    const result = await render(() => { }, {
      svg: {
        viewBox: "0 0 34 34"
      }
    });

    expect(result).toContain("<svg");
    expect(result).toContain('viewBox="0 0 34 34"');
  });

  it("should create SVG with asynchronous operation in render function", async () => {
    const { render } = prepareGenericRenderer();
    const dummyAsynchronousOperation = async () => {
      return "asynchronous result";
    };

    const result = await render(async ({ d3Selection }) => {
      const asyncOperationResult = await dummyAsynchronousOperation();
      d3Selection.html(asyncOperationResult);
    });

    expect(result).toContain("<svg");
    expect(result).toContain("asynchronous result");
  });

  it("should create SVG with custom rendering function", async () => {
    const { render } = prepareGenericRenderer();

    const result = await render(({ d3Selection }) => {
      d3Selection
        .append("circle")
        .attr("cx", 50)
        .attr("cy", 50)
        .attr("r", 40);
    });

    expect(result).toContain("<svg");
    expect(result).toContain('<circle cx="50" cy="50" r="40">');
  });

  it("should create SVG safely by setting sanitized using innerHTML directly", async () => {
    const { render } = prepareGenericRenderer();

    const result = await render(({ svgNode }) => {
      svgNode.innerHTML = '<script>alert("xss")</script>';
    });

    expect(result).toContain("<svg");
    expect(result).not.toContain("<script>");
  });

  it("should create SVG unsafely by setting sanitized using innerHTML directly", async () => {
    const { render } = prepareGenericRenderer();

    const result = await render(
      ({ svgNode }) => {
        svgNode.innerHTML = '<script>alert("xss")</script>';
      },
      {
        safe: false
      }
    );

    expect(result).toContain("<svg");
    expect(result).toContain("<script>");
  });

  it("should create SVG as base64 when options.asBase64 is true", async () => {
    const { render } = prepareGenericRenderer();

    const result = await render(
      ({ d3Selection }) => {
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

function prepareGenericRenderer() {
  return prepareSvgServerSideRenderer({
    domProvider: JSDOM,
    d3Instance: d3
  });
}
