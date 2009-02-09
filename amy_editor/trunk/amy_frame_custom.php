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

	Custom frame page view

  *------------------------------------------------------------------------------------------
*/
	function shutdown()
	{
		if (class_exists('Db'))
		{
			Db::close_connection();
		}
	}
	register_shutdown_function('shutdown');

	function paste_content()
	{
		include 'lib/amy/simple_http.php';
		$url = parse_url($_REQUEST['frame_url']);
		$headers = array();
		$params = array();
		$query = explode('=', $url['query']);
		$n = sizeof($query);
		for ($i=0; $i<$n; $i+=2)
		{
			$params[$query[$i]] = $query[$i+1];
		}
	    $response = SimpleHTTP::send('GET', $url['host'], 80, $url['path'], $params, $headers);
		echo $response['body'];
	}


	if ('frame' == $_REQUEST['act_as'])
	{
		ob_start("ob_gzhandler");
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		
		<meta name="Author" content="All: Petr Krontorád, April-Child.com" />
		<meta name="Copyright" content="Petr Krontorád, April-Child.com (http://www.april-child.com)" />
	
		<title>Amy Editor</title>

		<link href="client/fry/mm/style/ac.ui.css" rel="stylesheet" type="text/css" />
		<link href="client/fry/mm/style/theme/apple/theme-apple.css" rel="stylesheet" type="text/css" />
		<link href="mm/style/amy.css" rel="stylesheet" type="text/css" />
		
        <script type="text/javascript">
        </script>
	</head>
	<body scroll="no">
	<?php
		echo paste_content();
	?>
	</body>
</html><?php
	}
	else
	{
		echo paste_content();
	}
?>