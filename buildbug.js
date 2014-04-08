//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var buildbug            = require('buildbug');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject        = buildbug.buildProject;
var buildProperties     = buildbug.buildProperties;
var buildTarget         = buildbug.buildTarget;
var enableModule        = buildbug.enableModule;
var parallel            = buildbug.parallel;
var series              = buildbug.series;
var targetTask          = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

var aws                 = enableModule("aws");
var bugpack             = enableModule('bugpack');
var bugunit             = enableModule('bugunit');
var clientjs            = enableModule('clientjs');
var core                = enableModule('core');
var nodejs              = enableModule('nodejs');


//-------------------------------------------------------------------------------
// Values
//-------------------------------------------------------------------------------

var version             = "0.0.4";
var dependencies        = {
    bugpack: "0.1.5"
};


//-------------------------------------------------------------------------------
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    node: {
        binPaths: [
            "./projects/lintbug/bin"
        ],
        packageJson: {
            name: "lintbug",
            version: version,
            main: "./scripts/lintbug-module.js",
            bin: "bin/lintbug",
            dependencies: dependencies
        },
        readmePath: "./README.md",
        sourcePaths: [
            '../bugcore/projects/bugcore/js/src',
            '../bugflow/projects/bugflow/js/src',
            '../bugfs/projects/bugfs/js/src',
            '../bugjs/projects/bugcli/js/src',
            '../bugtrace/projects/bugtrace/js/src',
            './projects/lintbug/js/src'
        ],
        scriptPaths: [
            "./projects/lintbug/js/scripts"
        ],
        unitTest: {
            packageJson: {
                name: "lintbug-test",
                version: version,
                main: "./scripts/lintbug-module.js",
                dependencies: dependencies,
                scripts: {
                    test: "./scripts/bugunit-run.js"
                }
            },
            sourcePaths: [
                "../buganno/projects/buganno/js/src",
                "../bugjs/projects/bugyarn/js/src",
                "../bugmeta/projects/bugmeta/js/src",
                "../bugunit/projects/bugdouble/js/src",
                "../bugunit/projects/bugunit/js/src"
            ],
            scriptPaths: [
                "../buganno/projects/buganno/js/scripts",
                "../bugunit/projects/bugunit/js/scripts"
            ],
            testPaths: [
                "../bugcore/projects/bugcore/js/test",
                "../bugflow/projects/bugflow/js/test",
                "../bugfs/projects/bugfs/js/test",
                "../bugjs/projects/bugcli/js/test",
                "../bugtrace/projects/bugtrace/js/test",
                "./projects/lintbug/js/test"
            ]
        }
    }
});


//-------------------------------------------------------------------------------
// Declare BuildTargets
//-------------------------------------------------------------------------------

// Clean BuildTarget
//-------------------------------------------------------------------------------

buildTarget('clean').buildFlow(
    targetTask('clean')
);


// Local BuildTarget
//-------------------------------------------------------------------------------

buildTarget('local').buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we're not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask('clean'),
        targetTask('createNodePackage', {
            properties: {
                binPaths: buildProject.getProperty("node.binPaths"),
                packageJson: buildProject.getProperty("node.packageJson"),
                readmePath: buildProject.getProperty("node.readmePath"),
                sourcePaths: buildProject.getProperty("node.sourcePaths").concat(
                    buildProject.getProperty("node.unitTest.sourcePaths")
                ),
                scriptPaths: buildProject.getProperty("node.scriptPaths").concat(
                    buildProject.getProperty("node.unitTest.scriptPaths")
                ),
                testPaths: buildProject.getProperty("node.unitTest.testPaths")
            }
        }),
        targetTask('generateBugPackRegistry', {
            init: function(task, buildProject, properties) {
                var nodePackage = nodejs.findNodePackage(
                    buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version")
                );
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            }
        }),
        targetTask('packNodePackage', {
            properties: {
                packageName: "{{node.packageJson.name}}",
                packageVersion: "{{node.packageJson.version}}"
            }
        }),
        targetTask('startNodeModuleTests', {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(
                    buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version")
                );
                task.updateProperties({
                    modulePath: packedNodePackage.getFilePath()
                });
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version"));
                task.updateProperties({
                    file: packedNodePackage.getFilePath(),
                    options: {
                        acl: "public-read",
                        encrypt: true
                    }
                });
            },
            properties: {
                bucket: "{{local-bucket}}"
            }
        })
    ])
).makeDefault();


// Prod BuildTarget
//-------------------------------------------------------------------------------

buildTarget('prod').buildFlow(
    series([

        targetTask('clean'),
        parallel([

            //Create test node lintbug package


            targetTask('createNodePackage', {
                properties: {
                    binPaths: buildProject.getProperty("node.binPaths"),
                    packageJson: buildProject.getProperty("node.unitTest.packageJson"),
                    readmePath: buildProject.getProperty("node.readmePath"),
                    sourcePaths: buildProject.getProperty("node.sourcePaths").concat(
                        buildProject.getProperty("node.unitTest.sourcePaths")
                    ),
                    scriptPaths: buildProject.getProperty("node.scriptPaths").concat(
                        buildProject.getProperty("node.unitTest.scriptPaths")
                    ),
                    testPaths: buildProject.getProperty("node.unitTest.testPaths")
                }
            }),
            targetTask('generateBugPackRegistry', {
                init: function(task, buildProject, properties) {
                    var nodePackage = nodejs.findNodePackage(
                        buildProject.getProperty("node.unitTest.packageJson.name"),
                        buildProject.getProperty("node.unitTest.packageJson.version")
                    );
                    task.updateProperties({
                        sourceRoot: nodePackage.getBuildPath()
                    });
                }
            }),
            targetTask('packNodePackage', {
                properties: {
                    packageName: "{{node.unitTest.packageJson.name}}",
                    packageVersion: "{{node.unitTest.packageJson.version}}"
                }
            }),
            targetTask('startNodeModuleTests', {
                init: function(task, buildProject, properties) {
                    var packedNodePackage = nodejs.findPackedNodePackage(
                        buildProject.getProperty("node.unitTest.packageJson.name"),
                        buildProject.getProperty("node.unitTest.packageJson.version")
                    );
                    task.updateProperties({
                        modulePath: packedNodePackage.getFilePath(),
                        checkCoverage: true
                    });
                }
            })
        ]),

        // Create production node lintbug package

        series([
            targetTask('createNodePackage', {
                properties: {
                    binPaths: buildProject.getProperty("node.binPaths"),
                    packageJson: buildProject.getProperty("node.packageJson"),
                    readmePath: buildProject.getProperty("node.readmePath"),
                    sourcePaths: buildProject.getProperty("node.sourcePaths"),
                    scriptPaths: buildProject.getProperty("node.scriptPaths")
                }
            }),
            targetTask('generateBugPackRegistry', {
                init: function(task, buildProject, properties) {
                    var nodePackage = nodejs.findNodePackage(
                        buildProject.getProperty("node.packageJson.name"),
                        buildProject.getProperty("node.packageJson.version")
                    );
                    task.updateProperties({
                        sourceRoot: nodePackage.getBuildPath()
                    });
                }
            }),
            targetTask('packNodePackage', {
                properties: {
                    packageName: "{{node.packageJson.name}}",
                    packageVersion: "{{node.packageJson.version}}"
                }
            }),
            targetTask("s3PutFile", {
                init: function(task, buildProject, properties) {
                    var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("node.packageJson.name"),
                        buildProject.getProperty("node.packageJson.version"));
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
    ])
);
