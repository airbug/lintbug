/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * lintbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('lintbug.LintTask')

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
    var LintTask = Class.extend(Obj, {

        _name: "lintbug.LintTask",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {string} taskName
         * @param {string} taskMethod
         */
        _constructor: function(taskName, taskMethod) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {string}
             */
            this.taskName       = taskName;

            /**
             * @private
             * @type {function(Error)}
             */
            this.taskMethod       = taskMethod;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {string}
         */
        getTaskName: function() {
            return this.taskName;
        },

        /**
         * @return {string}
         */
        getTaskMethod: function(fileContents) {
            return this.taskMethod;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {LintFile} lintFile
         * @param {function(Error)} callback
         */
        runTask: function(lintFile, callback) {
            this.taskMethod.call(undefined, lintFile, callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('lintbug.LintTask', LintTask);
});
