/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

var bugpack     = require("bugpack").loadContextSync(module);


//-------------------------------------------------------------------------------
// Script
//-------------------------------------------------------------------------------

bugpack.loadExportSync("lintbug.Lintbug");


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Lintbug     = bugpack.require("lintbug.Lintbug");


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = Lintbug;
