import { describe, it, expect } from "vitest";
import { toSvgBase64 } from "../src/utils";

describe("toSvgBase64", () => {
  it("should convert SVG string to base64", () => {
    const svgString =
      '<svg><rect x="10" y="10" width="100" height="100" /></svg>';

    const base64 = toSvgBase64(svgString);

    expect(base64).toContain(
      "PHN2Zz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiAvPjwvc3ZnPg=="
    );
  });
})
