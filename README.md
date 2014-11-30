
# Manet [![Build Status](https://img.shields.io/travis/vbauer/manet.svg)](https://travis-ci.org/vbauer/manet) [![NPM](https://img.shields.io/npm/v/manet.svg)](https://www.npmjs.org/package/manet)

> There is only one true thing: instantly paint what you see. When you've got it, you've got it. When you haven't, you begin again. All the rest is humbug.

<img align="right" style="margin-left: 15px" width="300" height="360" title="Self-Portrait with Palette, 1879" src="misc/manet.jpg">

**Manet** is a REST API server which allows capturing screenshots of websites using various parameters. It is a good way to make sure that your websites are responsive or to make thumbnails.

**Manet** could use different engines to work: [SlimerJS](http://slimerjs.org) or [PhantomJs](http://phantomjs.org).

* **SlimerJS** runs on top of [Gecko](https://developer.mozilla.org/en-US/docs/Mozilla/Gecko) (the browser engine of [Mozilla Firefox](https://www.mozilla.org)) and [SpiderMonkey](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey) (the JavaScript engine of Firefox).
* **PhantomJS** runs on top of [WebKit](https://www.webkit.org) and [JavaScriptCore](http://trac.webkit.org/wiki/JavaScriptCore).

*Project was named in honor of Édouard Manet, French painter (1832-1883). He was one of the first 19th-century artists to paint modern life, and a pivotal figure in the transition from Realism to Impressionism.*


## Main features
* Ready-To-Use
* Supporting SlimerJS and PhantomJS
* Configurable CLI application
* Flexible REST API
* File caching
* Various image formats
* Sandbox UI


## Setup


### Preset
Choose and install needed engine (PhantomJS, SlimerJS, or both of them):


#### SlimerJS:

* You can download SlimerJS from the [official site](http://slimerjs.org/download.html) and install manually.
* or you can use the power of [NPM](https://www.npmjs.org/):
```bash
npm install -g slimerjs
```

Gecko, the rendering engine of Firefox, cannot render web content without a graphical window, but you can launch SlimerJS with xvfb if you are under linux or MacOSx, to have a headless SlimerJS, so it is also necessary to install [Xvfb](http://en.wikipedia.org/wiki/Xvfb) (X virtual framebuffer) for *nix or OS X systems.

For example, you can use **apt-get** to install **xvfb** on Ubuntu:
```bash
sudo apt-get install xvfb
```


#### PhantomJS

* You can download PhantomJS from the [official site](http://phantomjs.org/download.html) and install manually.
* or you can also use NPM:
```bash
npm install -g phantomjs
```

**IMPORTANT:** PhantomJS is used by default (see `default.json` file).


### Installation

After preliminaries operations you can install Manet using NPM:
```bash
npm install -g manet
```

That is all, now you can start and use Manet server. As you can see, it is unnecessary to clone Git repository or something else.


## Server launching

Server launching is a simple as possible:
```bash
manet
```

If everything is OK, you should see the following message:
```
info: Manet server started on port 8891
```

## Server configuration

Manet server uses hierarchical configurations to cover differnet usage use-cases:

* Command-line parameters
* Environment variables
* Built-in configuration JSON file *("config/default.json")*

Rules of overriding:

* Each configuration level could be overridden by another level.
* The *most-priority* parameters are *command-line parameters*.
* The *less-priority* parameters are stored in *build-in configuration file*.


### CLI parameters

<dl>

  <dt>--port</dt>
  <dd>Web server port number. REST API and UI will be available on this port (default: 8891).</dd>

  <dt>--engine</dt>
  <dd>Engine for screenshot capturing: "phantomjs" or "slimerjs" (default is "slimerjs"). Specific command will be detected by configuration file (default.json) using engine parameter and OS platform.</dd>

  <dt>--command</dt>
  <dd>Configuration file "default.json" supports specific commands for different platforms (ex: "linux": "xvfb-run -a slimerjs"). Needed command will be detected in runtime by platform/OS. This parameter allows to override command for executing SlimerJS. It allows using full power of SlimerJS command line options to configure proxy, SSL protocol, etc. More information could be found here: http://docs.slimerjs.org/current/configuration.html <br/><b>IMPORTANT:</b> This parameter overrides "--engine" parameter.</dd>

  <dt>--storage</dt>
  <dd>File storage for cache (default is global temp directory).</dd>

  <dt>--cache</dt>
  <dd>Lifetime for file cache in seconds. Screenshots are cached for *60 minutes by default*, so that frequent requests for the same screenshot don't slow the service down. You can configure longer life for cache items or make them ethereal (use no-positive value, <= 0)</dd>

  <dt>--silent</dt>
  <dd>Run Manet server with or without logging information (default is false).</dd>

  <dt>--level</dt>
  <dd>Setting the level for your logging message. Possible values: debug, info, silly, warn, error (default is "debug").</dd>

  <dt>--cors</dt>
  <dd>Enable <a href="http://www.w3.org/TR/cors/">Cross-Origin Resource Sharing</a> (default is false).</dd>

  <dt>--ui</dt>
  <dd>Enable or disable sandbox UI (default is true).</dd>

</dl>

### Configuration file

Built-in configuration could be found in `manet` directory. For example, on Ubuntu it is located here: *"/usr/local/lib/node_modules/manet/"*.

Default configuration file *("default.json")*:

```json
{
    "cache": 3600,
    "port": 8891,
    "ui": true,
    "cors": false,
    "silent": false,
    "level": "debug",
    "engine": "phantomjs",
    "commands": {
        "slimerjs": {
            "linux": "xvfb-run -a slimerjs",
            "freebsd": "xvfb-run -a slimerjs",
            "sunos": "xvfb-run -a slimerjs",
            "darwin": "slimerjs",
            "win32": "slimerjs.bat"
        },
        "phantomjs": {
            "linux": "phantomjs",
            "freebsd": "phantomjs",
            "sunos": "phantomjs",
            "darwin": "phantomjs",
            "win32": "phantomjs"
        }
    }
}
```


## REST API

REST API is available on "/" using:

* GET method
* POST method with `Content-Type`:
    * *application/json*
    * or *application/x-www-form-urlencoded*

Few rules:

* The `"url"` parameter must be specified.
* Query parameters will be used in priority and override others.


### Query parameters

<dl>

  <dt>url</dt>
  <dd>Website address (URL). This is the only required parameter for the HTTP request. It is unnecessary for the most cases to configure scheme. Example: "github.com".</dd>

  <dt>width</dt>
  <dd>This property allows to change the width of the viewport, e.g., the size of the window where the webpage is displayed (default: 1024)</dd>

  <dt>height</dt>
  <dd>This property allows to change the height of the viewport. If width is defined and height is not defined, than full page will be captured.</dd>

  <dt>clipRect</dt>
  <dd>This property defines the rectangular area of the web page to be rasterized. Format: "top,left,width,height", example: "20,20,640,480".</dd>

  <dt>zoom</dt>
  <dd>Zoom factor of the webpage display. Setting a value to this property decreases or increases the size of the web page rendering. A value between 0 and 1 decreases the size of the page, and a value higher than 1 increases its size. 1 means no zoom (normal size). (default: 1).</dd>

  <!--
  <dt>quality</dt>
  <dd>The compression quality. A number between 0 and 1. Default value: 100.</dd>
  -->

  <dt>delay</dt>
  <dd>Do a pause during the given amount of time (in milliseconds) after page opening (default: 100).</dd>

  <dt>format</dt>
  <dd>Indicate the file format for output image (default is "png"). Possible values: jpg, jpeg, png, gif, pdf</dd>

  <dt>agent</dt>
  <dd>String to define the "User-Agent" in HTTP requests. By default, it is something like:
    <ul>
        <li><b>PhantomJS:</b> Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.0 (development) Safari/534.34</li>
        <li><b>SlimerJS:</b> Mozilla/5.0 (X11; Linux x86_64; rv:21.0) Gecko/20100101 SlimerJS/0.7</li>
    </ul>
  </dd>

  <dt>headers</dt>
  <dd>This property specifies additional HTTP request headers that will be sent to the server for every request issued (for pages and resources). Format: "key1=value1;key2=value2;..." Headers names and values get encoded in US-ASCII before being sent. Please note that setting the 'User-Agent' will overwrite the value set via "agent" parameter.</dd>

  <dt>user</dt>
  <dd>User name to give to HTTP Basic authentication.</dd>

  <dt>password</dt>
  <dd>Password to give to HTTP Basic authentication.</dd>

  <dt>js</dt>
  <dd>false to deactivate javascript in web pages (default is true).</dd>

  <dt>images</dt>
  <dd>false to deactivate the loading of images (default is true).</dd>

  <dt>force</dt>
  <dd>Use the force reloading of web page without using cache (default is false).</dd>

</dl>


### Query examples

For a quick test with the command line (using `curl`), type:

```bash
curl http://localhost:8891/?url=github.com > github.png
curl -H "Content-Type: application/json" -d '{"url":"github.com"}' http://localhost:8891/ > github.png
curl -H "Content-Type: application/x-www-form-urlencoded" -d 'url=github.com' http://localhost:8891/ > github.png
```

or (using `wget`)

```bash
wget http://localhost:8891/?url=github.com -O github.png
```

Here are some query examples that could be executed by any REST API client:

```
# Take a screenshot of the github.com.
GET /?url=github.com

# Custom viewport size. Return a 800x600 PNG screenshot of the github.com homepage.
GET /?url=github.com&width=800&height=600

# Clipping Rectangle. Return a screenshot clipped at [top=20, left=30, width=90, height=80]
GET /?url=github.com&clipRect=20%2C30%2C90%2C80

# Zoom rendered page in 2 times.
GET /?url=github.com&zoom=2

# Specify image output format.
GET /?url=github.com&format=jpeg

# Disable JavaScript. Return a screenshot with no JavaScript executed.
GET /?url=github.com&js=false

# Disable images. Return a screenshot without images.
GET /?url=github.com&images=false

# Custom User Agent.
GET /?url=github.com&agent=Mozilla%2F5.0+(X11%3B+Linux+x86_64)+AppleWebKit%2F537.36+(KHTML%2C+like+Gecko)+Chrome%2F34.0.1847.132+Safari%2F537.36

# HTTP Basic Authentication. Return a screenshot of a website requiring basic authentication.
GET /?url=mysite.com&user=john&password=smith

# Screenshot delay. Return a screenshot of the github.com homepage 1 second after it's loaded.
GET /?url=github.com&delay=1000

# Force page reloading. Return a screenshot without using file cache.
GET /?url=github.com&force=true

# Specify custom HTTP headers.
GET /?url=google.com&headers=User-Agent=Firefox;Accept-Charset=utf-8
```


## Sandbox UI

Sandbox UI is available on "/" by direct GET request without `"url"` query parameter.
It is a simple playground to build HTTP requests and try them.


## Development

* To install project dependencies:
```bash
npm install
```
* To run [jshint](https://github.com/jshint/jshint/) checks:
```bash
npm run lint
```
* To run [Mocha](https://github.com/mochajs/mocha) unit tests:
```bash
# using NPM:
npm test
# using mocha and watcher:
mocha --watch -R spec
```
* To run Manet server:
```bash
./bin/manet
```


## Thanks to

* SlimerJS author [Laurent Jouanneau](https://github.com/laurentj) and SlimerJS [community](https://github.com/laurentj/slimerjs/graphs/contributors).
* PhantomJS author [Ariya Hidayat](https://github.com/ariya/phantomjs) and PhantomJS [community](https://github.com/ariya/phantomjs/graphs/contributors).


## License

The MIT License (MIT)

Copyright (c) 2014 Vladislav Bauer (see [LICENSE](LICENSE)).
