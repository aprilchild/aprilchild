<?php
/*
  *------------------------------------------------------------------------------------------
	MySQL Library

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	
*/

class MySQL
{
	public static $connection = null;

	public static function get_connection()
	{
		// phpinfo();die();
		global $_AMY_CONF;
		if (!self::$connection)
		{
			$conf = array('host' => 'localhost', 'port' => 3306, 'dbname' => 'amy_editor', 'user' => '', 'password' => '');
			$conn_string_parts = explode(' ', $_AMY_CONF['servers'][$_SERVER['HTTP_HOST']]);
			foreach ($conn_string_parts as $part)
			{
				$parts = explode('=', $part);
				if (isset($conf[$parts[0]]))
				{
					$conf[$parts[0]] = trim($parts[1]);
				}
			}
			if ('development' == $GLOBALS['_AMY_CONF']['environment'])
			{
				self::$connection = mysqli_connect($conf['host'], $conf['user'], $conf['password'], $conf['dbname'], $conf['port']);
			}
			else
			{
				self::$connection = @mysqli_connect($conf['host'], $conf['user'], $conf['password'], $conf['dbname'], $conf['port']);
			}
		}
		return self::$connection;
	}
	
	public static function close_connection()
	{
		@mysqli_close(self::$connection);
	}
	
	public static function find($sql_query)
	{
		if (self::get_connection())
		{
			$sql_query = str_replace(' amy.', ' amy_', $sql_query);
			AmyLogger::logn('SQL query: ', $sql_query);
			if ('development' == $GLOBALS['_AMY_CONF']['environment'])
			{
				return mysqli_query(self::$connection, $sql_query);
			}
			else
			{
				return @mysqli_query(self::$connection, $sql_query);
			}
		}
		return false;
	}
	
	public static function find_scalar($sql_query)
	{
		if (false !== $res = self::find($sql_query))
		{
			if (false !== $row = mysqli_fetch_row($res))
			{
				return $row[0];
			}
			mysqli_free_result($res);
		}
		return false;
	}
	
	public static function find_first($sql_query)
	{
		if (false !== $res = self::find($sql_query))
		{
			$result = mysqli_fetch_assoc($res);
			mysqli_free_result($res);
			return $result;
		}
		return false;		
	}
	
	public static function last_error()
	{
		if (self::$connection)
		{
			return @mysqli_error();
		}
		return "Database server unreachable.";
	}
	
	public static function quote_literal($str)
	{
		return mysql_escape_string($str);
	}
	
	public static function parse_array_string($arr_str)
	{
		// Take off the first and last characters (the braces)
		$arr = substr($arr_str, 1, strlen($arr_str) - 2);

		// Pick out array entries by carefully parsing.  This is necessary in order
		// to cope with double quotes and commas, etc.
		$elements = array();
		$i = $j = 0;
		$in_quotes = false;
		$n_arr = strlen($arr);
		while ($i < $n_arr)
		{
			// If current char is a double quote and it's not escaped, then
			// enter quoted bit
			$char = $arr{$i}; //substr($arr, $i, 1);
			if ($char == '"' && ($i == 0 || $arr{$i-1} != '\\')) 
			{
				$in_quotes = !$in_quotes;
			}
			elseif ($char == ',' && !$in_quotes) 
			{
				// Add text so far to the array
				$elements[] = substr($arr, $j, $i - $j);
				$j = $i + 1;
			}
			$i++;
		}
		// Add final text to the array
		$elements[] = substr($arr, $j);

		// Do one further loop over the elements array to remote double quoting
		// and escaping of double quotes and backslashes
		$n_elements = sizeof($elements);
		for ($i = 0; $i < $n_elements; $i++) 
		{
			$v = $elements[$i];
			if (strpos($v, '"') === 0) 
			{
				$v = substr($v, 1, strlen($v) - 2);
				if ( false !== strpos($v, "\\") )
				{
					$v = str_replace('\\"', '"', $v);
				}
				if ( false !== strpos($v, '\\\\') )
				{
					$v = str_replace('\\\\', '\\', $v);
				}
				$elements[$i] = $v;
			}
		}	
		return $elements;
	}	    
}