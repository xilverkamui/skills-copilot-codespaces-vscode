// Create web server
// Serve static files
// Handle POST requests
// Handle GET requests
// Handle DELETE requests
// Handle PUT requests
// Handle OPTIONS requests
// Handle HEAD requests
// Handle TRACE requests
// Handle PATCH requests
// Handle CONNECT requests

var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var mime = require('mime');
var comments = require('./comments');

var server = http.createServer(function(req, res) {
  var pathname = url.parse(req.url).pathname;
  var method = req.method;
  var query = url.parse(req.url, true).query;
  var body = '';

  console.log(method + ' ' + pathname);

  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    body += chunk;
  });
  req.on('end', function() {
    if (body) {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
        return;
      }
    }

    if (pathname === '/comments' && method === 'GET') {
      var comments = comments.get();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      });
      res.end(JSON.stringify(comments));
    } else if (pathname === '/comments' && method === 'POST') {
      if (req.body && req.body.comment) {
        comments.add(req.body.comment);
        res.writeHead(201, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify(req.body.comment));
      } else {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    } else {
      var filename = path.join(__dirname, pathname);
      fs.exists(filename, function(exists) {
        if (exists) {
          var type = mime.lookup(filename);
          res.writeHead(200, {
            'Content-Type': type
          });
          fs.createReadStream(filename).pipe(res);
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      });
    }
  });
});

server.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});