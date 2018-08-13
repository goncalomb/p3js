/*
 * Copyright (c) 2016, 2017 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

import tab_assembler from './tab-assembler.js';
import tab_io from  './tab-io.js';
import tab_program from  './tab-program.js';
import tab_roms from  './tab-roms.js';
import tab_simulator from  './tab-simulator.js';

export function downloadBuffer(buffer, name) {
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

export function createDraggableElement($element) {
  var $handle = $("<div>").prependTo($element);
  $("<i>").addClass("fa fa-arrows").appendTo($handle);
  $(document.createTextNode(" Drag Me")).appendTo($handle);
  var bring_to_top = function() {
    $(".ui-draggable").css("z-index", 0);
    $element.css("z-index", 50);
  };
  $element.click(bring_to_top);
  $element.draggable({
    handle: $handle,
    start: bring_to_top
  });
};

$(window).ready(function() {

  var $document = $(document);
  var $body = $(document.body);

  // the simulator instance
  var p3sim = window.p3sim = new p3js.SimulatorWithIO();

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
  function fullscreen_toogle() {
    if ($body.hasClass("fullscreen")) {
      exit_fullscreen();
    } else {
      request_fullscreen(document.documentElement);
    }
  }
  $(document).on("webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange", function() {
    if ($body.hasClass("fullscreen")) {
      $body.removeClass("fullscreen");
      $document.trigger("fullscreenoff");
    } else {
      $body.addClass("fullscreen");
      $document.trigger("fullscreenon");
    }
  });
  // event for fullscreen button
  $("#fullscr").click(function() {
    fullscreen_toogle();
    return false;
  });
  // F11 doesn't trigger fullscreenchange, so we hijack the key
  $(document).on("keydown", function(e) {
    if (e.which == 122) {
      fullscreen_toogle();
      return false;
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
    } else if (hash == "io" && $(document.body).hasClass("sim-io-visible")) {
      return;
    }
    var $tab = $(".tab-page-" + hash);
    if ($tab.length > 0) {
      $all_tabs.addClass("hidden");
      $tab.removeClass("hidden");
      $all_tab_lis.removeClass("active");
      $("a[href=\"#" + hash + "\"]", $all_tab_lis).parent().addClass("active");
      $(document).trigger("p3js-tab-change", hash);
    }
  });

  tab_assembler(p3sim);
  tab_io(p3sim);
  tab_program(p3sim);
  tab_roms(p3sim);
  tab_simulator(p3sim);
});
