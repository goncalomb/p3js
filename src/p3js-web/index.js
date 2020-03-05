/*
 * Copyright (c) 2016-2019 Gonçalo Baltazar <me@goncalomb.com>
 *
 * P3JS is released under the terms of the MIT License.
 * See LICENSE.txt for details.
 */

import { requestFullscreen, exitFullscreen } from './utils';

import tab_assembler from './tab-assembler';
import tab_io from './tab-io';
import tab_program from './tab-program';
import tab_settings from './tab-settings';
import tab_simulator from './tab-simulator';

$(window).ready(() => {
  const share = {};

  let $document = $(document);
  let $body = $(document.body);

  // the simulator instance
  let p3sim = new p3js.SimulatorWithIO();
  window.p3sim = p3sim;

  // fullscreen
  function fullscreen_toogle() {
    if ($body.hasClass('fullscreen')) {
      exitFullscreen();
    } else {
      requestFullscreen(document.documentElement);
    }
  }
  $(document).on('webkitfullscreenchange mozfullscreenchange msfullscreenchange fullscreenchange', () => {
    if ($body.hasClass('fullscreen')) {
      $body.removeClass('fullscreen');
      $document.trigger('fullscreenoff');
    } else {
      $body.addClass('fullscreen');
      $document.trigger('fullscreenon');
    }
  });
  // event for fullscreen button
  $('#fullscr').click(() => {
    fullscreen_toogle();
    return false;
  });
  // F11 doesn't trigger fullscreenchange, so we hijack the key
  $(document).on('keydown', (e) => {
    if (e.which === 122) {
      fullscreen_toogle();
      return false;
    }
  });

  // tabs
  let $all_tab_lis = $('.nav-tabs li');
  let $all_tabs = $('.tab-page');
  $(window).on('load hashchange', () => {
    let hash = window.location.hash.substr(1);
    if (hash === 'assembler') {
      if (window.history.replaceState !== undefined) {
        window.history.replaceState({ }, document.title, window.location.pathname);
      } else {
        window.location.hash = '';
        return;
      }
    } else if (hash === '') {
      hash = 'assembler';
    } else if (hash === 'io' && $(document.body).hasClass('sim-io-visible')) {
      return;
    }
    let $tab = $('.tab-page-' + hash);
    if ($tab.length > 0) {
      $all_tabs.addClass('hidden');
      $tab.removeClass('hidden');
      $all_tab_lis.removeClass('active');
      $('a[href="#' + hash + '"]', $all_tab_lis).parent().addClass('active');
      $(document).trigger('p3js-tab-change', hash);
    }
  });

  tab_assembler(p3sim, share);
  tab_io(p3sim, share);
  tab_program(p3sim, share);
  tab_settings(p3sim, share);
  tab_simulator(p3sim, share);
});
