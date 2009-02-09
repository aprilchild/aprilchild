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

	Base library

  *------------------------------------------------------------------------------------------
*/


class AmyObject
{
	protected $configuration = array();
	
	public function __construct($configuration = array())
	{
		$this->configuration = $configuration;
	}
}


$__database_adapter = 'mysql' == $GLOBALS['_AMY_CONF']['db-adapter'] ? 'mysql' : 'pg';
if ('mysql' == $__database_adapter)
{
	include_once dirname(__FILE__).'/support/mysql.php';
	class Db extends MySQL{}
}
else
{
	include_once dirname(__FILE__).'/support/pg.php';
	class Db extends Pg{}
}