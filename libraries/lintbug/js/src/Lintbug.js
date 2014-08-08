/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * lintbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('lintbug.Lintbug')

//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('List')
//@Require('Map')
//@Require('Obj')
//@Require('Proxy')
//@Require('bugfs.BugFs')
//@Require('bugfs.FileFinder')
//@Require('lintbug.LintFileBuilder')
//@Require('lintbug.LintTask')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Exception           = bugpack.require('Exception');
    var Flows               = bugpack.require('Flows');
    var List                = bugpack.require('List');
    var Map                 = bugpack.require('Map');
    var Obj                 = bugpack.require('Obj');
    var Proxy               = bugpack.require('Proxy');
    var BugFs               = bugpack.require('bugfs.BugFs');
    var FileFinder          = bugpack.require('bugfs.FileFinder');
    var LintFileBuilder     = bugpack.require('lintbug.LintFileBuilder');
    var LintTask            = bugpack.require('lintbug.LintTask');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $forEachSeries      = Flows.$forEachSeries;
    var $iterableParallel   = Flows.$iterableParallel;
    var $series             = Flows.$series;
    var $task               = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var Lintbug = Class.extend(Obj, {

        _name: "lintbug.Lintbug",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Map.<string, LintTask>}
             */
            this.lintTaskMap    = new Map();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Map.<string, LintTask>}
         */
        getLintTaskMap: function() {
            return this.lintTaskMap;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {Array.<(Path | string)>} targetPaths
         * @param {Array.<(string | RegExp)>} ignores
         * @param {Array.<string>} lintTasks
         * @param {function(Throwable=)} callback
         */
        lint: function(targetPaths, ignores, lintTasks, callback) {
            var _this = this;
            this.getJsFilePaths(targetPaths, ignores, function(throwable, jsFilePaths) {
                if (!throwable) {
                    $iterableParallel(jsFilePaths, function(flow, jsFilePath) {
                        var lintFile = null;
                        $series([
                            $task(function(flow) {
                                _this.generateLintFile(jsFilePath, function(throwable, _lintFile) {
                                    if (!throwable) {
                                        lintFile = _lintFile;
                                    }
                                    flow.complete(throwable);
                                });
                            }),
                            $task(function(flow) {
                                _this.runLintTasks(lintFile, lintTasks, function(throwable) {
                                    flow.complete(throwable);
                                })
                            }),
                            $task(function(flow) {
                                _this.rewriteLintFile(lintFile, function(throwable) {
                                    flow.complete(throwable);
                                })
                            })
                        ]).execute(function(throwable) {
                            flow.complete(throwable);
                        });
                    }).execute(callback);
                } else {
                    callback(throwable);
                }
            });
        },

        /**
         * @static
         * @param {string} taskName
         * @param {function(LintFile, function(Throwable=))} taskMethod
         */
        lintTask: function(taskName, taskMethod) {
            var lintTask = new LintTask(taskName, taskMethod);
            this.registerLintTask(lintTask);
            return lintTask;
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Array.<(string | Path)>} targetPaths
         * @param {(Array.<(string | RegExp)>)} ignorePatterns
         * @param {function(Throwable, Set.<Path>=)} callback
         */
        getJsFilePaths: function(targetPaths, ignorePatterns, callback) {
            var fileFinder = new FileFinder([".*\\.js$"], ignorePatterns);
            fileFinder.scan(targetPaths, function(throwable, sourcePathSet) {
                if (!throwable) {
                    callback(null, sourcePathSet);
                } else {
                    callback(throwable);
                }
            });
        },

        /**
         * @private
         * @param {Path} jsFilePath
         * @param {function(Throwable, LintFile=)} callback
         */
        generateLintFile: function(jsFilePath, callback) {
            var lintFileBuilder = new LintFileBuilder(jsFilePath);
            lintFileBuilder.build(callback);
        },

        /**
         * @private
         * @param {string} taskName
         * @return {LintTask}
         */
        getLintTask: function(taskName) {
            return this.lintTaskMap.get(taskName);
        },

        /**
         * @private
         * @param {LintTask} lintTask
         */
        registerLintTask: function(lintTask) {
            if (!this.lintTaskMap.containsKey(lintTask.getTaskName())) {
                this.lintTaskMap.put(lintTask.getTaskName(), lintTask);
            } else {
                throw new Exception("LintTaskAlreadyRegistered", {}, "Lint task already registered with the name '" + lintTask.getTaskName() + "'");
            }
        },

        /**
         * @private
         * @param {LintFile} lintFile
         * @param {function(Throwable=)} callback
         */
        rewriteLintFile: function(lintFile, callback) {
            if (lintFile.hasFileChanged()) {
                BugFs.writeFile(lintFile.getFilePath(), lintFile.getFileContents(), callback);
            } else {
                callback();
            }
        },

        /**
         * @private
         * @param {LintFile} lintFile
         * @param {Array.<string>} lintTaskNames
         * @param {function(Throwable=)} callback
         */
        runLintTasks: function(lintFile, lintTaskNames, callback) {
            var _this = this;
            $forEachSeries(lintTaskNames, function(flow, lintTaskName) {
                var lintTask = _this.getLintTask(lintTaskName);
                if (lintTask) {
                    lintTask.runTask(lintFile, function (throwable) {
                        flow.complete(throwable);
                    });
                } else {
                    flow.error(new Exception("LintTaskNotFound", {}, "Could not find lint task by they name of '" + lintTaskName + "'"));
                }
            }).execute(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @private
     * @type {Lintbug}
     */
    Lintbug.instance = null;


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @return {Lintbug}
     */
    Lintbug.getInstance = function() {
        if (!Lintbug.instance) {
            Lintbug.instance = new Lintbug();
        }
        return Lintbug.instance;
    };


    //-------------------------------------------------------------------------------
    // Static Proxy
    //-------------------------------------------------------------------------------

    Proxy.proxy(Lintbug, Proxy.method(Lintbug.getInstance), [
        "lint",
        "lintTask"
    ]);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('lintbug.Lintbug', Lintbug);
});
