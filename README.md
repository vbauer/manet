
# Manet [![Build Status](http://img.shields.io/travis/vbauer/manet.svg)](https://travis-ci.org/vbauer/manet) [![NPM](http://img.shields.io/npm/v/manet.svg)](https://www.npmjs.org/package/manet)

> There is only one true thing: instantly paint what you see. When you've got it, you've got it. When you haven't, you begin again. All the rest is humbug.

<img align="right" style="margin-left: 15px" width="300" height="360" title="Self-Portrait with Palette, 1879" src="misc/manet.jpg">

**Manet** is a REST API server which allows to capture screenshots of websites using various parameters. It is a good way to make sure that your websites are responsive or to make thumbnails.

**Manet** could use different engines to work: [SlimerJS](http://slimerjs.org) or [PhantomJs](http://phantomjs.org).

* **SlimerJS** runs on top of [Gecko](https://developer.mozilla.org/en-US/docs/Mozilla/Gecko) (the browser engine of [Mozilla Firefox](https://www.mozilla.org)) and [SpiderMonkey](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey) (the JavaScript engine of Firefox).
* **PhantomJS** run on top of [WebKit](https://www.webkit.org) and [JavaScriptCode](http://trac.webkit.org/wiki/JavaScriptCore).

*Project was named in honor of Édouard Manet, French painter (1832-1883). He was one of the first 19th-century artists to paint modern life, and a pivotal figure in the transition from Realism to Impressionism.*


## Main features
* Ready-To-Use
* Support 2 engines: SlimerJS and PhantomJS
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

Each configuration level could be overridden by another level.
The most-priority parameters are command-line parameters.
The less-priority parameters are stored in build-in configuration file.


### CLI parameters

<dl>

  <dt>--port</dt>
  <dd>Web server port number. REST API and UI will be available on this port *(default: 8891)*.</dd>

  <dt>--engine</dt>
  <dd>Engine for screenshot capturing: "phantomjs" or "slimerjs" *(default is "slimerjs")*. Specific command will be detected by configuration file (default.json) using engine parameter and OS platform.</dd>

  <dt>--command</dt>
  <dd>Configuration file *"default.json"* supports specific commands for different platforms (ex: *"linux": "xvfb-run -a slimerjs"*). Needed command will be detected in runtime by platform/OS. This parameter allows to overide command for executing SlimerJS. It allows to use full power of SlimerJS command line options to configure proxy, SSL protocol, etc. More information could be found here: http://docs.slimerjs.org/current/configuration.html <br/><b>IMPORTANT:</b> This parameter overrides "--engine" parameter.</dd>

  <dt>--storage</dt>
  <dd>File storage for cache *(default is global temp directory)*.</dd>

  <dt>--cache</dt>
  <dd>Lifetime for file cache in seconds. Screenshots are cached for *60 minutes by default*, so that frequent requests for the same screenshot don't slow the service down. You can configure longer life for cache items or make them ethereal (use no-positive value, <= 0)</dd>

  <dt>--silent</dt>
  <dd>Run Manet server with or without logging information *(default is false)*.</dd>

</dl>

### Configuration file

Built-in configuration could be found in `manet` directory. For example, on Ubuntu it is located here: *"/usr/local/lib/node_modules/manet/"*.

Default configuration file *("default.json")*:

```json
{
    "engine": "slimerjs",
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
    },
    "cache": 3600,
    "port": 8891
}
```


## REST API

REST API is available on "/" by direct GET request with `"url"` query parameter.


### Query parameters

<dl>

  <dt>url</dt>
  <dd>Website address (URL). This is the only required parameter for the HTTP request. It is unnecessary for the most cases to configure scheme. Example: "github.com".</dd>

  <dt>width</dt>
  <dd>This property allows to change the width of the viewport, e.g., the size of the window where the webpage is displayed (default: 1024)</dd>

  <dt>height</dt>
  <dd>This property allows to change the height of the viewport. If width is defined and height is not defined, than full page will be captured.</dd>

  <dt>zoom</dt>
  <dd>Contains the zoom factor of the webpage display. Setting a value to this property decreases or increases the size of the web page rendering. A value between 0 and 1 decreases the size of the page, and a value higher than 1 increases its size. 1 means no zoom (normal size). (default: 1).</dd>

  <!--
  <dt>quality</dt>
  <dd>The compression quality. A number between 0 and 1. Default value: 100.</dd>
  -->

  <dt>delay</dt>
  <dd>Do a pause during the given amount of time (in milliseconds) after page opening (default: 100).</dd>

  <dt>format</dt>
  <dd>Indicate the file format (then the file extension is ignored). possible values: jpg, png, jpeg, pdf. (default is "png")</dd>

  <dt>agent</dt>
  <dd>String to define the user Agent in HTTP requests. By default, it is something like "Mozilla/5.0 (X11; Linux x86_64; rv:21.0) Gecko/20100101 SlimerJS/0.7" (depending of the version of Firefox/XulRunner you use).</dd>

  <dt>user</dt>
  <dd>User name to give to HTTP Basic authentication.</dd>

  <dt>password</dt>
  <dd>Password to give to HTTP Basic authentication.</dd>

  <dt>js</dt>
  <dd>false to deactivate javascript in web pages (default is true).</dd>

  <dt>images</dt>
  <dd>false to deactivate the loading of images (default is true).</dd>

  <dt>force</dt>
  <dd>Use the force reloading of web page without using cache (defalut is false).</dd>

</dl>


### Query examples

For a quick test with the command line (using `curl`), type:

```bash
curl http://localhost:8891/?url=github.com > github.png
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

# Disable JavaScript. Return a screenshot with no JavaScript executed.
GET /?url=github.com&js=false

# Custom User Agent.
GET /?url=github.com&agent=Mozilla%2F5.0+(X11%3B+Linux+x86_64)+AppleWebKit%2F537.36+(KHTML%2C+like+Gecko)+Chrome%2F34.0.1847.132+Safari%2F537.36

# HTTP Basic Authentication. Return a screenshot of a website requiring basic authentication.
GET /?url=mysite.com&user=john&password=smith

# Screenshot delay. Return a screenshot of the github.com homepage 1 second after it's loaded.
GET /?url=github.com&delay=1000
```


## Sandbox UI

Sandbox UI is available on "/" by direct GET request without `"url"` query parameter.
It is a simple playground to build HTTP requests and try them.


## Thanks to

* SlimerJS author [Laurent Jouanneau](https://github.com/laurentj) and SlimerJS [community](https://github.com/laurentj/slimerjs/graphs/contributors).
* PhantomJS author [Ariya Hidayat](https://github.com/ariya/phantomjs) and PhantomJS [community](https://github.com/ariya/phantomjs/graphs/contributors).


## License

The MIT License (MIT)

Copyright (c) 2014 Vladislav Bauer (see [LICENSE](LICENSE)).
