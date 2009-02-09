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

	FTP Editor Project controller

  *------------------------------------------------------------------------------------------
*/


	ob_start("ob_gzhandler");

	$__dn = dirname(__FILE__).'/../';
	include $__dn.'lib/amy/amy_project_controller.php';
    include $__dn.'lib/amy/support/ftp_client.php';
	

	class FtpController extends AmyProjectController
	{
		protected $projectConf = array(
			'name' => 'FTP Editor',
			'protocol_version' => '1.0',
			'authentication_scheme' => 'external_login_handler',
			'authentication_params' => '{form:{additional_fields:{ftp_url:["text","Your FTP server","ftp."]}}}'
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
				throw new Exception('Could not load FTP resources. Session error.');
			}
			$new_path = $path . '/' . $label;
			$ftp = new FTPClient($session[0], $session[1], $session[2]);
			return $ftp->make_collection($new_path);
		}

		protected function createResource($ticket, $path, $label, $content)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not load FTP resources. Session error.');
			}
			$new_path = $path . '/' . $label;
			$ftp = new FTPClient($session[0], $session[1], $session[2]);
			return $ftp->save($new_path, $content);
		}

		protected function getResource($ticket, $path)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not load FTP resources. Session error.');
			}
			$resource = array();
			$ftp = new FTPClient($session[0], $session[1], $session[2]);
			return $ftp->load($path);
		}

		protected function setResource($ticket, $path, $content)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not load FTP resources. Session error.');
			}
			$ftp = new FTPClient($session[0], $session[1], $session[2]);
			return $ftp->save($path, $content);
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
			$url = $_REQUEST['ftp_url'];
			if (!preg_match('|[a-zA-Z-_]{1,}\\.\\w{1,}|', $url))
			{
				throw new Exception("Invalid URL address `$url'.");
			}
			$ftp = new FTPClient($url, $username, $password);
			if (!$ftp->authenticate())
			{
				throw new Exception("Could not authenticate to FTP server at `$url'.");
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