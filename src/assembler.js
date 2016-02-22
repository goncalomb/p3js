(function() {

	var p3js = window.p3js = (window.p3js || { });
	var assembler = p3js.assembler = { };
	eval(p3js.extractConstants());

	assembler.assembleData = function(data) {
		var buffer = new ArrayBuffer(MEMORY_SIZE_BYTES);
		var view = new DataView(buffer);

		// TODO: write the assembler!!!

		return buffer;
	};

})();
