$(window).ready(function() {

	var $document = $(document);
	var $body = $(document.body);

	// variable to hold objects that are shared across modules
	var share = {};
	// the simulator instance
	var p3sim = share.p3js = window.p3sim = new p3js.Simulator();

	// helper functions

	share.downloadBuffer = function(buffer, name) {
		var blob = new Blob([buffer], { type: "application/octet-stream" });
		var url = URL.createObjectURL(blob);
		var a = document.createElement("a");
		if ("download" in a) {
			a.href = url;
			a.download = (name ? name : "file");
			a.dispatchEvent(new MouseEvent("click"));
		} else {
			window.location = url;
		}
		setTimeout(function() {
			URL.revokeObjectURL(url);
		});
	}

	// fullscreen
	function request_fullscreen(elem) {
		var fn = (
			elem.requestFullscreen || elem.msRequestFullscreen ||
			elem.mozRequestFullScreen || elem.webkitRequestFullscreen
		);
		if (fn) fn.apply(elem);
	}
	function exit_fullscreen() {
		var fn = (
			document.exitFullscreen || document.msExitFullscreen ||
			document.mozCancelFullScreen || document.webkitExitFullscreen
		);
		if (fn) fn.apply(document);
	}
	$("#fullscr").click(function() {
		if ($body.hasClass("fullscreen")) {
			exit_fullscreen();
		} else {
			request_fullscreen(document.documentElement);
		}
		return false;
	});
	$(document).on("webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange", function() {
		if ($body.hasClass("fullscreen")) {
			$body.removeClass("fullscreen");
			$document.trigger("fullscreenoff");
		} else {
			$body.addClass("fullscreen");
			$document.trigger("fullscreenon");
		}
	});

	// tabs
	var $all_tab_lis = $(".nav-tabs li");
	var $all_tabs = $(".tab-page");
	$(window).on("load hashchange", function() {
		var hash = window.location.hash.substr(1);
		if (hash == "assembler") {
			if (history.replaceState !== undefined) {
				history.replaceState({ }, document.title, window.location.pathname);
			} else {
				window.location.hash = "";
				return;
			}
		} else if (hash == "") {
			hash = "assembler";
		}
		var $tab = $(".tab-page-" + hash);
		if ($tab.length > 0) {
			$all_tabs.addClass("hidden");
			$tab.removeClass("hidden");
			$all_tab_lis.removeClass("active");
			$("a[href=\"#" + hash + "\"]", $all_tab_lis).parent().addClass("active");
		}
	});

	// load other modules

	require("./tab-assembler.js")(share, p3sim);
	require("./tab-program.js")(share, p3sim);
	require("./tab-simulator.js")(share, p3sim);
	require("./tab-io.js")(share, p3sim);

});
