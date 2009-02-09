<?php
/*
	 * AC Fry - JavaScript Framework v1.0
	 *
	 * MVC production code loader
	 *
	 * (c)2006 Petr Krontorad, April-Child.com
	 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
	 * http://www.april-child.com. All rights reserved.
	 * See the license/license.txt for additional details regarding the license.
	 * Special thanks to Matt Groening and David X. Cohen for all the robots.
	 */

	ob_start("ob_gzhandler");
	header('Content-Type: text/javascript; charset=UTF-8');
	
	include('../3rdparty/firebug/firebug.js');
	include('../ac.fry.js');
	?>
	fry.__production_mode = true;
	<?php
	include('../ac.fry.keyboard.js');
	include('../ac.fry.ui.js');
	include('../ac.fry.xml.js');
	include('../ac.fry.data.js');
	include('../ac.fry.ui.widget.js');
	include('../ac.fry.mvc.js');
