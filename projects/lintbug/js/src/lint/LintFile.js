//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('lintbug.LintFile')

//@Require('Class')
//@Require('List')
//@Require('Obj')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack             = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class               = bugpack.require('Class');
var List                = bugpack.require('List');
var Obj                 = bugpack.require('Obj');
var BugFlow             = bugpack.require('bugflow.BugFlow');
var BugFs               = bugpack.require('bugfs.BugFs');


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

/**
 * @class
 * @extends {Obj}
 */
var LintFile = Class.extend(Obj, {


    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {Path} filePath
     * @param {string} fileContents
     */
    _constructor: function(filePath, fileContents) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------


        /**
         * @private
         * @type {string}
         */
        this.fileContents           = fileContents;

        /**
         * @private
         * @type {Path}
         */
        this.filePath               = filePath;

        /**
         * @private
         * @type {string}
         */
        this.originalFileContents   = fileContents;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getFileContents: function() {
        return this.fileContents;
    },

    /**
     * @param {string} fileContents
     */
    setFileContents: function(fileContents) {
        this.fileContents = fileContents;
    },

    /**
     * @return {Path}
     */
    getFilePath: function() {
        return this.filePath;
    },

    /**
     * @return {string}
     */
    getOriginalFileContents: function() {
        return this.originalFileContents;
    },


    //-------------------------------------------------------------------------------
    // Convenience Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {boolean}
     */
    hasFileChanged: function() {
        return this.fileContents !== this.originalFileContents;
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('lintbug.LintFile', LintFile);
