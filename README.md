# Environment Monitor

Monitors Apache, Tomcat, packages etc. on environments.

![](http://rictorres.com/comscore/intro.gif)


## Download

Available on the [Chrome Web Store](http://rictorres.d.pr/1ia0z)

## Developing

Clone this repo `git clone https://github.com/rictorres/environment-monitor.git` or download the [zipball](https://github.com/rictorres/environment-monitor/archive/master.zip).
Open your terminal and type:
```
$ cd environment-monitor
$ npm install
$ bower install
$ grunt debug
```
Grunt will run with `watch` and `livereload`. Source will be available at `./app`

1. Go to `chrome://extensions`, enable Developer mode
2. Click on Load unpacked extension
3. Point to `./app`


## Usage

The Environment Monitor is expecting the following JSON:
```
{
	"environments": { // Object
		"environment-name": {
			"id": "", // String: unique ID
			"title": "", // String: title of the environment
			"addr": "" // String: IP address or domain name
		},
		"environment-name": {
			"id": "", // String: unique ID
			"title": "", // String: title of the environment
			"addr": "" // String: IP address or domain name
		}
	}
}

{
	"packages": [ // Array of objects
		{
			"repo": "", // String: name of the repository
			"branch": "", // String: name of the branch
			"revision": "" // String: revision/commit ID
		},
		{
			"repo": "", // String: name of the repository
			"branch": "", // String: name of the branch
			"revision": "" // String: revision/commit ID
		}
	]
}

{
	"services": [ // Array of objects
		{
			"id": "", // String: unique ID
			"title": "", // String: title of the service
			"online": // Boolean: current status of the service (true || false)
		},
		{
			"id": "", // String: unique ID
			"title": "", // String: title of the service
			"online": // Boolean: current status of the service (true || false)
		}
	]
}
```


## Building

Clone this repo `git clone https://github.com/rictorres/environment-monitor.git` or download the [zipball](https://github.com/rictorres/environment-monitor/archive/master.zip).
Open your terminal and type:
```
$ cd environment-monitor
$ npm install
$ bower install
$ grunt build
```
Source will be compiled to `./dist/`.


## Support
- Latest Chrome
- Firefox support coming soon!


## Help
- Need more information about Chrome Extensions? Please visit [Google Chrome Extension Development](http://developer.chrome.com/extensions/devguide.html)


## Versioning

For transparency and insight into our release cycle, and for striving to maintain backward compatibility, this app will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

* Breaking backward compatibility bumps the major (and resets the minor and patch)
* New additions without breaking backward compatibility bumps the minor (and resets the patch)
* Bug fixes and misc changes bumps the patch

For more information on SemVer, please visit [http://semver.org/](http://semver.org/).


## Authors

- [Ricardo Torres](http://github.com/rictorres)
- [Tamer Aydin](https://github.com/tameraydin)


## License

[MIT License](http://rictorres.mit-license.org/)
