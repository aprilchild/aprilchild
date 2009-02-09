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

	Library loader

  *------------------------------------------------------------------------------------------
*/

	if (get_magic_quotes_gpc())
	{
		$_REQUEST = array_map('stripslashes', $_REQUEST);
		$_GET = array_map('stripslashes', $_GET);
		$_POST = array_map('stripslashes', $_POST);
		$_COOKIE = array_map('stripslashes', $_COOKIE);
	}
	


	
	$__ldn = dirname(__FILE__).'/amy/';

	include_once "{$__ldn}support/simple_http.php";
	include_once "{$__ldn}support/google.php";
	include_once "{$__ldn}support/yaml.php";
	include_once "{$__ldn}support/mail.php";

	include_once "{$__ldn}amy_base.php";
	include_once "{$__ldn}amy_util.php";
	include_once "{$__ldn}amy_user.php";
	include_once "{$__ldn}amy_logger.php";
	include_once "{$__ldn}amy_bundle.php";
	include_once "{$__ldn}amy_project.php";
