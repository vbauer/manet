
# Manet

> There is only one true thing: instantly paint what you see. When you've got it, you've got it. When you haven't, you begin again. All the rest is humbug.

<img align="right" style="margin-left: 15px" src="misc/manet.jpg">

Manet is a service with REST API to capture screenshots of websites using various parameters. It is a good way to make sure that your websites are responsive or to make thumbnails.

Manet uses SlimerJS under the hood, which is very similar to PhantomJs, except that it runs on top of [Gecko](https://developer.mozilla.org/en-US/docs/Mozilla/Gecko), the browser engine of [Mozilla Firefox](https://www.mozilla.org). This is a conscious choice to be more stable.

*Project is named in honor of Édouard Manet, French painter (1832-1883).*


## Main features
* Ready-To-Use
* Configurable CLI application
* Flexible REST API
* File caching
* Various image formats

# Setup

First install SlimerJS():

* You can download it from the [official site](http://slimerjs.org/download.html).
* Or using [NPM](https://www.npmjs.org/):
```bash
npm install -g slimerjs
```

Gecko, the rendering engine of Firefox, cannot render web content without a graphical window,
but you can launch SlimerJS with xvfb if you are under linux or MacOSx, to have a headless SlimerJS.

So, it is also necessary to install [Xvfb](http://en.wikipedia.org/wiki/Xvfb) (X virtual framebuffer) for *nix or OS X systems.

For example, you can use **apt-get** to install **xvfb** on Ubuntu:
```bash
sudo apt-get install xvfb-run
```


## Parameters

TODO: add information


## License

The MIT License (MIT)

Copyright (c) 2014 Vladislav Bauer (see [LICENSE](LICENSE)).
