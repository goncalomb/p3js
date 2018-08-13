var fs = require("fs");
var path = require("path");
var url = require('url');

var request = require("request");
var mkdirp = require("mkdirp");

// helper functions

var dir_remote_rel = "static/remote";
var dir_remote = "www/static/remote";

var file_queue = [];
var callback_done = null;

var regex_css_include = /(@import\s+?)?url\(["']?(.*?)["']?\)/g;

function push_file(parent_file, file_url, ext, rel) {
  file_url = url.parse(file_url);

  if (file_url.host == null) {
    // relative path? resolve it
    file_url = url.parse(url.resolve(parent_file.url.href, file_url.href));
  }

  var path_parts = (file_url.host + file_url.pathname).split('/');
  path_parts = path_parts.map(decodeURIComponent);

  var last_path_part = path_parts.pop();
  var local_ext = path.extname(last_path_part);

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

  var local = path.join.apply(path, path_parts); // filesystem
  var local_url = path_parts.map(encodeURIComponent).join("/"); // web

  // include hash on local_url? do tests

  var local_replace;
  if (parent_file) {
    local_replace = path.relative(path.dirname(parent_file.local_url), local_url);
  } else {
    local_replace = path.join(dir_remote_rel, local_url);
  }

  if (file_url.protocol == "data:") {
    return null;
  } else if (file_url.protocol !== "http:" && file_url.protocol !== "https:") {
    console.log(file_url);
    throw "unknown protocol " + file_url.protocol;
  }

  var f = {
    url: file_url,
    local: local,
    local_url: local_url,
    local_ext: local_ext,
    local_full: path.join(dir_remote, local),
    local_replace: local_replace
  };
  file_queue.push(f);
  return f;
}

function search_and_replace_css_file(file, text) {
  text = text.replace(regex_css_include, function(match, p1, p2) {
    var child = push_file(file, p2, (p1 ? ".css" : null), true);
    if (child) {
      return (p1 ? p1 : "") + "url(\"" + child.local_replace + "\")";
    }
    return match;
  });
  return text
}

function download_next_file() {
  var f = file_queue.pop();
  if (!f) {
    // nothing else to do
    setTimeout(callback_done);
    return;
  }
  var href = (f.url.hash ? f.url.href.slice(0, -f.url.hash.length) : f.url.href);
  console.log("downloading: " + href);
  request({
    url: href,
    encoding: null
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if (f.local_ext == ".css") {
        body = search_and_replace_css_file(f, body.toString("utf8"));
      }
      // save to disk
      mkdirp.sync(path.dirname(f.local_full));
      fs.writeFileSync(f.local_full, body);
      // continue downloading the next file
      setTimeout(download_next_file);
    } else if (!error) {
      throw "Error: response.statusCode == " + response.statusCode;
    } else {
      throw error.toString();
    }
  });
}

// find root files

var regex_jsdelivr = /="(https:\/\/cdn\.jsdelivr\.net\/.*)"/g;
var text = fs.readFileSync("www/index.html", "utf8");
text = text.replace(regex_jsdelivr, function(match, p1) {
  if (p1.endsWith(".js") || p1.endsWith(".css")) {
    file = push_file(null, p1);
    return "=\"" + file.local_replace + "\"";
  }
  return match;
});
fs.writeFileSync("www/index-offline.html", text, "utf8");

// start downloading
setTimeout(download_next_file);

// done
callback_done = function() {
  console.log("DONE");
}
