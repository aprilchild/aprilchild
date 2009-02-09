<?php
	header('Content-Type: text/css');
	
	$http_addr = 'http://'.$_SERVER['HTTP_HOST'] . str_replace('/api/embed/amy_style.php', '', $_SERVER['SCRIPT_NAME']);
//	$http_addr = 'http://'.$_SERVER['HTTP_HOST'];
?>
.acw-chap pre, .acw-chap pre span,  span.acw-char-check, .acw-chap .selection-area div
{
<?php
	if ( false === strpos($_SERVER['HTTP_USER_AGENT'], 'intosh') && false === strpos($_SERVER['HTTP_USER_AGENT'], 'WebKit') )
	{
		echo "font:11px 'Courier New', 'Courier', monospaced;";
	}
	else
	{
		echo "font:11px 'Courier', monospaced;";
	}
?>

	line-height:11px;
	margin:0;
	padding:0;
	border:0;
}
.acw-chap .wrapped-row
{
	background-image:url('<?php echo $http_addr; ?>/mm/i/theme/apple/chap-wrapped-row.gif');
	background-repeat:no-repeat;
	background-position:25px 4px;
}
.acw-chap .sidebar
{
	background-image:url('<?php echo $http_addr; ?>/mm/i/theme/apple/chap-bg-sidebar.gif');
	line-height:11px;	
}
.acw-chap .sidebar .row-number
{
	text-align:right;
	font-size:9px;
	font-family:'Lucida Grande', Verdana, Arial, Helvetica, sans-serif;
	color:#999;
}
.acw-chap .folding-expand-inner
{
	width:14px;
	height:10px;
	margin-left:2px;
	display:inline;
	background-image:url('<?php echo $http_addr; ?>/mm/i/theme/apple/chap-folding-expand-inner.gif');
}
.acw-chap .folding-expand
{
	background-image:url('<?php echo $http_addr; ?>/mm/i/theme/apple/chap-folding-expand.gif');
}
.acw-chap .folding-start
{
	background-image:url('<?php echo $http_addr; ?>/mm/i/theme/apple/chap-folding-start.gif');
}
.acw-chap .folding-stop
{
	background-image:url('<?php echo $http_addr; ?>/mm/i/theme/apple/chap-folding-stop.gif');
}
.acw-chap .bookmark-default
{
	background-image:url('<?php echo $http_addr; ?>/mm/i/theme/apple/chap-bookmark-default.gif');
}
.acw-chap .void
{
	background-image:url('<?php echo $http_addr; ?>/mm/i/theme/void.gif');	
}