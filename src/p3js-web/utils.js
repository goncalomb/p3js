export function requestFullscreen(elem) {
  let fn = (
    elem.requestFullscreen || elem.msRequestFullscreen
    || elem.mozRequestFullScreen || elem.webkitRequestFullscreen
  );
  if (fn) fn.apply(elem);
}

export function exitFullscreen() {
  let fn = (
    document.exitFullscreen || document.msExitFullscreen
    || document.mozCancelFullScreen || document.webkitExitFullscreen
  );
  if (fn) fn.apply(document);
}

export function downloadBuffer(buffer, name) {
  let blob = new Blob([buffer], { type: 'application/octet-stream' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  if ('download' in a) {
    a.href = url;
    a.download = (name || 'file');
    a.dispatchEvent(new MouseEvent('click'));
  } else {
    window.location = url;
  }
  setTimeout(() => {
    URL.revokeObjectURL(url);
  });
}

export function createDraggableElement($element) {
  let $handle = $('<div>').prependTo($element);
  $('<i>').addClass('fa fa-arrows').appendTo($handle);
  $(document.createTextNode(' Drag Me')).appendTo($handle);
  function bring_to_top() {
    $('.ui-draggable').css('z-index', 10);
    $element.css('z-index', 11);
  }
  $element.click(bring_to_top);
  $element.draggable({
    handle: $handle,
    start: bring_to_top,
  });
}
