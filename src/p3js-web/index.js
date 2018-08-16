/*
 * Copyright (c) 2016, 2017 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

import tab_assembler from './tab-assembler.js';
import tab_io from './tab-io.js';
import tab_program from './tab-program.js';
import tab_settings from './tab-settings.js';
import tab_simulator from './tab-simulator.js';

export function downloadBuffer(buffer, name) {
  let blob = new Blob([buffer], { type: "application/octet-stream" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  if ("download" in a) {
    a.href = url;
    a.download = (name || "file");
    a.dispatchEvent(new MouseEvent("click"));
  } else {
    window.location = url;
  }
  setTimeout(() => {
    URL.revokeObjectURL(url);
  });
}

export function createDraggableElement($element) {
  let $handle = $("<div>").prependTo($element);
  $("<i>").addClass("fa fa-arrows").appendTo($handle);
  $(document.createTextNode(" Drag Me")).appendTo($handle);
  function bring_to_top() {
    $(".ui-draggable").css("z-index", 0);
    $element.css("z-index", 50);
  }
  $element.click(bring_to_top);
  $element.draggable({
    handle: $handle,
    start: bring_to_top,
  });
}

$(window).ready(() => {
  let $document = $(document);
  let $body = $(document.body);

  // the simulator instance
  let p3sim = new p3js.SimulatorWithIO();
  window.p3sim = p3sim;

  // fullscreen
  function request_fullscreen(elem) {
    let fn = (
      elem.requestFullscreen || elem.msRequestFullscreen
      || elem.mozRequestFullScreen || elem.webkitRequestFullscreen
    );
    if (fn) fn.apply(elem);
  }
  function exit_fullscreen() {
    let fn = (
      document.exitFullscreen || document.msExitFullscreen
      || document.mozCancelFullScreen || document.webkitExitFullscreen
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
  $(document).on("webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange", () => {
    if ($body.hasClass("fullscreen")) {
      $body.removeClass("fullscreen");
      $document.trigger("fullscreenoff");
    } else {
      $body.addClass("fullscreen");
      $document.trigger("fullscreenon");
    }
  });
  // event for fullscreen button
  $("#fullscr").click(() => {
    fullscreen_toogle();
    return false;
  });
  // F11 doesn't trigger fullscreenchange, so we hijack the key
  $(document).on("keydown", (e) => {
    if (e.which == 122) {
      fullscreen_toogle();
      return false;
    }
  });

  // tabs
  let $all_tab_lis = $(".nav-tabs li");
  let $all_tabs = $(".tab-page");
  $(window).on("load hashchange", () => {
    let hash = window.location.hash.substr(1);
    if (hash == "assembler") {
      if (window.history.replaceState !== undefined) {
        window.history.replaceState({ }, document.title, window.location.pathname);
      } else {
        window.location.hash = "";
        return;
      }
    } else if (hash == "") {
      hash = "assembler";
    } else if (hash == "io" && $(document.body).hasClass("sim-io-visible")) {
      return;
    }
    let $tab = $(".tab-page-" + hash);
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
  tab_settings(p3sim);
  tab_simulator(p3sim);
});
