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

	Project backend controller

  *------------------------------------------------------------------------------------------
*/

	function shutdown()
	{
		if (class_exists('Db'))
		{
			Db::close_connection();
		}
	}
	register_shutdown_function('shutdown');

	if ('project_preview_resource' != $_REQUEST['a'])
	{
	    ob_start("ob_gzhandler");
		$_REQUEST['a'] = $_POST['a'];
	}

    $__dn = dirname(__FILE__).'/../';

	try
	{
		include $__dn.'client/fry/api/php/ac_backend.php';
		include $__dn.'conf/amy/configuration.php';
		include $__dn.'lib/amy.php';		
	}
	catch (Exception $e)
	{
		if ('development' == $GLOBALS['_AMY_CONF']['environment'])
		{
			echo '<h1>Amy Editor Exception</h1>';
			echo $e->getMessage();
			echo '<hr/><pre>';
			print_r($e);
		}
	}

	
	define('CR', "\n");


	class AmyProjectManagerController extends ACBackend
	{
		protected $configuration = null;
		protected $connection = null;
		
		public function __construct($configuration = array())
		{
			$this->configuration = $configuration;
		}
		
		public function on_project_check($pars = array())
		{
			try
			{
			    $project = new AmyRemoteProject($pars['url']);
			    self::setResult($project);
			}
			catch (Exception $e)
			{
			    $err_msg = $e->getMessage();
			    self::raiseError("Project could not been loaded due an error: `{$err_msg}'.");
			}
		}
		
		public function on_project_authenticate($pars = array())
		{
			try
			{
			    self::setResult(AmyRemoteProject::authenticate($pars['url'], $pars['username'], $pars['password'], $_REQUEST));
			}
			catch (Exception $e)
			{
			    $err_msg = $e->getMessage();
			    self::raiseError("Project could not been authenticated due an error: `{$err_msg}'.");
			}
		}		

		public function on_project_open($pars = array())
		{
			try
			{
			    self::setResult(AmyRemoteProject::open($pars['url'], $pars['ticket']));
			}
			catch (Exception $e)
			{
			    $err_msg = $e->getMessage();
			    self::raiseError("Project could not been opened due an error: `{$err_msg}'.");
			}
		}

		public function on_project_create_folder_resource($pars = array())
		{
			try
			{
				$result = AmyRemoteProject::create_folder_resource($pars['url'], $pars['ticket'], $pars['path'], $pars['label']);
				if ($result['flush'])
				{
					echo $result['content'];
					header('Content-Type: text/xml; charset=UTF-8');
					exit();
				}
				self::setResult($result['content']);
			}
			catch (Exception $e)
			{
			    $err_msg = $e->getMessage();
			    self::raiseError("Project folder resource `{$pars['label']}' at `{$pars['path']}' could not been created due an error: `{$err_msg}'.");
			}
		}

		public function on_project_create_resource($pars = array())
		{
			try
			{
			    $result = AmyRemoteProject::create_resource($pars['url'], $pars['ticket'], $pars['path'], $pars['label'], $pars['content']);
				if ($result['flush'])
				{
					echo $result['content'];
					header('Content-Type: text/xml; charset=UTF-8');
					exit();
				}
				self::setResult($result['content']);
			}
			catch (Exception $e)
			{
			    $err_msg = $e->getMessage();
			    self::raiseError("Project resource `{$pars['label']}' at `{$pars['path']}' could not been created due an error: `{$err_msg}'.");
			}
		}

		public function on_project_load_resource($pars = array())
		{
			try
			{
			    $result = AmyRemoteProject::load_resource($pars['url'], $pars['ticket'], $pars['path']);
				if ($result['flush'])
				{
					echo $result['content'];
					header('Content-Type: text/xml; charset=UTF-8');
					exit();
				}
				self::setResult($result['content']);
			
			}
			catch (Exception $e)
			{
			    $err_msg = $e->getMessage();
			    self::raiseError("Project resource at `{$pars['path']}' could not been loaded due an error: `{$err_msg}'.");
			}
		}
		
		public function on_project_preview_resource($pars = array())
		{
			try
			{
			    $resource = AmyRemoteProject::preview_resource($pars['url'], $pars['ticket'], $pars['path']);
				header('Content-Type: ' . $resource['content_type']);
				echo $resource['content'];
				exit();
			}
			catch (Exception $e)
			{
			    $err_msg = $e->getMessage();
			    self::raiseError("Project resource preview at `{$pars['path']}' could not been loaded due an error: `{$err_msg}'.");
			}
		}		
		
		public function on_project_save_resource($pars = array())
		{
			try
			{
				self::setResult(AmyRemoteProject::save_resource($pars['url'], $pars['ticket'], $pars['path'], $pars['content']));
			}
			catch (Exception $e)
			{
			    $err_msg = $e->getMessage();
			    self::raiseError("Project resource at `{$pars['path']}' could not been saved due an error: `{$err_msg}'.");				
			}
		}
	}

	// _______ end callback function
	function end_amy_request()
	{
		Db::close_connection();
	}
	// _______ launcher
	try
	{
		$action = new AmyProjectManagerController($_AMY_CONF);
		$action->process($_REQUEST['a'], new AmyLogger, 'end_amy_request');
	}
	catch (Exception $e)
	{
		AmyProjectManagerController::raiseError($e->getMessage());
	}
