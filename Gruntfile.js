'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var config = {
        name: 'gl10n',
        src: 'src',
        lib: 'lib',
        dist: 'dist',
        example: 'examples'
    };

    try {
        config.src = require('./component.json').appPath || config.src;
    } catch (e) {}

    grunt.initConfig({
        config: config,
        livereload: {
            port: 35333
        },
        watch: {
            livereload: {
                files: [
                    '<%= config.example %>/{,*/}*.html',
                    '{.tmp,<%= config.example %>}/{,*/}*.css',
                    '<%= config.example %>/{,*/}*.js',
                    '{.tmp,<%= config.src %>}/{,*/}*.js'
                ],
                tasks: ['livereload']
            }
        },
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, config.lib),
                            mountFolder(connect, config.src),
                            mountFolder(connect, config.example)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function(connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dev: {
                options: {}
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= config.src %>/{,*/}*.js'
            ]
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                runnerPort: 9999,
                // browsers: ['Chrome', 'Firefox']
            },
            unit: {
                reporters: 'dots'
            },
            debug: {
                singleRun: false,
                browsers: ['Chrome']
            },
            dev: {
                singleRun: false,
                browsers: ['PhantomJS', 'Chrome']
            },
            ci: {
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        concat: {
            dist: {
                files: {
                    '<%= config.dist %>/<%= config.name %>.js': [
                        '.tmp/{,*/}*.js',
                        '<%= config.src %>/{,*/}*.js'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= config.dist %>/<%= config.name %>.min.js': [
                        '<%= config.dist %>/<%= config.name %>.js'
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.src %>',
                    dest: '<%= config.dist %>',
                    src: []
                }]
            },
            bower: {
                files: {
                    'lib/gextend/extend.js': ['.lib_tmp/gextend/src/*.js'],
                    'lib/requirejs/require.js': ['.lib_tmp/requirejs/require.js'],
                    'lib/gkeypath/keypath.js': ['.lib_tmp/gkeypath/src/*.js']
                }
            }
        },
        //https://github.com/vojtajina/grunt-bump
        bump: {
            options: {
                files: ['package.json', 'bower.json', 'component.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json', 'bower.json', 'component.json'], // '-a' for all files
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('server', [
        'clean:server',
        'livereload-start',
        'connect:livereload',
        'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'clean:server',
        'connect:test',
        'karma:ci'
    ]);

    grunt.registerTask('travis', [
        'copy:bower',
        'clean:server',
        'connect:test',
        'karma:ci'
    ]);

    grunt.registerTask('build', [
        'copy:bower',
        // 'jshint',
        'test',
        'concat',
        'copy',
        'uglify',
    ]);

    grunt.registerTask('default', ['build']);
};