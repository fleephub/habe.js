
module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            //options: { preserveComments: 'some' },
            habe: {
                options: { banner: "/* habe.min.js */\n" },
                files: { 'dist/habe.min.js': 'habe.js' } },
        },

        //nodeunit: { files: ['test/*_test.js'] },

        jshint: {
            jsfiles: { src: ['*.js'] },
            options: {
                "eqeqeq": true,
                "bitwise": true,
                "forin": true,
                "immed": true,
                "latedef": true,
                "newcap": true,
                "noarg": true,
                "undef": true,
                "unused": true,
                "freeze": true,

                "esnext": true,
                "eqnull": true,
                "predef": ["exports", "window", "module", "define", "console"]
            }
        },
        'node-qunit': {
            'qunit-habe-expr': { code: './habe.js', tests: './test_habe.js'},
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-node-qunit');

    grunt.registerTask('default', ['jshint', 'uglify', 'node-qunit']);
};

