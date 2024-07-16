# [2.1.0](https://github.com/neg4n/d3-no-dom/compare/v2.0.0...v2.1.0) (2024-07-16)


### Bug Fixes

* remove separate package for setting obj path ([5027640](https://github.com/neg4n/d3-no-dom/commit/50276408f11c6945dc60ede1481b9e713bdc37a3))
* typings + move utils to separate file ([ce94fd8](https://github.com/neg4n/d3-no-dom/commit/ce94fd829f36e099711929c2ddbfb58aec6d9c25))


### Features

* make dom manipulation more direct ([f22d1ca](https://github.com/neg4n/d3-no-dom/commit/f22d1caab162ee7b4368bb5d0ca07e2219c6a9e7))

# [2.0.0](https://github.com/neg4n/d3-no-dom/compare/v1.0.0...v2.0.0) (2024-07-01)


* feat!: decouple jsdom from the internal mechanisms ([f0d1029](https://github.com/neg4n/d3-no-dom/commit/f0d1029c4c5a109350e45acde3f0ccc496435473))


### Bug Fixes

* remove encodeURIComponent in converting to b64 ([297275d](https://github.com/neg4n/d3-no-dom/commit/297275d0b17017f5f7333f2ad328470b86713585))


### Features

* add ability to modify svg's viewbox ([38b633a](https://github.com/neg4n/d3-no-dom/commit/38b633acf3bbaf64fddd1ed62ff78b446a2541e4))


### BREAKING CHANGES

* From now on, the d3-no-dom does
not depend on any DOM-filling library undernath
and it is up to end user to provide such
functionality via the prepareServerSideSvgRenderer
options (`domProvider`), just like it was done
before with d3 (`d3Instance`)

# 1.0.0 (2024-06-28)


### Bug Fixes

* adjust tests to the decoupling of modules ([1c33bed](https://github.com/neg4n/d3-no-dom/commit/1c33bed2e6ee366617112c86c1505e75b42661c4))


### Features

* allow sync functions in render callback ([7759788](https://github.com/neg4n/d3-no-dom/commit/775978822fde548645a74cbc007561223dcbbdc1))
* reduce dependencies amount ([724aae7](https://github.com/neg4n/d3-no-dom/commit/724aae7a05a1a6411aa6fa17928b55da9528bca9))
* upload base source ([76d31c1](https://github.com/neg4n/d3-no-dom/commit/76d31c14f1431f319d363685b523ab4974eddf83))
