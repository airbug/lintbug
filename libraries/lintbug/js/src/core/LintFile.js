/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * lintbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('lintbug.LintFile')

//@Require('Class')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class   = bugpack.require('Class');
    var Obj     = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var LintFile = Class.extend(Obj, {

        _name: "lintbug.LintFile",


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
});
