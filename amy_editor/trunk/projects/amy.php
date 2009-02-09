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

	Amy Development Project controller

  *------------------------------------------------------------------------------------------
*/

    ob_start("ob_gzhandler");

    $__dn = dirname(__FILE__).'/../';
    include $__dn.'lib/amy/amy_project_controller.php';
    include $__dn.'lib/amy/amy_file_resource_manager.php';

	

	class AmyController extends AmyProjectController
	{
		protected $projectConf = array(
			'name' => 'Amy Development',
			'protocol_version' => '1.0',
			'authentication_scheme' => 'anyone',
		);

		private $resourceManager = null;

		public function __construct($configuration = array())
		{
    	    parent::__construct($configuration);
			$this->resourceManager = new AmyFileResourceManager(array(
				'basepath'=>dirname(__FILE__).'/../'  
			));
		}

		protected function getOpenenedResources($ticket)
		{
			return array();
		}

		protected function getResource($ticket, $path)
		{
			if (!$this->resourceManager->exists($path))
			{
				throw new Exception("Resource at `$path' does not exist.");
			}
			return $this->resourceManager->load($path);
		}
		
		protected function setResource($ticket, $path, $content)
		{
			if (!$this->resourceManager->exists($path))
			{
				throw new Exception("Resource at `$path' does not exist.");
			}
			return $this->resourceManager->save($path, $content);
		}

        // CRUD scheme
    	protected function canUserCreate($ticket, $uri)
    	{
    	    return true;
    	}

    	protected function canUserRead($ticket, $uri)
    	{
    	    return true;
    	}

    	protected function canUserWrite($ticket, $uri)
    	{
    	    return true;
    	}

    	protected function canUserDelete($ticket, $uri)
    	{
    	    return true;
    	}

        // Authentication
        protected function authenticateUser($username, $password)
        {
            return 'open-ticket';
        }

        protected function isAuthenticated($ticket)
        {
            return true;
        }

	}
	
    dispatch_project_controller(array());
	
?>