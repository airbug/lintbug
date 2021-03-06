/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * lintbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExports(["Flows", "lintbug.LintbugCli"], function(error) {
            if (!error) {

                //-------------------------------------------------------------------------------
                // BugPack
                //-------------------------------------------------------------------------------

                var Flows           = bugpack.require('Flows');
                var LintbugCli      = bugpack.require('lintbug.LintbugCli');


                //-------------------------------------------------------------------------------
                // Simplify References
                //-------------------------------------------------------------------------------

                var $series         = Flows.$series;
                var $task           = Flows.$task;


                //-------------------------------------------------------------------------------
                // Bootstrap
                //-------------------------------------------------------------------------------

                var startTime   = (new Date()).getTime();
                var lintbugCli  = new LintbugCli();
                $series([
                    $task(function(flow) {
                        lintbugCli.configure(function(error) {
                            flow.complete(error);
                        });
                    }),
                    $task(function(flow) {
                        lintbugCli.run(process.argv, function(error) {
                            flow.complete(error);
                        });
                    })
                ]).execute(function(error) {
                    if (!error) {
                        var endTime = (new Date()).getTime();
                        console.log("lintbug ran successfully in " + (endTime - startTime) + " ms");
                    } else {
                        console.log(error);
                        console.log(error.stack);
                        console.log("lintbug encountered an error");
                        process.exit(1);
                    }
                });

            } else {
                console.log(error.message);
                console.log(error.stack);
                process.exit(1);
            }
        });
    } else {
        console.log(error.message);
        console.log(error.stack);
        process.exit(1);
    }
});

