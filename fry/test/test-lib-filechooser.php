<?php
	ob_start("ob_gzhandler");
	header('Content-Type: text/javascript; charset=UTF-8');
	
	include('../ac.fry.data.calendar.js');
	include('../ac.fry.ui.support.js');
	include('../ac.fry.ui.form.js');
	
	include('../widget/ac.menu.js');
	include('../widget/ac.searchbox.js');
	include('../widget/ac.window.js');
	include('../widget/ac.browser.js');
	include('../widget/ac.tableview.js');
	include('../widget/ac.outlineview.js');
	include('../widget/ac.tree.js');
	include('../widget/ac.stub.bocombo.js');
	include('test-locale-ac.filechooser.js');
	
	// include('../widget/ac.filechooser.js');
// 
// 	include('fry/widget/ac.browser.js');
// 	include('fry/widget/ac.tableview.js');
// 	include('fry/widget/ac.outlineview.js');
// 	include('fry/widget/ac.accordion.js');
// 	include('fry/widget/ac.menu.js');
// 	include('fry/widget/ac.searchbox.js');
// 	include('fry/widget/ac.tree.js');
// 	include('fry/widget/ac.window.js');
// //	include('fry/widget/ac.mapgraph.js');
// 	include('fry/widget/ac.stub.bocombo.js');
// //	include('fry/widget/ac.stub.bomcombo.js');
// 	include('fry/widget/ac.filechooser.js');
// 	include('fry/3rdparty/SWFUpload/mmSWFUpload.js');

	//         			$include('test/test-locale-ac.filechooser.js');
	// // we need to include some widgets (filechooser is a combined widget)
	// $include('ac.fry.ui.support.js');
	//         			$include('widget/ac.menu.js');
	//         			$include('widget/ac.searchbox.js');
	//         			$include('widget/ac.window.js');
	//         			$include('widget/ac.browser.js');
	//         			$include('widget/ac.tableview.js');
	//         			$include('widget/ac.outlineview.js');
	// $include('widget/ac.tree.js');
	// $include('widget/ac.stub.bocombo.js');
	//         			$include('widget/ac.filechooser.js');
	// // we'll need some calendar support
	// $include('ac.fry.data.calendar.js');
	// 
	// $include('test/test-mvc-ac.filechooser.js');