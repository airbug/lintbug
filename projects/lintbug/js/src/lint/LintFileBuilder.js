/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('lintbug.LintFileBuilder')

//@Require('Class')
//@Require('Flows')
//@Require('List')
//@Require('Obj')
//@Require('bugfs.BugFs')
//@Require('lintbug.LintFile')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Flows       = bugpack.require('Flows');
    var List        = bugpack.require('List');
    var Obj         = bugpack.require('Obj');
    var BugFs       = bugpack.require('bugfs.BugFs');
    var LintFile    = bugpack.require('lintbug.LintFile');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $task       = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var LintFileBuilder = Class.extend(Obj, {

        _name: "lintbug.LintFileBuilder",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Path} filePath
         */
        _constructor: function(filePath) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
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
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Error, LintFile=)} callback
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
});
