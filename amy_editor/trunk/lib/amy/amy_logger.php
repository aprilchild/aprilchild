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

	Simple logging library

  *------------------------------------------------------------------------------------------
*/


class AmyLogger
{
	
	public function log($msg)
	{
		if ('development' != $GLOBALS['_AMY_CONF']['environment'])
		{
			return;
		}
		if (false !== $f = @fopen(dirname(__FILE__) . '/../../_log/f_development.log', 'a'))
		{
			fwrite($f, "--------------\n" . date('r', time()) . "\n" . $msg . "\n\n");
			fclose($f);
		}
	}		
	
	public static function logn($msg, $paramsToLog = array())
	{
		if ('development' != $GLOBALS['_AMY_CONF']['environment'])
		{
			return;
		}
		if (is_array($paramsToLog))
		{
			foreach ($paramsToLog as $k=>$v)
			{
				$msg .= "\n\t :$k => $v";
			}
		}
		else
		{
			$msg .= "\n\t" . $paramsToLog;
		}
		if (false !== $f = @fopen(dirname(__FILE__) . '/../../_log/n_development.log', 'a'))
		{
			fwrite($f, "--------------\n" . date('r', time()) . "\n" . $msg . "\n\n");
			fclose($f);				
		}
	}
}