require('babel-register')({
  presets: ['es2015'],
});

let fs = require('fs');
let path = require('path');
let minimist = require('minimist');

let p3js = require('./src/p3js/');

let argv = minimist(process.argv.slice(2), {
  string: ['o'],
  boolean: ['show-refs'],
  unknown(opt) {
    if (opt[0] === '-') {
      console.log("Unknown option '" + opt + "'.");
      process.exit(1);
      return false;
    }
  },
});

if (typeof argv._[0] === 'undefined') {
  console.log('No input file.');
  process.exit(2);
}

let input_file = path.normalize(argv._[0]);
let path_parts = path.parse(input_file);
let output_file = path.join(path_parts.dir, path_parts.name + '.exe');

if (typeof argv.o === 'string') {
  output_file = path.normalize(argv.o);
}

let data;
let result;
let buffer;

try {
  data = fs.readFileSync(input_file, 'utf8');
} catch (e) {
  console.error(e.message);
  process.exit(3);
}

console.log("Assembling '" + input_file + "'...");
try {
  result = p3js.assembly.assembleWithDefaultValidator(data);
  buffer = result.buildProgramCode();
} catch (e) {
  if (e instanceof p3js.assembly.AssemblerError) {
    console.error('Assembler Error: ' + e.getFullMessage());
  } else {
    console.error(e.message);
  }
  process.exit(4);
}

console.log('Statistics:');
console.log('  References: ' + result.labelCount);
console.log('  Pseudo Instructions: ' + result.pseudoCount);
console.log('  Instructions: ' + result.instructionCount);
console.log('  Memory: ' + result.getMemoryUsageString());

if (argv['show-refs']) {
  console.log('References:');
  Object.keys(result.labels).forEach((name) => {
    console.log('  ' + name + ': ' +  ('0000' + result.labels[name].toString(16)).substr(-4));
  });
}

console.log("Writing program to '" + output_file + "'...");
try {
  fs.writeFileSync(output_file, Buffer.from(new Uint8Array(buffer)));
} catch (e) {
  console.error(e.message);
  process.exit(5);
}

console.log('Done.');
