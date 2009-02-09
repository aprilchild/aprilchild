<?php
/*
  *------------------------------------------------------------------------------------------
	YAML Library

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	
*/
class YAML
{
	public static function load($path)
	{
		$src = file_get_contents($path);
		$lines = explode("\n", $src);
		$num_lines = sizeof($lines);
		$data = array();
		$indent_level = -1;
		$nested_key = array();
		for ( $i=0; $i<$num_lines; $i++ )
		{
			$line = rtrim($lines[$i]);
			if ( '' == trim($line) )
			{
				continue;
			}
			$line = str_replace("\t", '  ', $line);
			$ix = strpos($line, ':');
			if ( false === $ix )
			{
				$ix = strpos($line, '-');
				if ( false === $ix )
				{
					throw new Exception('YAML compilation error on line '.($i+1)." in `$path'");
				}
			}
			else
			{
				/* cases like hello:
								- 'this:is'
				*/
				$ix_h = strpos($line, '-');
				if ( false != $ix_h && $ix_h < $ix )
				{
					$ix = $ix_h;
				}
			}
			$yaml_key = trim(substr($line,0,$ix));
			$yaml_value = trim(substr($line, $ix+1));
			if ( '-' == $yaml_value )
			{
				$yaml_value = array();
			}
			else if ( '|' == $yaml_value )
			{
				// multi-content
				$content = array();
				$i++;
				while ( $i<$num_lines )
				{
					$line = $lines[$i];
					if ( false !== $ix = strpos($line, ':') && ltrim($line) == $line )
					{
						$i--;
						break;;
					}
					$content[] = $line;
					$i++;
				}
				$yaml_value = implode("\n", $content);
			}
			else
			{
				if ( '' != $yaml_value )
				{
					if ( 0 != strncmp("'", $yaml_value, 1) && 0 != strncmp('"', $yaml_value, 1) )
					{
						throw new Exception('YAML compilation error on line '.($i+1).'. Missing opening \' character for the `'.$yaml_key.'` key.'." in `$path'");
					}
					if ( "'" != substr($yaml_value,-1) && '"' != substr($yaml_value,-1) )
					{
						throw new Exception('YAML compilation error on line '.($i+1).'. Missing closing \' character for the `'.$yaml_key.'` key.'." in `$path'");
					}
//						$yaml_value = str_replace("\\'", "'", $yaml_value);
				}
				$yaml_value = substr($yaml_value,1,-1);
			}
			$actual_indent_level = floor((strlen($line)-strlen(trim($line)))/2);
			if ( $actual_indent_level > $indent_level )
			{
				$nested_key[] = $yaml_key;
			}
			else if ( $actual_indent_level < $indent_level )
			{
				$nested_key = array_slice($nested_key, 0, $actual_indent_level-$indent_level);
				$nested_key[sizeof($nested_key)-1] = $yaml_key;
			}
			else
			{
				$nested_key[sizeof($nested_key)-1] = $yaml_key;
			}
			$indent_level = $actual_indent_level;
			$data_key = implode('/', $nested_key);
			if ( isset($data[$data_key]) )
			{
				if ( !is_array($data[$data_key]['list']) )
				{
					$data[$data_key] = array('list'=>array($data[$data_key][1]));
				}
				$data[$data_key]['list'][] = $yaml_value;
			}
			else
			{
				$data[$data_key] = array($yaml_key, $yaml_value, $line);					
			}
		}
//			echo $src;
//			print_r($data);
		$yaml_data = array();
		$yaml_keys = array();
		foreach ( $data as $key=>$value )
		{
			$yaml_eval_key = str_replace("['']", '', '[\''.str_replace('/', '\'][\'', $key).'\']');
			if ( isset($value['list']) )
			{
				$value[1] = $value['list'];
			}
			else if ( '/' == substr($key,-1) )
			{
				// single item in array
				eval('$yaml_data'.$yaml_eval_key.'[]=$value[1];');
				continue;
			}
			eval('$yaml_data'.$yaml_eval_key.'=$value[1];');
		}
		return $yaml_data;
	}
}
