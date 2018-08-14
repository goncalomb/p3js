require('babel-register')({
  presets: ['es2015'],
});

let fs = require("fs");
let path = require("path");
let minimist = require("minimist");

let TerminalUI = require("./src/TerminalUI.js").TerminalUI;
let p3js = require("./src/p3js/");

let argv = minimist(process.argv.slice(2), {
  unknown(opt) {
    if (opt[0] == '-') {
      console.error("Unknown option '" + opt + "'.");
      process.exit(1);
      return false;
    }
  },
});

let p3sim = new p3js.SimulatorWithIO();
let data;
let result;

if (!process.stdin.isTTY || !process.stdout.isTTY) {
  console.error("Not connected to a tty.");
  process.exit(2);
}

if (typeof argv._[0] == "undefined") {
  console.error("No input file.");
  process.exit(3);
}

try {
  data = fs.readFileSync(path.normalize(argv._[0]), "utf8");
} catch (e) {
  console.error(e.message);
  process.exit(4);
}

try {
  result = p3js.assembly.assembleWithDefaultValidator(data);
} catch (e) {
  if (e instanceof p3js.assembly.AssemblerError) {
    console.error("Assembler Error: " + e.getFullMessage());
  } else {
    console.error(e.message);
  }
  process.exit(5);
}

new TerminalUI(p3sim);

p3sim.loadMemory(result.buffer);
p3sim.start();
