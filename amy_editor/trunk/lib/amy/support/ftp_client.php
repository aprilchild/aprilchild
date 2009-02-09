<?php
/*
  *------------------------------------------------------------------------------------------
	Simple FTP client Library

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	
*/

include_once dirname(__FILE__).'/simple_http.php';

class FTPClient
{
	private $host = '';
	private $port = '';
	private $path = '';
	
	private $username = '';
	private $password = '';

	public function __construct($url, $username, $password)
	{
		if ('ftp://' != substr($url, 0, 6))
		{
			$url = 'ftp://' . $url;
		}
		$url = parse_url($url);
		$this->host = $url['host'];
		$this->port = is_numeric($url['port']) ? $url['port'] : 21;
		$this->path = $url['path'];
		$this->username = $username;
		$this->password = $password;
	}
	
	private function get_connection_handle()
	{
		if (false !== $conn = @ftp_connect($this->host, $this->port, 4))
		{
			return false !== @ftp_login($conn, $this->username, $this->password) ? $conn : false;
		}
		return false;
	}
	
	public function authenticate()
	{
		$conn = $this->get_connection_handle();
		$result = false !== $conn;
		if ($result)
		{
			@ftp_close($conn);
		}
		return $result;
	}
	
	private function get_encoded_path($path)
	{
		$parts = explode('/', $path);
		for ($i=0; $i<sizeof($parts); $i++)
		{
			$parts[$i] = urlencode($parts[$i]);
		}
		$enc_path = implode('/', $parts);
		return str_replace('//', '/', $this->path . $enc_path);		
	}
	
	public function make_collection($path)
	{
		$path = $this->get_encoded_path($path);
		if (false === $conn = $this->get_connection_handle())
		{
			throw new Exception("Could not connect to FTP server.");
		}
		if ('/' == $path{0})
		{
			$path = substr($path, 1);
		}
		if ('/' == substr($path, -1))
		{
			$path = substr($path, 0, -1);
		}
		$path_parts = explode('/', $path);
		for ($i=0; $i<sizeof($path_parts)-1; $i++)
		{
			if (false === @ftp_chdir($conn, $path_parts[$i]))
			{
				$this->throw_exception("Could not change to directory `{$path_parts[$i]}'.");
			}
		}
		$label = $path_parts[sizeof($path_parts)-1];
		if (false === @ftp_mkdir($conn, $label))
		{
			$this->throw_exception("Could not make directory `$label'.");
		}
		@ftp_close($conn);
		return true;
	}	
	
	public function load($path)
	{
		$path = $this->get_encoded_path($path);
		if (false === $conn = $this->get_connection_handle())
		{
			throw new Exception("Could not connect to FTP server.");
		}
		if (false === $list = @ftp_rawlist($conn, $path))
		{
			$this->throw_exception($conn, "Invalid list retrieved from FTP server.");
		}
		foreach ($list as $row)
		{
			preg_match_all('/([^ ]*) *(\d*) *([^ ]*) *([^ ]*) *(\d*) *(.*(\d{4}|(\d{2}:\d{2}))) (.*)/', $row, $m);
			if (0 != sizeof($m[0]))
			{
				$basename = $m[9][0];
				if ('.' == $basename || '..' == $basename)
				{
					continue;
				}
				$resource = array('basename' => $basename, 'date_modified' => strtotime($m[6][0]), 'size' => $m[5][0]);
				$is_collection = '-' != $m[0][0]{0};
				$resource['is_collection'] = $is_collection ? '1' : '0';
				$resources[] = $resource;
			}
		}
		if (1 == sizeof($resources) && 0 == $resources[0]['is_collection'])
		{
			$tmp_f = @tempnam(dirname(__FILE__).'/../../cache/files', "ftp");
			if (false === $f = @fopen($tmp_f, 'w'))
			{
				$this->throw_exception($conn, "Could not retrieve file content. Cache file permission error.");
			}
			if (false !== @ftp_fget($conn, $f, $resources[0]['basename'], FTP_BINARY))
			{
				@fclose($f);
				$resources = @file_get_contents($tmp_f);
			}
			@unlink($tmp_f);
		}
		@ftp_close($conn);
		return $resources;
	}
	
	public function save($path, $content)
	{
		$path = $this->get_encoded_path($path);
		if (false === $conn = $this->get_connection_handle())
		{
			throw new Exception("Could not connect to FTP server.");
		}
		$tmp_f = @tempnam(dirname(__FILE__).'/../../cache/files', "ftp");
		if (false === $f = @fopen($tmp_f, 'w'))
		{
			$this->throw_exception($conn, "Could not store file content. Cache file permission error.");
		}
		fwrite($f, $content);
		fclose($f);
		$result = @ftp_put($conn, $path, $tmp_f, FTP_BINARY);
		@ftp_close($conn);
		unlink($tmp_f);
		return $result;
	}
	
	private function throw_exception($conn_handle, $error)
	{
		@ftp_close($conn_handle);
		throw new Exception($error);
	}
}