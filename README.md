# d3-no-dom

Fully use [`d3.js`][d3] in environments without DOM, such as [Cloudflare Workers][cfworkers] or [Vercel Functions][vercel-functions]

## Features

- Extensible and simple API. 
- Support for asynchronous operations and API calls in render function
- Utilities like sanitizing the HTML or outputting the base64 from generated svg
- Tests covering most of the functionality ensuring robustness

## Installation

`d3-no-dom`'s `peerDependencies` are [`jsdom`][jsdom] and [`d3`][d3]. These ones are not bundled into this package itself for extensibility purposes - `d3-no-dom` is just a wrapper around these libraries' functionality

```sh
npm i d3-no-dom d3 jsdom
# or
yarn add d3-no-dom d3 jsdom
# or
pnpm add d3-no-dom d3 jsdom 
```

## How to use

1. At first, you must supply the own peerDepenndencies' instances to the `d3-no-dom`

  ```ts
  import * as d3 from "d3"
  import { JSDOM } from "jsdom"

  // ...

  const { render } = prepareSvgServerSideRenderer({
    jsdomInstance: JSDOM,
    d3Instance: d3
  });
  ```

2. Next, use the render function. It provides everything you need in order to fully use d3.js on the server side (the underlying mechanism is integration with Virtual DOM)

  ```ts
  //               you can make e.g. API calls here   
  //           it can also be synchronous if not needed!
  //              ╭────────────┤
  //              │            │    
  //              ↓            ↓ 
  const result = await render(async ({ d3Selection, svgNode, currentDom }) => {
  //      ↑                                  ↑        ↑          ↑            
  //      │                d3 selected       │        │          │
  //      │                object to work on ╯        │          ╰ whole DOM  
  //      │                                      underlying
  //      ╰ rendered svg's                 svg DOM node to work on
  //   source, as HTML or base64   
  })
  ```

3. (Optionally) adjust your configuration or [prepareSvgRenderer's options](
https://github.com/neg4n/d3-no-dom/blob/main/src/index.ts#L11-L13) or the [render function's options](
https://github.com/neg4n/d3-no-dom/blob/main/src/index.ts#L26-L33) directly in order to e.g. disable sanitizing
the HTML or control the return value _(whether it should be HTML or base64 - where second is specifically useful with usage with [satori][satori])_

### License & contributing

The MIT License. All contributions are welcome!

[vercel-functions]: https://vercel.com/docs/functions#vercel-functions
[cfworkers]: https://workers.cloudflare.com/
[jsdom]: https://github.com/jsdom/jsdom
[d3]: https://d3js.org/
[satori]: https://github.com/vercel/satori

