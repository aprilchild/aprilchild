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

	Amy Playground Project controller

  *------------------------------------------------------------------------------------------
*/

    ob_start("ob_gzhandler");

    $__dn = dirname(__FILE__).'/../';
    include $__dn.'lib/amy/amy_project_controller.php';
    include $__dn.'lib/amy/amy_file_resource_manager.php';


	class PlaygroundController extends AmyProjectController
	{
		protected $projectConf = array(
			'name' => 'Amy Playground',
			'protocol_version' => '1.0',
			'authentication_scheme' => 'anyone',
		);

		private $resourceManager = null;

		public function __construct($configuration = array())
		{
    	    parent::__construct($configuration);
			$this->resourceManager = new AmyFileResourceManager(array(
				'basepath'=>dirname(__FILE__).'/../_test_data/'
			));
		}

		protected function getOpenenedResources($ticket)
		{
			return array();
		}

		protected function createCollectionResource($ticket, $path, $label)
		{
			if (false === $result = $this->resourceManager->createCollection($path, $label))
			{
				throw new Exception("Collection resource could not been created.");
			}
			return $result;
		}

		protected function createResource($ticket, $path, $label, $content)
		{
			if (false === $result = $this->resourceManager->create($path, $label, $content))
			{
				throw new Exception("Resource could not been created.");
			}
			return $result;
		}

		protected function getResource($ticket, $path, $actAsPreview = false)
		{
			if (!$this->resourceManager->exists($path))
			{
				throw new Exception("Resource at `$path' does not exist.");
			}
			$contents = $this->resourceManager->load($path);
			if ($actAsPreview && !is_array($contents))
			{
				header('Content-Type: ' . $this->resourceManager->contentType($path));
				echo $contents;
				exit();
			}
			return $contents;
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