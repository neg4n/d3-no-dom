# d3-no-dom

Fully use [`d3.js`][d3] in environments without DOM, such as [Cloudflare Workers][cfworkers] or [Vercel Functions][vercel-functions]

## Features

- Simple API with maximum extensibility. 
- Support for asynchronous operations and API calls in render function
- Utilities like sanitizing the HTML or outputting the base64 from generated svg
- Tests covering most of the functionality ensuring robustness

## Installation

```sh
npm i d3-no-dom d3 
# or
yarn add d3-no-dom d3 
# or
pnpm add d3-no-dom d3 
```

The `d3-no-dom` library does not provide any underlying DOM implementation, giving users the flexibility to choose their preferred DOM library. Some options are:

-  [`linkedom`][linkedom]: A lightweight and fast DOM implementation ideal for serverless environments such as [Cloudflare Workers][cfworkers] or [Vercel Functions][vercel-functions] (recommended).
  ```sh
  npm i linkedom 
  # or
  yarn add linkedom 
  # or
  pnpm add linkedom 
  ```
  
-  [`jsdom`][jsdom]: A more comprehensive and heavier DOM implementation, suitable for traditional backend environments like monolithic applications hosted on dedicated servers.
  ```sh
  npm i jsdom 
  # or
  yarn add jsdom 
  # or
  pnpm add jsdom 
  ```

> [!WARNING]  
> [`jsdom`][jsdom] may not work on the [Cloudflare Workers][cfworkers]
> without specifying `nodejs_compat` flag due to use of the Node native modules


## How to use

1. At first, you must supply your own d3 instance and dom provider to the `d3-no-dom`'s `prepreSvgServerSideRenderer`

  - using [linkedom][linkedom] **(recommended)**
    ```ts
    import * as d3 from "d3"
    import { parseHTML } from "linkedom"

    // ...

    class Linkedom {
      window: { document: Document };
      constructor(html: string) {
        const { document, window } = parseHTML(html);
        this.window = { document };
        Object.assign(this.window, window);
      }
    }

    const { render } = prepareSvgServerSideRenderer({
      domProvider: Linkedom,
      d3Instance: d3
    });
    ```

  - using [jsdom][jsdom]
    ```ts
    import * as d3 from "d3"
    import { JSDOM } from "jsdom"

    // ...

    const { render } = prepareSvgServerSideRenderer({
      domProvider: JSDOM,
      d3Instance: d3
    });
    ```

2. Next, use the `render` function. It provides everything you need in order to fully use d3.js on the server side (the underlying mechanism is integration with Virtual DOM)

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

3. (Optionally) adjust your configuration or the [render function's options](
https://github.com/neg4n/d3-no-dom/blob/main/src/index.ts#L32-L39) directly in order to e.g. disable sanitizing
the HTML or control the return value _(whether it should be HTML or base64 - where second is specifically useful with usage with [satori][satori])_

### License & contributing

The MIT License. All contributions are welcome!

[linkedom]: https://github.com/WebReflection/linkedom
[vercel-functions]: https://vercel.com/docs/functions#vercel-functions
[cfworkers]: https://workers.cloudflare.com/
[jsdom]: https://github.com/jsdom/jsdom
[d3]: https://d3js.org/
[satori]: https://github.com/vercel/satori

