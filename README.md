# DAx Environment Monitor


> Monitors Apache, Tomcat, packages etc. on DAx environments.

Need more information about Chrome Extension? Please visit [Google Chrome Extension Develpment](http://developer.chrome.com/extensions/devguide.html)

![](http://rictorres.com/comscore/intro.gif)


## Developing

```
$ grunt debug
```
Grunt will run with `watch` and `livereload`. Source will be available at `./dist`

1. Go to `chrome://extensions`, enable Developer mode and load app as an unpacked extension
2. Click on Load unpacked extension
3. Point to `./app`


## Building

Clone this repo `git clone https://github.com/rictorres/dax-env-monitor.git` or download the [zipball](https://github.com/rictorres/dax-env-monitor/archive/master.zip).
Open your terminal and type:
```
$ cd dax-env-monitor
$ npm install
$ grunt build
```
Source will be compiled to `./dist/`.


## Support
- Latest Chrome, Chrome dev and Chrome Canary


## Versioning

For transparency and insight into our release cycle, and for striving to maintain backward compatibility, this app will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backward compatibility bumps the major (and resets the minor and patch)
* New additions without breaking backward compatibility bumps the minor (and resets the patch)
* Bug fixes and misc changes bumps the patch

For more information on SemVer, please visit [http://semver.org/](http://semver.org/).


## Author

![Hi](http://gravatar.com/avatar/414738201197c2a837b986748c80e16e?s=90)

**Ricardo Torres** (Front-end Engineer)

- [http://rictorres.com](http://rictorres.com)
- [http://twitter.com/RicardoTorres0](http://twitter.com/RicardoTorres0)
- [http://github.com/rictorres](http://github.com/rictorres)


## License

[MIT License](http://rictorres.mit-license.org/) © Ricardo Torres