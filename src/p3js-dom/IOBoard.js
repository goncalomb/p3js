export class IOBoard {
  constructor($container, simulator) {
    $container.addClass("p3js-io-board");
    let $board_lcd = $("<textarea class=\"p3js-io-board-lcd\" cols=\"12\" rows=\"2\" readonly>").appendTo($container);
    let $board_leds = $("<div class=\"p3js-io-board-leds\">").appendTo($container);
    let $board_7seg = $("<div class=\"p3js-io-board-7seg\">").text("0000").appendTo($container);
    let $board_buttons = $("<div class=\"p3js-io-board-buttons\">").appendTo($container);
    let $board_switches = $("<div class=\"p3js-io-board-switches\">").appendTo($container);

    let leds$array = [];
    for (let i = 0; i < 16; i++) {
      leds$array.push($("<span>").appendTo($board_leds));
    }

    // TODO: remove bootstrap classes from buttons.. maybe..

    function create_button_row(arr) {
      let $div = $("<div>");
      arr.forEach((i) => {
        $("<button>").addClass("btn btn-xs").text("I" + i.toString(16).toUpperCase()).click(() => {
          simulator.interrupt(i);
        }).appendTo($div);
      });
      $div.appendTo($board_buttons);
    }
    create_button_row([7, 8, 9, 12]);
    create_button_row([4, 5, 6, 13]);
    create_button_row([1, 2, 3, 14]);
    create_button_row([0, 10, 11]);

    function create_switch(i) {
      $("<button>").addClass("btn").click(() => {
        let $this = $(this);
        if ($this.hasClass("on")) {
          $this.removeClass("on");
          simulator.io.switches.unset(7 - i);
        } else {
          $this.addClass("on");
          simulator.io.switches.set(7 - i);
        }
      }).appendTo($board_switches);
    }
    for (let i = 0; i < 8; i++) {
      create_switch(i);
    }

    simulator.io.seg7.onStateChange((value) => {
      $board_7seg.text(("0000" + value.toString(16)).substr(-4));
    });
    simulator.io.lcd.onStateChange((text, active) => {
      if (!active || !text) {
        $board_lcd.val("");
      } else if (text) {
        $board_lcd.val(text.join("\n"));
      }
    });
    simulator.io.lcd.onTextChange((text, active, x, y) => {
      $board_lcd.val(text.join("\n"));
    });
    simulator.io.leds.onStateChange((value) => {
      for (let i = 0; i < 16; i++) {
        if (((value << i) & 0x8000) == 0) {
          leds$array[i].removeClass("on");
        } else {
          leds$array[i].addClass("on");
        }
      }
    });
  }
}
