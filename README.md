# P3JS #

P3JS is a JavaScript assembler and simulator for the P3 CPU.

**Live P3 simulator at [p3js.goncalomb.com](http://p3js.goncalomb.com/).**

The P3 is a 16-bit CPU used at Instituto Superior Técnico (IST) as a learning tool for Computer Engineering students.

This repository contains an API and 2 implementations (web and terminal).

## Quick Start ##

### Online Assembler and Simulator ###

If you just want to use the assembler and simulator NOW, go to [p3js.goncalomb.com](http://p3js.goncalomb.com/).

### Local Assembler and Simulator (web) ###

* Install [node.js](https://nodejs.org/) (required to build the .js bundles).
* Run `npm install`.
* Visit `www/index.html` on your browser.

This still requires an Internet connection when first opening the browser (to download some required .css and .js files), I'll change this in the future.

### Local Assembler and Simulator (terminal)

(This is a early prototype, it needs more work.)

* Install [node.js](https://nodejs.org/) (required to run the code).
* Run `npm install`.
* To asssemble a program run: `node p3as.js YOUR_PROGRAM.as`.
* To run a program on the simulator: `node p3sim.js YOUR_PROGRAM.as` (it also assembles the program).

## Documentation ##

See [doc/index.md](doc/index.md) for the documentation about the CPU and the simulator (under construction).

## The Future (what needs to be done) ##

* **Assembler API** (src/p3js/assembly/\*):
    * Cleanup and modularize the parser and assembler;
    * Implement API to allow custom instructions (and opcodes);
    * Implement disassembler;
* **Simulator API** (src/p3js/\*):
    * Implement breakpoint API;
    * Implement Web Worker API (simulator/cpu) to take advantage of multiple threads (maybe?), make some performance tests first;
* **Web Simulator** (src/p3js-web/\*):
    * Modularize the code;
    * Remove Internet dependency when running locally (by creating script to download the required .css and .js files);
    * Create UI for the disassembler and breakpoints (requires API code first);
    * Create UI to allow custom instructions (requires API code first);
* **Local Assembler** (p3as.js):
    * Cleanup the code;
    * Add option to output references;
    * Add option to output raw memory image;
    * Add option to allow custom instructions (requires API code first);
* **Local Simulator** (p3sim.js):
    * Cleanup the code;
    * Add option to auto-assemble code;
    * Add option to set custom ROMs;
    * Add help screen;

## License ##

P3JS is released under the terms of the MIT License. See [LICENSE.txt](LICENSE.txt) for details.
