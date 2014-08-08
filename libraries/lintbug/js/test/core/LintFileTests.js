/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * lintbug may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@TestFile

//@Require('Class')
//@Require('TypeUtil')
//@Require('bugfs.BugFs')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.TestTag')
//@Require('lintbug.LintFile')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var TypeUtil    = bugpack.require('TypeUtil');
    var BugFs       = bugpack.require('bugfs.BugFs');
    var BugMeta     = bugpack.require('bugmeta.BugMeta');
    var TestTag     = bugpack.require('bugunit.TestTag');
    var LintFile    = bugpack.require('lintbug.LintFile');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta     = BugMeta.context();
    var test        = TestTag.test;


    //-------------------------------------------------------------------------------
    // Declare Tests
    //-------------------------------------------------------------------------------

    /**
     *
     */
    var lintFileInstantiationTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testFilePath       = BugFs.path("/abc");
            this.testFileContents   = "testFileContents";
            this.testLintFile       = new LintFile(this.testFilePath, this.testFileContents);
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertTrue(Class.doesExtend(this.testLintFile, LintFile),
                "Assert instance of LintFile");
            test.assertEqual(this.testLintFile.getFileContents(), this.testFileContents,
                "Assert .fileContents was set correctly");
            test.assertEqual(this.testLintFile.getFilePath(), this.testFilePath,
                "Assert .filePath was set correctly");
        }
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(lintFileInstantiationTest).with(
        test().name("LintFile - instantiation test")
    );
});
