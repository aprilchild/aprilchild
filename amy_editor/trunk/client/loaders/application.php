<?php
/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Application client libraries loader

  *------------------------------------------------------------------------------------------
*/


	ob_start("ob_gzhandler");
	header('Content-Type: text/javascript; charset=UTF-8');
	
	
	include('../locale.js');
	include('../helper.js');
	include('../fry/3rdparty/base64/base64.js');
	include('../model.js');
	include('../model.user.js');
	include('../model.projects.js');
	include('../model.bundles.js');
	include('../model.collaboration.js');
	include('../view.js');
	include('../controller.js');
	include('../controller.commands.js');
	include('../controller.ui.js');
	include('../controller.user.js');
	include('../controller.bundles.js');
	include('../controller.projects.js');
	include('../controller.collaboration.js');
	
	include('../wizards.js');
	


?>
/*  ----------------------------------------------------------------  */

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}
