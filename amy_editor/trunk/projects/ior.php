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

	*.isonrails.com Project controller

  *------------------------------------------------------------------------------------------
*/


	ob_start("ob_gzhandler");

	$__dn = dirname(__FILE__).'/../';
	include $__dn.'lib/amy/amy_project_controller.php';
    include $__dn.'lib/amy/support/dav_client.php';
	

	class IORController extends AmyProjectController
	{
		protected $projectConf = array(
			'name' => 'IsOnRails.com Playground',
			'protocol_version' => '1.0',
			'authentication_scheme' => 'external_login_handler',
			'authentication_params' => '',
			// 'IOR_dav_controller' => 'http://playground.isonrails.imac/dav/'
			// 'IOR_dav_controller' => 'http://playground.isonrails.mac/dav/'
			'IOR_dav_controller' => 'http://playground.isonrails.com/dav/'
		);

		public function __construct($configuration = array())
		{
    	    parent::__construct($configuration);
		}

		protected function getOpenenedResources($ticket)
		{
			return array();
		}

		protected function createCollectionResource($ticket, $path, $label)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not load DAV resources. Session error.');
			}
			$new_path = $path . '/' . $label . '/';
			$dav = new WebDAVClient($this->projectConf['IOR_dav_controller'], $session[0], $session[1]);
			return $dav->make_collection($new_path);
		}

		protected function createResource($ticket, $path, $label, $content)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not load DAV resources. Session error.');
			}
			$new_path = $path . '/' . $label;
			$dav = new WebDAVClient($this->projectConf['IOR_dav_controller'], $session[0], $session[1]);
			return $dav->save($new_path, $content);
		}

		protected function getResource($ticket, $path, $actAsPreview = false)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not load DAV resources. Session error.');
			}
			$dav = new WebDAVClient($this->projectConf['IOR_dav_controller'], $session[0], $session[1]);
			$contents = $dav->load($path);
			if ($actAsPreview)
			{
				header('Content-Type: ' . $dav->contentType($path));
				echo $contents;
				exit();
			}
			return $contents;
		}

		protected function setResource($ticket, $path, $content)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not save DAV resource. Session error.');
			}
			$dav = new WebDAVClient($this->projectConf['IOR_dav_controller'], $session[0], $session[1]);
			return $dav->save($path, $content);
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
			$url = $this->projectConf['IOR_dav_controller'];
			$dav = new WebDAVClient($url, $username, $password);
			if (!$dav->authenticate())
			{
				throw new Exception("Could not authenticate to DAV server at `$url'.");
			}
			$ticket = $this->generateRandomTicket();
			$this->storeSessionData($ticket, array($username, $password));
            return $ticket;
        }

        protected function isAuthenticated($ticket)
        {
            return $this->existsSessionData($ticket);
        }

	}
	
    dispatch_project_controller(array());
	
?>