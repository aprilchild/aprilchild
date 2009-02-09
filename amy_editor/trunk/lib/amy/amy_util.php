<?php
/*
  *------------------------------------------------------------------------------------------
	Amy - collaborative web text editor for developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Utilities

  *------------------------------------------------------------------------------------------
	
*/

function amy_mime_content_type($path)
{
	if (false !== strpos($_SERVER['HTTP_HOST'], 'mac'))
	{
		$content_type = explode(';', str_replace('regular file', 'text/plain', str_replace('application/x-empty', 'text/plain', trim(exec('file -bi ' . escapeshellarg($path))))));
		return trim($content_type[0]);
	}
	else
	{
		return mime_content_type($path);
	}
}
