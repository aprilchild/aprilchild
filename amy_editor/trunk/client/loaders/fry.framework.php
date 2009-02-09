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

	Fry Framework supporting libraries loader

  *------------------------------------------------------------------------------------------
*/

	ob_start("ob_gzhandler");
	header('Content-Type: text/javascript; charset=UTF-8');
	
	include('../fry/ac.fry.data.calendar.js');
	include('../fry/ac.fry.ui.support.js');
	include('../fry/ac.fry.ui.form.js');
	
	include('../fry/widget/ac.tabpane.js');
	include('../fry/widget/ac.browser.js');
	include('../fry/widget/ac.tableview.js');
	include('../fry/widget/ac.outlineview.js');
	include('../fry/widget/ac.accordion.js');
	include('../fry/widget/ac.menu.js');
	include('../fry/widget/ac.searchbox.js');
	include('../fry/widget/ac.tree.js');
	include('../fry/widget/ac.window.js');
//	include('../fry/widget/ac.mapgraph.js');
	include('../fry/widget/ac.stub.bocombo.js');
//	include('../fry/widget/ac.stub.bomcombo.js');
	include('../fry/widget/ac.filechooser.js');
	include('../fry/3rdparty/SWFUpload/mmSWFUpload.js');

	include('../fry/chap/ac.chap.js');
	include('../fry/chap/ac.chap.view.js');
	include('../fry/chap/ac.chap.settings.js');