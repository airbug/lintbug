//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('lintbug')

//@Export('Lintbug')

//@Require('Class')
//@Require('List')
//@Require('Map')
//@Require('Obj')
//@Require('Proxy')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('bugfs.FileFinder')
//@Require('lintbug.LintFileBuilder')
//@Require('lintbug.LintTask')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class               = bugpack.require('Class');
var List                = bugpack.require('List');
var Map                 = bugpack.require('Map');
var Obj                 = bugpack.require('Obj');
var Proxy               = bugpack.require('Proxy');
var BugFlow             = bugpack.require('bugflow.BugFlow');
var BugFs               = bugpack.require('bugfs.BugFs');
var FileFinder          = bugpack.require('bugfs.FileFinder');
var LintFileBuilder     = bugpack.require('lintbug.LintFileBuilder');
var LintTask            = bugpack.require('lintbug.LintTask');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $forEachParallel    = BugFlow.$forEachParallel;
var $forEachSeries      = BugFlow.$forEachSeries;
var $iterableParallel   = BugFlow.$iterableParallel;
var $if                 = BugFlow.$if;
var $series             = BugFlow.$series;
var $task               = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var Lintbug = Class.extend(Obj, {


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

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
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {Array.<(Path | string)>} targetPaths
     * @param {Array.<(string | RegExp)>} ignores
     * @param {Array.<string>} lintTasks
     * @param {function(Error)} callback
     */
    lint: function(targetPaths, ignores, lintTasks, callback) {
        var _this = this;
        this.getJsFilePaths(targetPaths, ignores, function(error, jsFilePaths) {
            if (!error) {
                $iterableParallel(jsFilePaths, function(flow, jsFilePath) {
                    var lintFile = null;
                    $series([
                        $task(function(flow) {
                            _this.generateLintFile(jsFilePath, function(error, _lintFile) {
                                if (!error) {
                                    lintFile = _lintFile;
                                }
                                flow.complete(error);
                            });
                        }),
                        $task(function(flow) {
                            _this.runLintTasks(lintFile, lintTasks, function(error) {
                                flow.complete(error);
                            })
                        })

                        //TODO BRN: Rewrite back to lint files

                    ]).execute(function(error) {
                        flow.complete(error);
                    });
                }).execute(callback);
            } else {
                callback(error);
            }
        });
    },

    /**
     * @static
     * @param {string} taskName
     * @param {function(LintFile, function(Error))} taskMethod
     */
    lintTask: function(taskName, taskMethod) {
        var lintTask = new LintTask(taskName, taskMethod);
        this.registerLintTask(lintTask);
        return lintTask;
    },


    //-------------------------------------------------------------------------------
    // Private Instance Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Array.<(string | Path)>} targetPaths
     * @param {(Array.<(string | RegExp)>)} ignorePatterns
     * @param callback
     */
    getJsFilePaths: function(targetPaths, ignorePatterns, callback) {
        var fileFinder = new FileFinder([".*\\.js"], ignorePatterns);
        fileFinder.scan(targetPaths, function(error, sourcePaths) {
            if (!error) {
                callback(null, sourcePaths);
            } else {
                callback(error);
            }
        });
    },

    /**
     * @private
     * @param {Path} jsFilePath
     * @param {function(Error, LintFile)} callback
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
            throw new Error("task already registered with the name '" + lintTask.getTaskName() + "'");
        }
    },

    /**
     * @private
     * @param {LintFile} lintFile
     * @param {Array.<string>} lintTaskNames
     * @param {function(Error)} callback
     */
    runLintTasks: function(lintFile, lintTaskNames, callback) {
        var _this = this;
        $forEachSeries(lintTaskNames, function(flow, lintTaskName) {
            var lintTask = _this.getLintTask(lintTaskName);
            lintTask.runTask(lintFile, function(error) {
                flow.complete(error);
            });
        }).execute(callback);
    }
});


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @private
 * @type {Lintbug}
 */
Lintbug.instance = undefined;


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

Proxy.proxy(Lintbug, Proxy.method(Lintbug.getInstance), [
    "lint",
    "lintTask"
]);


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('lintbug.Lintbug', Lintbug);
