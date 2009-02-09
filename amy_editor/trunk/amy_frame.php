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

	Frame page view

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

	ob_start("ob_gzhandler");

	try
	{
		include_once dirname(__FILE__).'/conf/amy/configuration.php';
		include_once dirname(__FILE__).'/lib/amy.php';		
	}
	catch (Exception $e)
	{
		if ('development' == $GLOBALS['_AMY_CONF']['environment'])
		{
			echo '<h1>Amy Editor Exception</h1>';
			echo $e->getMessage();
			echo '<hr/><pre>';
			print_r($e);
		}
	}

	if (isset($GLOBALS['amy_user']) && $GLOBALS['amy_user'] instanceof AmyUser)
	{
		$amy_user = $GLOBALS['amy_user'];
	}
	else
	{
		try
		{
			$session = new AmySession($_AMY_CONF);
			$session->authorize();
			$amy_user = new AmyUser($_AMY_CONF);
			$amy_user->load_from_session($session);
		}
		catch (Exception $e)
		{
		}
	}
	try
	{
		if (!is_object($amy_user))
		{
			$amy_user = new AmyUser($_AMY_CONF);
		}
		if (!$amy_user->is_authorized())
		{
			$amy_user->make_default();
		}
		$amy_session = $amy_user->create_session();
	}
	catch (Exception $e)
	{
		if ('development' == $GLOBALS['_AMY_CONF']['environment'])
		{
			echo '<h1>Amy Editor Exception</h1>';
			echo $e->getMessage();
			echo '<hr/><pre>';
			print_r($e);
			die();
		}
	}

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
			// reserving `amy' namespace
			var amy = {};
        	var client =
        	{
        		conf:
        		{
					locale:'<?php echo isset($_REQUEST['locale']) ? $_REQUEST['locale'] : 'en'; ?>',
        			progid:'amy-1.0b',
        			fry:
        			{
        				backendURL:'backend/amy.php',
						theme:'apple'
					},
					environment:'php',
					defaultProjectUrl:'<?php echo $_REQUEST['project_url']; ?>',
					masquerade:<?php echo $_REQUEST['masquerade'] ? 'true' : 'false'; ?>,
					user:
					{
						id:'<?php echo $amy_user->userId; ?>',
						username:'<?php echo $amy_user->username; ?>',
						service:'<?php echo $amy_user->service; ?>',
						credentials:{
							nickname:'<?php echo $amy_user->credentials['nickname']; ?>',
							picture:'<?php echo $amy_user->credentials['picture']; ?>'
						}
					},
					collaboration:
					{
						hash:'<?php echo $_REQUEST['invitation_code']; ?>'
					}
        		},
        		
        		onload:function()
        		{
					$('no-js-notice').rs();
					$include('../../loaders/fry.framework.php');
					$include('../../loaders/application.php');
        		}

        	};
        </script>
        <script type="text/javascript" loader="true" src="client/fry/loaders/fry.production-mvc.php"></script>
		<style type="text/css">
			textarea.editable, pre
			{
			<?php
				if ( false === strpos($_SERVER['HTTP_USER_AGENT'], 'intosh') && false === strpos($_SERVER['HTTP_USER_AGENT'], 'WebKit') )
				{
					echo "font:11px 'Courier New', 'Courier', monospaced;";
				}
				else
				{
					// echo "font:11px 'Bitstream Vera Sans Mono', 'Courier', monospaced;";
					echo "font:11px 'Courier', monospaced;";
				}
			?>
			}
			
		</style>

	</head>
	<body scroll="no">
	
	
		<div id="splash">
			<h1><?php echo $_REQUEST['masq_title'] ? $_REQUEST['masq_title'] : 'Amy Editor 1.0'; ?></h1>
			<p><?php echo $_REQUEST['masq_description'] ? $_REQUEST['masq_description'] : 'A Collaborative Text and Source Code Editor for Developers.'; ?><?php echo !$amy_user->is_default() ? (' Identity: <span style="font-weight:bold;color:#888">' . $amy_user->credentials['nickname'] . '</span>.') : ''; ?></p>
			<strong>.</strong>
			<p style="text-align:right;font-size:0.9em;display:none">Written and designed by Petr Krontorád</p>
		</div>
		
		<div id="no-js-notice">
			If you see this message, your browser cannot run the editor at the moment. Please make sure your browser settings does not prohibit use of JavaScript.
		</div>
		<script type="text/javascript">
			var notice = document.getElementById('no-js-notice');
			notice.parentNode.removeChild(notice);
		</script>

		<div id="no-support-notice" style="display:none">
			Your browser cannot run the editor. Please use one of the following: Safari, Firefox or any browser based on these (Camino, ...). If you are courageous though, you may <a href="javascript:client.onstart(true)">launch the editor here</a>, but please be warned, there are probably some unresolved issues in the various state of annoyance that might prevent using some parts of the editor...
		</div>
		
		<!-- serves only for saving files to disk -->
		<iframe name="_download" style="visibility:hidden" id="_download" src="about:blank"></iframe>
		
	</body>
</html>
