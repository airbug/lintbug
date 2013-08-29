//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('lintbug')

//@Export('LintFileBuilder')

//@Require('Class')
//@Require('List')
//@Require('Obj')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('lintbug.LintFile')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class       = bugpack.require('Class');
var List        = bugpack.require('List');
var Obj         = bugpack.require('Obj');
var BugFlow     = bugpack.require('bugflow.BugFlow');
var BugFs       = bugpack.require('bugfs.BugFs');
var LintFile    = bugpack.require('lintbug.LintFile');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $forEachParallel    = BugFlow.$forEachParallel;
var $iterableParallel   = BugFlow.$iterableParallel;
var $if                 = BugFlow.$if;
var $series             = BugFlow.$series;
var $task               = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var LintFileBuilder = Class.extend(Obj, {


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @param {Path} filePath
     */
    _constructor: function(filePath) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Path}
         */
        this.filePath = filePath;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Path}
     */
    getFilePath: function() {
        return this.filePath;
    },


    //-------------------------------------------------------------------------------
    // Instance Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Error, LintFile)} callback
     */
    build: function(callback) {
        var _this = this;
        var lintFile = null;
        $task(function(flow) {
            _this.filePath.readFile("utf8", function(error, contents) {
                if (!error) {
                    lintFile = new LintFile(_this.filePath, contents);
                }
                flow.complete(error);
            })
        }).execute(function(error) {
            if (!error) {
                callback(undefined, lintFile);
            } else {
                callback(error);
            }
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('lintbug.LintFileBuilder', LintFileBuilder);
