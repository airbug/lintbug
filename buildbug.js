//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var buildbug = require('buildbug');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject    = buildbug.buildProject;
var buildProperties = buildbug.buildProperties;
var buildTarget     = buildbug.buildTarget;
var enableModule    = buildbug.enableModule;
var parallel        = buildbug.parallel;
var series          = buildbug.series;
var targetTask      = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

var aws         = enableModule("aws");
var bugpack     = enableModule('bugpack');
var bugunit     = enableModule('bugunit');
var clientjs    = enableModule('clientjs');
var core        = enableModule('core');
var nodejs      = enableModule('nodejs');


//-------------------------------------------------------------------------------
// Values
//-------------------------------------------------------------------------------

var version         = "0.0.3";


//-------------------------------------------------------------------------------
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    packageJson: {
        name: "lintbug",
        version: version,
        main: "./scripts/lintbug-module.js",
        bin: "bin/lintbug",
        dependencies: {
            bugpack: 'https://s3.amazonaws.com/airbug/bugpack-0.0.5.tgz'
        }
    },
    sourcePaths: [
        '../bugjs/projects/bugcli/js/src',
        '../bugjs/projects/bugflow/js/src',
        '../bugjs/projects/bugfs/js/src',
        '../bugjs/projects/bugjs/js/src',
        '../bugjs/projects/bugmeta/js/src',
        '../bugjs/projects/bugtrace/js/src',
        "../bugunit/projects/bugdouble/js/src",
        "../bugunit/projects/bugunit/js/src",
        './projects/lintbug/js/src'
    ],
    scriptPaths: [
        "../bugunit/projects/bugunit/js/scripts",
        "./projects/lintbug/js/scripts"
    ],
    testPaths: [
        "../bugjs/projects/bugcli/js/test",
        "../bugjs/projects/bugflow/js/test",
        "../bugjs/projects/bugjs/js/test"
    ],
    binPaths: [
        "./projects/lintbug/bin"
    ]
});


//-------------------------------------------------------------------------------
// Declare Tasks
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
// Declare Flows
//-------------------------------------------------------------------------------

// Clean Flow
//-------------------------------------------------------------------------------

buildTarget('clean').buildFlow(
    targetTask('clean')
);


// Local Flow
//-------------------------------------------------------------------------------

buildTarget('local').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        targetTask('createNodePackage', {
            properties: {
                packageJson: buildProject.getProperty("packageJson"),
                sourcePaths: buildProject.getProperty("sourcePaths"),
                scriptPaths: buildProject.getProperty("scriptPaths"),
                testPaths: buildProject.getProperty("testPaths"),
                binPaths: buildProject.getProperty("binPaths")
            }
        }),
        targetTask('generateBugPackRegistry', {
            init: function(task, buildProject, properties) {
                var nodePackage = nodejs.findNodePackage(
                    buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version")
                );
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            }
        }),
        targetTask('packNodePackage', {
            properties: {
                packageName: buildProject.getProperty("packageJson.name"),
                packageVersion: buildProject.getProperty("packageJson.version")
            }
        }),
        targetTask('startNodeModuleTests', {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(
                    buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version")
                );
                task.updateProperties({
                    modulePath: packedNodePackage.getFilePath()
                });
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version"));
                task.updateProperties({
                    file: packedNodePackage.getFilePath(),
                    options: {
                        acl: 'public-read'
                    }
                });
            },
            properties: {
                bucket: buildProject.getProperty("local-bucket")
            }
        })
    ])
).makeDefault();


// Prod Flow
//-------------------------------------------------------------------------------

buildTarget('prod').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        targetTask('createNodePackage', {
            properties: {
                packageJson: buildProject.getProperty("packageJson"),
                sourcePaths: buildProject.getProperty("sourcePaths"),
                scriptPaths: buildProject.getProperty("scriptPaths"),
                testPaths: buildProject.getProperty("testPaths")
            }
        }),
        targetTask('generateBugPackRegistry', {
            init: function(task, buildProject, properties) {
                var nodePackage = nodejs.findNodePackage(
                    buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version")
                );
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            }
        }),
        targetTask('packNodePackage', {
            properties: {
                packageName: buildProject.getProperty("packageJson.name"),
                packageVersion: buildProject.getProperty("packageJson.version")
            }
        }),
        targetTask('startNodeModuleTests', {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(
                    buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version")
                );
                task.updateProperties({
                    modulePath: packedNodePackage.getFilePath()
                });
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version"));
                task.updateProperties({
                    file: packedNodePackage.getFilePath(),
                    options: {
                        acl: 'public-read',
                        encrypt: true
                    }
                });
            },
            properties: {
                bucket: "{{prod-deploy-bucket}}"
            }
        })
    ])
);
