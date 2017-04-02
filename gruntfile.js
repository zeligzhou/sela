//-  sela
module.exports = function(grunt){

    grunt.initConfig({
        watch: {
          jade: {
            files: ['views/**'],
            options: {
              livereload: true
            }
          },
          js: {
            files: ['bower_components/pub/**', 'models/**/*.js', 'schemas/**/*.js'],
            //tasks: ['jshint'],
            options: {
              livereload: true
            }
          },
          coffee: {
                files: ['bower_components/pub/coffee/*.coffee'],
                tasks: ['coffee:compileBare']
            },
        },
        
        coffee: {
            options: {
              bare: true
            },
            compileBare: {
                files: {
                  'bower_components/pub/js/main.js': 'bower_components/pub/coffee/main.coffee', // 1:1 compile
                  //'path/to/another.js': ['path/to/sources/*.coffee', 'path/to/more/*.coffee'] // compile and concat into single file
                }
              }
                           
        },

        nodemon: {
          dev: {
            script: 'app.js',//没加这个会一直waiting
            options: {
              file: 'app.js',
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
          }
        },

        mochaTest:{
            options:{
                reporter:"spec"
            },
            src:['test/**/*.js']
        },

        concurrent: {
          tasks: ['nodemon', 'watch'],
          options: {
            logConcurrentOutput: true
          }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.option('force', true);
    grunt.registerTask('default',['concurrent']);
    grunt.registerTask('test',['mochaTest']);
}

