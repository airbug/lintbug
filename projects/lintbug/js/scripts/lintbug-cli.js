//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Require('bugflow.BugFlow')
//@Require('lintbug.LintbugCli')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFlow     = bugpack.require('bugflow.BugFlow');
var LintbugCli  = bugpack.require('lintbug.LintbugCli');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series =   BugFlow.$series;
var $task =     BugFlow.$task;


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

var startTime = (new Date()).getTime();
var lintbugCli = new LintbugCli();
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
