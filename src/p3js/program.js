var program = module.exports = { };

program.P3AS_MAGIC_NUMBER = 56347333;
program.P3AS_MAGIC_NUMBER_OLD = 936854375;

program.writeProgram = function(memory, oldFormat, usedAddresses) {
	var view_mem = new DataView(memory);
	var buffer = new ArrayBuffer(memory.byteLength * 2);
	var view = new DataView(buffer);
	var p = 0; // position on the output buffer
	if (!oldFormat) {
		view.setUint32(0, this.P3AS_MAGIC_NUMBER, true); // 32bit integer
		p = 4;
	} else {
		view.setUint32(0, this.P3AS_MAGIC_NUMBER_OLD, true); // 64bit integer
		view.setUint32(4, 0, true);
		p = 8
	}
	for (var i = 0, l = memory.byteLength; i < l; i += 2) {
		if (usedAddresses) {
			if (!usedAddresses[i/2]) {
				continue;
			}
		} else if (view_mem.getInt16(i, true) == 0) {
			continue;
		}
		var length_pos = p;
		p += 2;
		// write address of block
		view.setInt16(p, i/2, true);
		p += 2;
		// write data
		var j = i;
		for (; j < l; j += 2) {
			var v = view_mem.getInt16(j, true);
			if (usedAddresses) {
				if (!usedAddresses[j/2]) {
					break;
				}
			} else if (v == 0) {
				break;
			}
			view.setInt16(p, v, true);
			p += 2;
		}
		// write length of block
		view.setInt16(length_pos, (j - i)/2, true);
		i = j;
	}
	view.setInt16(p, 0, true);
	p += 2;
	return buffer.slice(0, p);
}
