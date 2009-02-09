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

	Resource manager interface

  *------------------------------------------------------------------------------------------
*/

include_once dirname(__FILE__) .  '/amy_base.php';

abstract class AMYResourceManager extends AmyObject
{
	protected $configuration = array();

	public function __construct($configuration = array())
	{
		$this->configuration = $configuration;			
	}
	
	public abstract function exists($path);
	public abstract function isCollection($path);
	public abstract function create($path, $label, $content, $params = array());
	public abstract function createCollection($path, $label, $params = array());
	public abstract function load($path);
	public abstract function save($path, $content, $params = array());
	public abstract function copy($path, $destinationPath);
	public abstract function move($path, $destinationPath);
	public abstract function delete($path);
	public abstract function contentType($path);

}

abstract class AMYResource
{
	public function __construct($path)
	{
	}
}