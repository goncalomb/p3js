/*
 * Copyright (c) 2016, 2017 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

export * from './ROMReaderWriter.js';
export * from './Simulator.js';
export * from './SimulatorWithIO.js';

import * as assembly from './assembly/';
import * as devices from './devices/';
import * as io from './io/';
import * as program from './program.js';

export { assembly, devices, io, program };

if (typeof window != 'undefined') {
  window.p3js = this;
}
