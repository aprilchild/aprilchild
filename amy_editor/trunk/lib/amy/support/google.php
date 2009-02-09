<?php
/*
  *------------------------------------------------------------------------------------------
	Google Library

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	
*/

class Google
{
	public static function search($query)
	{
		$results = array();
		if (false !== $content = @file_get_contents("http://www.google.com/search?q=$query&rls=en&ie=UTF-8&oe=UTF-8"))
		{
			if ( false !== $ix = strpos($content, '<div id=res') )
			{
				$contents = explode('<h2', substr($content, $ix));
				//print_r($contents);die();
				$num_contents = sizeof($contents);
				for ( $i=0; $i<$num_contents; $i++ )
				{
					preg_match_all('| class=r><a href="([^"]*)" class=l>(.*)</a></h2>.*class=std>(.*)<br><span class=a>(.*)- ([^ ]*) -|', $contents[$i], $m);
                    // print_r($m);
					if ( is_array($m[0]) && '' != trim($m[1][0]) )
					{
						$results[] = array('title'=>trim(strip_tags($m[2][0])), 'url'=>trim(strip_tags($m[1][0])), 'note'=>trim(strip_tags($m[3][0])), 'size'=>$m[5][0]);
					}						
				}
			}
		}
        // die();
		return $results;
	}	    
	
	
}