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

	WebDAV Editor Project controller

  *------------------------------------------------------------------------------------------
*/


	ob_start("ob_gzhandler");

	$__dn = dirname(__FILE__).'/../';
	include $__dn.'lib/amy/amy_project_controller.php';
    include $__dn.'lib/amy/support/dav_client.php';
	

	class DavController extends AmyProjectController
	{
		protected $projectConf = array(
			'name' => 'WebDAV Editor',
			'protocol_version' => '1.0',
			'authentication_scheme' => 'external_login_handler',
			'authentication_params' => '{form:{additional_fields:{dav_url:["text","Your WebDAV URL","http://"]}}}'
		);

		private $resourceManager = null;

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
			$dav = new WebDAVClient($session[0], $session[1], $session[2]);
			return $dav->make_collection($new_path);
		}

		protected function createResource($ticket, $path, $label, $content)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not load DAV resources. Session error.');
			}
			$new_path = $path . '/' . $label;
			$dav = new WebDAVClient($session[0], $session[1], $session[2]);
			if (!$dav->save($new_path, $content))
			{
				throw new Exception("Could not create resource `$label' at `$path'.");
			}
			return $dav->info($new_path);
		}

		protected function getResource($ticket, $path, $actAsPreview = false)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not load DAV resources. Session error.');
			}
			$dav = new WebDAVClient($session[0], $session[1], $session[2]);
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
			$dav = new WebDAVClient($session[0], $session[1], $session[2]);
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
			$url = $_REQUEST['dav_url'];
			if ('http://' != substr($url, 0, 7))
			{
				$url = 'http://' . $url;
			}
			if (!preg_match('|http://[a-zA-Z-_]{1,}\\.\\w{1,}|', $url))
			{
				throw new Exception("Invalid URL address `$url'.");
			}
			$dav = new WebDAVClient($url, $username, $password);
			if (!$dav->authenticate())
			{
				throw new Exception("Could not authenticate to DAV server at `$url'.");
			}
			$ticket = $this->generateRandomTicket();
			$this->storeSessionData($ticket, array($url, $username, $password));
            return $ticket;
        }

        protected function isAuthenticated($ticket)
        {
            return $this->existsSessionData($ticket);
        }

	}
	
    dispatch_project_controller(array());
	
?>