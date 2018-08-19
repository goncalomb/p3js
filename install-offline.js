let fs = require('fs');
let path = require('path');
let url = require('url');

let request = require('request');
let mkdirp = require('mkdirp');

// helper functions

let dir_remote_rel = 'static/remote';
let dir_remote = 'www/static/remote';

let file_queue = [];
let callback_done = null;

let regex_css_include = /(@import\s+?)?url\(["']?(.*?)["']?\)/g;

function push_file(parent_file, file_url, ext, rel) {
  file_url = url.parse(file_url);

  if (file_url.host === null) {
    // relative path? resolve it
    file_url = url.parse(url.resolve(parent_file.url.href, file_url.href));
  }

  let path_parts = (file_url.host + file_url.pathname).split('/');
  path_parts = path_parts.map(decodeURIComponent);

  let last_path_part = path_parts.pop();
  let local_ext = path.extname(last_path_part);

  // add query
  if (file_url.search) {
    last_path_part += file_url.search + local_ext;
  }

  // fix extension
  if (ext && ext !== local_ext) {
    last_path_part += ext;
    local_ext = path.extname(last_path_part);
  }

  path_parts.push(last_path_part);

  let local = path.join(...path_parts); // filesystem
  let local_url = path_parts.map(encodeURIComponent).join('/'); // web

  // include hash on local_url? do tests

  let local_replace;
  if (parent_file) {
    local_replace = path.relative(path.dirname(parent_file.local_url), local_url);
  } else {
    local_replace = path.join(dir_remote_rel, local_url);
  }

  if (file_url.protocol === 'data:') {
    return null;
  } else if (file_url.protocol !== 'http:' && file_url.protocol !== 'https:') {
    console.log(file_url);
    throw new Error('unknown protocol ' + file_url.protocol);
  }

  let f = {
    url: file_url,
    local,
    local_url,
    local_ext,
    local_full: path.join(dir_remote, local),
    local_replace,
  };
  file_queue.push(f);
  return f;
}

function search_and_replace_css_file(file, text) {
  text = text.replace(regex_css_include, (match, p1, p2) => {
    let child = push_file(file, p2, (p1 ? '.css' : null), true);
    if (child) {
      return (p1 || '') + 'url("' + child.local_replace + '")';
    }
    return match;
  });
  return text;
}

function download_next_file() {
  let f = file_queue.pop();
  if (!f) {
    // nothing else to do
    setTimeout(callback_done);
    return;
  }
  let href = (f.url.hash ? f.url.href.slice(0, -f.url.hash.length) : f.url.href);
  console.log('downloading: ' + href);
  request({
    url: href,
    encoding: null,
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      if (f.local_ext === '.css') {
        body = search_and_replace_css_file(f, body.toString('utf8'));
      }
      // save to disk
      mkdirp.sync(path.dirname(f.local_full));
      fs.writeFileSync(f.local_full, body);
      // continue downloading the next file
      setTimeout(download_next_file);
    } else if (!error) {
      throw new Error('response.statusCode === ' + response.statusCode);
    } else {
      throw error.toString();
    }
  });
}

// find root files

let regex_jsdelivr = /="(https:\/\/cdn\.jsdelivr\.net\/.*)"/g;
let text = fs.readFileSync('www/index.html', 'utf8');
text = text.replace(regex_jsdelivr, (match, p1) => {
  if (p1.endsWith('.js') || p1.endsWith('.css')) {
    let file = push_file(null, p1);
    return '="' + file.local_replace + '"';
  }
  return match;
});
fs.writeFileSync('www/index-offline.html', text, 'utf8');

// start downloading
setTimeout(download_next_file);

// done
callback_done = () => {
  console.log('DONE');
};
