/*global module:false*/
module.exports = function (grunt) {



    // Project configuration.
    grunt.initConfig({
            // Metadata.
            pkg: grunt.file.readJSON('package.json'),

            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',



            jade: {
                development: {
                    options: {
                        data: {
                            debug: false
                        }
                    },
                    files: [
                        {
                            expand: true,
                            cwd: './public/partials/jade/',
                            dest: './public/partials',
                            src: '**/*.jade',
                            ext: '.html'
                        }
                    ]
                }
            },

            less: {
                development: {
                    files: [
                        {
                            expand: true,
                            cwd: './public/css/less',
                            dest: './public/css',
                            src: '*.less',
                            ext: '.css'
                        }
                    ]
                }
            },

            watch: {

                jade: {
                    files: ['./public/partials/jade/**/*.jade'],
                    tasks: ["jade"],
                    options: {
                        event: ['all'],
                        atBegin: true
                    }
                },

                less: {
                    files: ['./public/css/less/**/*.less'],
                    tasks: ["less"],
                    options: {
                        event: ['all'],
                        atBegin: true
                    }
                }
            }
        }
    );


    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-less');
};
