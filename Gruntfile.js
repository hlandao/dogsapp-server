module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            html: {
                files: ['public/views/**'],
                options: {
                    livereload: true,
                    event: ['all'],
                    atBegin: true
                }
            },
            js: {
                files: ['public/js/**'],
                options: {
                    livereload: true,
                    event: ['all'],
                    atBegin: true
                }
            },
            css: {
                files: ['public/less/**'],
                tasks: ['less'],
                options: {
                    livereload: true,
                    event: ['all'],
                    atBegin: true
                }
            },
            jade: {
                files: ['public/jade/**'],
                tasks: ['jade'],
                options: {
                    livereload: true,
                    event: ['all'],
                    atBegin: true
                }
            }
        },
        jshint: {
            all: ['gruntfile.js']
        },
        less: { // Task
            dev: { // Another target
                files : [
                    {
                        expand: true,
                        cwd: './public/less',
                        dest: './public/css',
                        src: '**/*.less',
                        ext: '.css'


                    }
                ]

            }
        },
        jade: { // Task
            dev: { // Another target
                files : [
                    {
                        expand: true,
                        cwd: './public/jade',
                        dest: './public/views',
                        src: '**/*.jade',
                        ext: '.html'
                    }
                ]

            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'server.js',
                    args: [],
                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['app', 'config'],
                    debug: true,
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            },
            exec: {
                options: {
                    exec: 'less'
                }
            }
        },
        concurrent: {
            target: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    // Load NPM tasks 
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-jade');


    // Default task(s).
    grunt.registerTask('default', ['jshint', 'less', 'concurrent:target']);
};