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

	Remote editor commands backend controller

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


    ob_start("ob_gzhandler");

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

	class AmyRexecController extends ACBackend
	{
		protected $resourceManager = null;
		protected $configuration = null;
		protected $connection = null;
		protected $userId = -1;
		
		public function __construct($configuration = array())
		{
			$this->configuration = $configuration;
			$this->configuration['original-support-path'] = $this->configuration['support-path'];
			try
			{
				$session = new AmySession($configuration);
				$session->authorize();
				$this->user = new AmyUser($configuration);
				$this->user->load_from_session($session);
			}
			catch (Exception $e)
			{
				// echo $e->getMessage();
			}
			try
			{
				if (null === $this->user)
				{
					$this->user = new AmyUser($configuration);
					$this->user->make_default();
					$this->user->create_session();
				}
				$this->configuration['support-path'] .= '/' . $this->user->service . '_' . $this->user->username . '/';
			}
			catch (Exception $e)
			{
				$this->configuration['support-path'] .= '/amy_default/';
			}
		}
		
		private function stripFileName($name)
		{
			return str_replace('..', '', str_replace('/', '', $name));
		}		
		

		public function on_google_search($pars)
		{
			self::setResult(Google::search($pars['query']));
		}
		
		public function on_run($pars)
		{
			$bundle_id = $this->stripFileName($pars['bundle']);
			$scriptname = $this->stripFileName($pars['script']);
			$script_path = $this->configuration['support-path'].'/bundles/'.$bundle_id.'/scripts/'.$scriptname.'.php';
			@include_once($script_path);
			if ( function_exists('run_script') )
			{
				run_script($this, $pars);
				self::raiseError('Script returned no result.');
			}
			else
			{
				self::raiseError('Script not found.');
			}
		}
		
		public function on_command($pars)
		{
			$bundle_id = $this->stripFileName($pars['bundle']);
			$command = str_replace('..', '', $pars['command']);
			$command_path = $this->configuration['support-path'].'/bundles/'.$bundle_id.'/commands/'.$command.'.amCommandDef';
			include_once($command_path);
			if ( function_exists('run_command') )
			{
				run_command($this, $pars['text'], $pars);
				self::raiseError('Command returned no result.');
			}
			else
			{
				self::raiseError('Command not found.');
			}
		    
		}
		
		public function import($bundleId = '', $libraryName = '')
		{
			$bundleId = $this->stripFileName($bundleId);
			$libraryName = $this->stripFileName($libraryName);
			$path = $this->configuration['support-path'].'/bundles/'.$bundleId.'/libs/'.$libraryName.'.php';
			@include_once($path);
		}
		
		public function ok($result)
		{
		    self::setResult($result);
		}

		public function fail($error)
		{
		    self::raiseError($error);
		}

		
		
		// helpers
		
		
	}
	
	
	
	// _______ end callback function
	function end_amy_request()
	{
		Db::close_connection();
	}
	
	// _______ launcher
	try
	{
		$action = new AmyRexecController($_AMY_CONF);
		$action->process($_REQUEST['a'], new AmyLogger, 'end_amy_request');
	}
	catch ( Exception $e )
	{
		AmyRexecController::raiseError( $e->getMessage() );
	}
