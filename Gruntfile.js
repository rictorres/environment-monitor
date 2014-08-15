'use strict';

module.exports = function (grunt) {

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Configurable paths
	var config = {
		app: 'app',
		dist: 'dist',
		assets: 'assets',
		bower: 'bower_components',
		manifest: grunt.file.readJSON('app/manifest.json')
	};

	grunt.initConfig({

		// Project settings
		config: config,

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			bower: {
				files: ['bower.json'],
				tasks: ['bowerInstall']
			},
			js: {
				files: [
					'<%= config.app %>/<%= config.assets %>/js/{,*/}*.js',
					'!<%= config.app %>/<%= config.assets %>/js/vendor/**/*',
				],
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			styles: {
				files: ['<%= config.app %>/<%= config.assets %>/css/{,*/}*.css'],
				tasks: [],
				options: {
					livereload: true
				}
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= config.app %>/*.html',
					'<%= config.app %>/<%= config.assets %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
					'<%= config.app %>/manifest.json',
					'<%= config.app %>/_locales/{,*/}*.json'
				]
			}
		},

		// Grunt server and debug server setting
		connect: {
			options: {
				port: 1338,
				livereload: 35729,
				// change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			chrome: {
				options: {
					open: false,
					base: [
						'<%= config.app %>'
					]
				}
			},
			test: {
				options: {
					open: false,
					base: [
						'test',
						'<%= config.app %>'
					]
				}
			}
		},

		// Empties folders to start fresh
		clean: {
			chrome: {
			},
			dist: {
				files: [{
					dot: true,
					src: [
						'<%= config.dist %>/*',
						'!<%= config.dist %>/.git*'
					]
				}]
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'Gruntfile.js',
				'<%= config.app %>/<%= config.assets %>/js/{,*/}*.js',
				'!<%= config.app %>/<%= config.assets %>/js/vendor/*',
				'test/spec/{,*/}*.js'
			]
		},
		mocha: {
			all: {
				options: {
					run: true,
					urls: ['http://localhost:<%= connect.options.port %>/index.html']
				}
			}
		},

		// Automatically inject Bower components into the HTML file
		bowerInstall: {
			app: {
				src: [
					'<%= config.app %>/*.html'
				]
			}
		},

		uglify: {
			options: {
				compress: {
					'drop_console': true
				}
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			options: {
				dest: '<%= config.dist %>'
			},
			html: [
				'<%= config.app %>/popup.html',
				'<%= config.app %>/options.html',
				'<%= config.app %>/background.html'
			]
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			options: {
				assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/<%= config.assets %>/images']
			},
			html: ['<%= config.dist %>/{,*/}*.html'],
			css: ['<%= config.dist %>/<%= config.assets %>/css/{,*/}*.css']
		},

		// The following *-min tasks produce minifies files in the dist folder
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/<%= config.assets %>/images',
					src: '{,*/}*.{gif,jpeg,jpg,png}',
					dest: '<%= config.dist %>/<%= config.assets %>/images'
				}]
			}
		},

		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/<%= config.assets %>/images',
					src: '{,*/}*.svg',
					dest: '<%= config.dist %>/<%= config.assets %>/images'
				}]
			}
		},

		htmlcompressor: {
			compile: {
				files: [{
					expand: true,
					cwd: '<%= config.dist %>',
					src: '*.html',
					dest: '<%= config.dist %>'
				}],
				options: {
					type: 'html',
					removeIntertagSpaces: true
				}
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [
					{
						expand: true,
						dot: true,
						cwd: '<%= config.app %>',
						dest: '<%= config.dist %>',
						src: [
							'*.{ico,png,txt}',
							'<%= config.assets %>/images/{,*/}*.{webp,gif}',
							'{,*/}*.html',
							'<%= config.assets %>/css/{,*/}*.css',
							'<%= config.assets %>/css/fonts/{,*/}*.*',
							'_locales/{,*/}*.json',
						]
					},
					{
						expand: true,
						dot: true,
						cwd: '<%= config.app %>',
						dest: '<%= config.dist %>/<%= config.assets %>',
						src: [
							'<%= config.bower %>/*/fonts/*.*'
						],
						rename: function(dest, src) {
							return dest + src.replace('bower_components/bootstrap', '');
						}
					}
				]
			}
		},

		// Run some tasks in parallel to speed up build process
		concurrent: {
			chrome: [
			],
			dist: [
				'imagemin',
				'svgmin'
			],
			test: [
			]
		},

		// Auto buildnumber, exclude debug files. smart builds that event pages
		chromeManifest: {
			dist: {
				options: {
					buildnumber: false,
					background: {
						target: '<%= config.assets %>/js/background.js',
						exclude: [
							'<%= config.assets %>/js/chromereload.js'
						]
					}
				},
				src: '<%= config.app %>',
				dest: '<%= config.dist %>'
			},
			release: {
				options: {
					buildnumber: true,
					background: {
						target: '<%= config.assets %>/js/background.js',
						exclude: [
							'<%= config.assets %>/js/chromereload.js'
						]
					}
				},
				src: '<%= config.app %>',
				dest: '<%= config.dist %>'
			}
		},

		// Compres dist files to package
		compress: {
			dist: {
				options: {
					archive: 'package/Environment Monitor<%= config.manifest.version %>.zip'
				},
				files: [{
					expand: true,
					cwd: 'dist/',
					src: ['**'],
					dest: ''
				}]
			}
		}
	});

	grunt.registerTask('debug', function () {
		grunt.task.run([
			'jshint',
			'concurrent:chrome',
			'connect:chrome',
			'watch'
		]);
	});

	grunt.registerTask('test', [
		'connect:test',
		'mocha'
	]);

	grunt.registerTask('build', [
		'jshint',
		'clean:dist',
		'chromeManifest:dist',
		'useminPrepare',
		'concurrent:dist',
		'concat',
		'cssmin',
		'uglify',
		'copy',
		'usemin',
		'compress',
		'htmlcompressor'
	]);

	grunt.registerTask('release', [
		'jshint',
		'test',
		'clean:dist',
		'chromeManifest:release',
		'useminPrepare',
		'concurrent:dist',
		'concat',
		'cssmin',
		'uglify',
		'copy',
		'usemin',
		'compress',
		'htmlcompressor'
	]);

	grunt.registerTask('default', [
		'jshint',
		'test',
		'build'
	]);
};
