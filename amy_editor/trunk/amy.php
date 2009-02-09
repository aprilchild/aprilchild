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

	Main page view

  *------------------------------------------------------------------------------------------
*/

	$act_as = isset($_REQUEST['act_as']) ? $_REQUEST['act_as'] : 'amy';
	
	if ('facebook' == $act_as)
	{
		include 'amy_facebook.php';
		exit();
	}

	if ('amy' == $act_as)
	{
		try
		{
			include 'amy_frame.php';
		}
		catch (Exception $e)
		{
			
		}
		exit();
	}
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
                    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		
		<meta name="Author" content="All: Petr Krontorád, April-Child.com" />
		<meta name="Copyright" content="Petr Krontorád, April-Child.com (http://www.april-child.com)" />
	
		<title><?php echo isset($_REQUEST['title']) ? $_REQUEST['title'] : 'Amy Editor'; ?></title>
		
	</head>
<?php
	if ('iframe' == $act_as)
	{
?>
	<body scroll="no" onload="repositionate_iframe()" style="margin:0;padding:0;border:0">
		<script type="text/javascript">
			var page_height = 0;
			var page_width = 0;
			var iframe_height = 0;

			function repositionate_iframe()
			{
				var iframe = document.getElementsByTagName('iframe').item(0);
				page_width = document.documentElement.offsetWidth || document.body.offsetWidth;
				page_height = self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
				var height = document.getElementsByTagName('div').item(0).offsetHeight;
				iframe_height = page_height - height;
				iframe.style.position = 'absolute';
				iframe.style.left = '0px';
				iframe.style.top = height + 'px';
				iframe.style.width = page_width + 'px';
				iframe.style.height = iframe_height + 'px';
				iframe.src = iframe.getAttribute('a_src');
				setTimeout(wait_for_amy, 200);
			}

			function wait_for_amy()
			{
				var amy = null;
				// waiting for Amy to become ready
				var t = setInterval(function()
				{
					if (self.frames[0] && self.frames[0].document && self.frames[0]['amy']['isReady'])
					{
						clearInterval(t);
						if ('function' == typeof on_amy_load)
						{
							on_amy_load(self.frames[0]['amy'], self.frames[0]);
						}
					}
				}, 400);
			}

		</script>
		<div>
		<!-- generated_content -->
<?php
			include "amy_frame_custom.php";
?>
		<!-- eogenerated_content -->
		</div>
		<iframe id="iamy" a_src="amy_frame.php?<?php echo $_SERVER['QUERY_STRING']; ?>" style="border:0" border="0" frameborder="0"></iframe>
	</body>
<?php
	}
	else if ('frame' == $act_as)
	{
?>
	<frameset rows="<?php echo isset($_REQUEST['height']) ? $_REQUEST['height'] : '40'; ?>,*" style="border:0" border="0" frameborder="0">
		<frame src="amy_frame_custom.php?frame_url=<?php echo $_REQUEST['frame_url']; ?>"></frame>
		<frame src="amy_frame.php?<?php echo $_SERVER['QUERY_STRING']; ?>"></frame>
	</frameset>
<?php		
	}
	else
	{
		echo "<body>Invalid `act_as' parameter in URL. Amy will not be launched.</body>";
	}
?>
</html>
