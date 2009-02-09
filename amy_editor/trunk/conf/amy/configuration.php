<?php
/*
  *------------------------------------------------------------------------------------------
	Amy - collaborative web text editor for developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Amy Editor - configuration

  *------------------------------------------------------------------------------------------
	
*/

	$_AMY_CONF = array
	(
		'servers' => array
		(
			// setup your database here as: 'YOUR_VIRTUAL_HOST'=>'host=localhost port=5432 dbname=amy_editor_development user=YOUR_USER password=YOUR_PASSWORD'
			// you can put more lines for different deployments
			'amy.local'=>'host=localhost port=5432 dbname=amy_editor_development user= password='
		),
		// possible values are development|production. Try not to use `development' for production server, ever. Use `development' for troubleshooting, logging and such.
		'environment' => 'development',
		// possible values are pg|mysql
		'db-adapter' => 'postgres',
		// path to your support directory
		'support-path'=>dirname(__FILE__).'/../../support/'
	)

?>