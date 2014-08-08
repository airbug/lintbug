/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * lintbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('lintbug.LintbugCli')

//@Require('Class')
//@Require('Flows')
//@Require('bugcli.BugCli')
//@Require('lintbug.Lintbug')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var path        = require('path');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Flows       = bugpack.require('Flows');
    var BugCli      = bugpack.require('bugcli.BugCli');
    var Lintbug     = bugpack.require('lintbug.Lintbug');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series     = Flows.$series;
    var $task       = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {BugCli}
     */
    var LintbugCli = Class.extend(BugCli, {

        _name: "lintbug.LintbugCli",


        //-------------------------------------------------------------------------------
        // BugCli Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        configure: function(callback) {
            var _this = this;
            $series([
                $task(function(flow) {
                    _this._super(function(error) {
                        flow.complete(error);
                    });
                }),
                $task(function(flow) {
                    _this.registerCliAction({
                        name: 'lint',
                        default: true,
                        flags: [
                            'lint'
                        ],
                        executeMethod: function(cliBuild, cliAction, callback) {
                            console.log("Starting lint");
                            /** @type {CliOptionInstance} */
                            var targetOption = cliBuild.getOption("target");
                            /** @type {string} */
                            var targetPath = ".";

                            if (targetOption) {
                                targetPath = targetOption.getParameter("targetPath");
                            }
                            Lintbug.lint(targetPath, callback);
                        }
                    });

                    _this.registerCliOption({
                        name: 'target',
                        flags: [
                            '-t',
                            '--target'
                        ],
                        parameters: [
                            {
                                name: "targetPath"
                            }
                        ]
                    });

                    flow.complete();
                })
            ]).execute(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('lintbug.LintbugCli', LintbugCli);
});
