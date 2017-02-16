# P3JS #

P3JS is a JavaScript assembler and simulator for the P3 CPU.

**Live P3 simulator at [p3js.goncalomb.com](http://p3js.goncalomb.com/).**

The P3 is a 16-bit CPU used at Instituto Superior Técnico (IST) as a learning tool for Computer Engineering students.

This repository contains an API and 2 implementations (web and terminal).

## Online Assembler and Simulator (web) ##

If you just want to use the assembler and simulator NOW, go to [p3js.goncalomb.com](http://p3js.goncalomb.com/).

## Local Installation and Usage

* Install [node.js](https://nodejs.org/).
* Run `npm install` to download the dependencies and build everything.

### Assembler and Simulator (web) ###

* Run `npm start` to start a dev-server and open your default browser.
* OR open `www/index.html` on your browser (you won't be able to load the demos this way).

This still requires an Internet connection when first opening the browser (to download some required .css and .js files), I'll change this in the future.

### Assembler (terminal) `node p3as.js`

To assemble a program: `node p3as.js YOUR_PROGRAM.as`.

#### Command-line options

* `-o OUTPUT_FILE` to set a custom output file (defaults to YOUR_PROGRAM.exe);
* `--show-refs` to show the references;

### Simulator (terminal) `node p3sim.js`

To run a program on the simulator: `node p3sim.js YOUR_PROGRAM.as` (it also assembles the program).

#### Controls

* `Ctrl-A`: change the keyboard focus between the terminal (TERM), interruptions (INT) and the switches (SWT);
* `Ctrl-C`: exit the simulator;
* `Ctrl-R`: reset the simulator;
* `Ctrl-S`: start/stop the simulator;

##### Keyboard Focus (Ctrl-A)

* `TERM`: sends keystrokes to the terminal;
* `INT`: use the keys 0-9 and A-F to trigger interrupts;
* `SWT`: use the keys 0-7 toggle the switches;

## P2 CPU Documentation ##

See [goncalomb.github.io/p3doc/](https://goncalomb.github.io/p3doc/) for the documentation about the CPU itself.

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
    * Add option to output references to a file;
    * Add option to output raw memory image;
    * Add option to allow custom instructions (requires API code first);
* **Local Simulator** (p3sim.js):
    * Cleanup the code;
    * Add option to auto-assemble code;
    * Add option to set custom ROMs;
    * Add help screen;

## License ##

P3JS is released under the terms of the MIT License. See [LICENSE.txt](LICENSE.txt) for details.
