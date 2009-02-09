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

	Filesystem resources implementation library

  *------------------------------------------------------------------------------------------
*/


include_once dirname(__FILE__) . '/amy_util.php';
include_once dirname(__FILE__) . '/amy_resource_manager.php';

class AmyFileResourceManager extends AMYResourceManager
{
	
	public function exists($path)
	{
		return file_exists($this->configuration['basepath'].$path);
	}

	public function isCollection($path)
	{
		return is_dir($this->configuration['basepath'].$path);
	}
	
	public function create($path, $label, $content, $params = array())
	{
		$full_path = $this->configuration['basepath'] . $path . '/' . $label;
		if (false !== @file_put_contents($full_path, $content))
		{
			@chmod($full_path, 0644);
			$r = array
			(
				'basename' => $label,
				'is_collection' => '0',
				'size' => @filesize($full_path),
				'date_created' => @filectime($full_path),
				'content_type' => amy_mime_content_type($full_path),
				'version' => 1
			);
			$r['date_modified'] = $r['date_created'];
			return $r;
		}
		return false;
	}		

	public function createCollection($path, $label, $params = array())
	{
		$full_path = $this->configuration['basepath'] . $path . '/' . $label;
		if (!is_dir($full_path) && !file_exists($full_path) && false !== @mkdir($full_path))
		{
			@chmod($full_path, 0755);
			$r = array
			(
				'basename' => $label,
				'is_collection' => '1',
				'size' => 0,
				'date_created' => time(),
				'date_modified' => 0,
				'version' => 1
			);
			return $r;
		}
		return false;
	}		
	
	public function load($path)
	{
		$r = array();
		$path = $this->configuration['basepath'].$path;
		if ( is_dir($path) )
		{
			if (false !== $d = @opendir($path))
			{
				while ( false !== $f = @readdir($d) )
				{
					if ( 0 == strncmp($f, '.', 1) )
					{
						continue;
					}
					$full_path = $path.'/'.$f;
					$r2 = array();
					$r2['basename'] = $f;
					$is_collection = is_dir($full_path);
					$r2['is_collection'] = $is_collection ? '1' : '0';
					$r2['size'] = $is_collection ? 0 : @filesize($full_path);
					$r2['date_created'] = $is_collection ? 0 : @filectime($full_path);
					$r2['date_modified'] = $r2['date_created'];
					$r2['content_type'] = amy_mime_content_type($full_path);
					$r2['version'] = 1;
					$r[] = $r2;
				}
				@closedir($d);
			}
		}
		else
		{
			$r = @file_get_contents($path);
		}
		return $r;
	}
	
	public function save($path, $content, $params = array())
	{
		$full_path = $this->configuration['basepath'] . $path . '/' . $label;
		if (false !== @file_put_contents($full_path, $content))
		{
			@chmod($full_path, 0644);
			return true;
		}
		return false;
	}
	
	public function copy($path, $destinationPath)
	{
	}
	
	public function move($path, $destinationPath)
	{
	}
	
	public function delete($path)
	{
	}

	public function contentType($path)
	{
		return amy_mime_content_type($this->configuration['basepath'] . $path);
	}
	
}

class FileResource extends AMYResource
{
	
}