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

	Project controller library

  *------------------------------------------------------------------------------------------
*/


include_once dirname(__FILE__).'/../../client/fry/api/php/ac_backend.php';

abstract class AmyProjectController extends ACBackend
{
	protected $configuration = null;
	protected $userTicket = null;
	
	protected $projectConf = array(
		'name' => 'Amy Project',
		'protocol_version' => '1.0',
		'authentication_scheme' => 'external_login_handler', // external_login_page, facebook, openid, readonly, anyone
		'authentication_params' => ''
	);
	
	public function __construct($configuration = array())
	{
		$this->configuration = $configuration;
		if (isset($_REQUEST['ticket']))
		{
		    $this->userTicket = $_REQUEST['ticket'];
		}
	}
	
	protected function generateProjectXmlDescriptorHeader()
	{
		$xml = '<'.'?xml version="1.0" encoding="UTF-8"?'.'>';
		$xml .= '<project><configuration>';
		foreach ($this->projectConf as $key=>$value)
		{
			$xml .= "<$key><![CDATA[$value]]></$key>";
		}
		$xml .= '</configuration>';
		return $xml;
	}
	
	protected function generateProjectXmlDescriptorFooter()
	{
		$xml = '</project>';
		return $xml;
	}
	
	protected function generateRandomTicket()
	{
		$ticket = tempnam(dirname(__FILE__).'/../../cache/sessions/', 'session');
		unlink($ticket);
		return basename($ticket);
	}

	protected function getSessionPath($ticket)
	{
		return dirname(__FILE__).'/../../cache/sessions/' . sha1($ticket);
	}
	
	protected function existsSessionData($ticket)
	{
		return file_exists($this->getSessionPath($ticket));
	}
	
	protected function storeSessionData($ticket, $data)
	{
		file_put_contents($this->getSessionPath($ticket), serialize($data));
	}

	protected function retrieveSessionData($ticket)
	{
		if (!$this->existsSessionData($ticket))
		{
			return false;
		}
		return  unserialize(file_get_contents($this->getSessionPath($ticket)));
	}
	

	
	protected function getOpenedResources($ticket)
	{
		return array();
	}

	protected function createCollectionResource($ticket, $path, $label)
	{
		throw new Exception('Action not supported');
	}
	
	protected function createResource($ticket, $path, $label, $content)
	{
		throw new Exception('Action not supported');
	}
	
	protected function getResource($ticket, $path, $actAsPreview = false)
	{
		throw new Exception('Action not supported');
	}
	
	protected function setResource($ticket, $path, $content)
	{
		throw new Exception('Action not supported');
	}

    // CRUD scheme
	protected abstract function canUserCreate($ticket, $uri);
	
	protected abstract function canUserRead($ticket, $uri);

	protected abstract function canUserWrite($ticket, $uri);

	protected abstract function canUserDelete($ticket, $uri);

    // Authentication
    protected abstract function authenticateUser($username, $password);
    protected abstract function isAuthenticated($ticket);

	
	public function on_description($pars = array())
	{
		$xml = $this->generateProjectXmlDescriptorHeader();
		$xml .= $this->generateProjectXmlDescriptorFooter();
		header('Content-Type: text/xml; charset=UTF-8');
		echo $xml;
		exit();
	}
	
	public function on_authenticate($pars = array())
	{
		$username = $pars['username'];
		$password = $pars['password'];
		try
		{
			$ticket = $this->authenticateUser($username, $password);
			if (!$ticket)
			{
				throw new Exception('Empty or invalid ticket returned.');
			}
		    self::setResult($ticket);
		}
		catch (Exception $e)
		{
		    self::raiseError("Unauthenticated: " . $e->getMessage());
		}
	}
	
	public function on_open($pars = array())
	{
		$ticket = $pars['ticket'];
		if (!$this->isAuthenticated($ticket))
		{
			self::raiseError("Unauthenticated.");
		}
		$xml = '<?' . 'xml version="1.0" encoding="UTF-8" ?' . '><project><resources>';
		if ($this->canUserRead($ticket, '/'))
		{
			$resources = $this->getResource($ticket, '/');
			if (is_array($resources))
			{
				foreach ($resources as $resource)
				{
					if (is_array($resource))
					{
						$xml .= '<resource>';
						foreach ($resource as $key=>$value)
						{
							$xml .= "<$key><![CDATA[$value]]></$key>";
						}
						$xml .= '</resource>';
					}
				}
			}
			$data = $this->getOpenedResources($ticket);
			$xml .= '</resources><opened_resources>';
			if (is_array($resources))
			{
				foreach ($resources as $resource)
				{
					if (is_array($resource))
					{
						$xml .= '<resource>';
						foreach ($resource as $key=>$value)
						{
							$xml .= "<$key><![CDATA[$value]]></$key>";
						}
						$xml .= '</resource>';
					}
				}
			}
			$xml .= '</opened_resources>';
		}
		else
		{
			$xml .= '</resources>';
		}
		$xml .= '</project>';
		self::setResult($xml);
	}

	public function on_create_folder_resource($pars = array())
	{
		$ticket = $pars['ticket'];
		$path = $pars['path'];
		$label = $pars['label'];
		if (!$this->isAuthenticated($ticket))
		{
			self::raiseError("Unauthenticated.");
		}
		if ($this->canUserWrite($ticket, $path))
		{
			$resource = $this->createCollectionResource($ticket, $path, $label);
			self::setResult($resource);
		}
		self::raiseError("Insufficient privileges.");
	}
	
	public function on_create_resource($pars = array())
	{
		$ticket = $pars['ticket'];
		$path = $pars['path'];
		$label = $pars['label'];
		$content = $pars['content'];
		if (!$this->isAuthenticated($ticket))
		{
			self::raiseError("Unauthenticated.");
		}
		if ($this->canUserWrite($ticket, $path))
		{
			$resource = $this->createResource($ticket, $path, $label, $content);
			self::setResult($resource);
		}
		self::raiseError("Insufficient privileges.");
	}
	
	public function on_load_resource($pars = array())
	{
		$ticket = $pars['ticket'];
		$path = $pars['path'];
		if (!$this->isAuthenticated($ticket))
		{
			self::raiseError("Unauthenticated.");
		}
		if ($this->canUserRead($ticket, $path))
		{
			$resource = $this->getResource($ticket, $path);
			self::setResult($resource);
		}
		self::raiseError("Insufficient privileges.");
	}

	public function on_preview_resource($pars = array())
	{
		$ticket = $pars['ticket'];
		$path = $pars['path'];
		if (!$this->isAuthenticated($ticket))
		{
			self::raiseError("Unauthenticated.");
		}
		if ($this->canUserRead($ticket, $path))
		{
			$this->getResource($ticket, $path, true);
		}
		self::raiseError("Insufficient privileges.");
	}
	
	public function on_save_resource($pars = array())
	{
		$ticket = $pars['ticket'];
		$path = $pars['path'];
		if (!$this->isAuthenticated($ticket))
		{
			self::raiseError("Unauthenticated.");
		}
		if ($this->canUserWrite($ticket, $path))
		{
			if ($this->setResource($ticket, $path, $pars['content']))
			{
				self::setResult(true);
			}
			else
			{
				self::raiseError("Unable to save.");
			}
		}
		self::raiseError("Insufficient privileges.");
	}

}

// default project controller dispatcher
function dispatch_project_controller($configuration = array(), $className = false)
{
    try
    {
        if (false === $class_name = $className)
        {
            $basename = explode('.', basename($_SERVER['SCRIPT_NAME']));
            $class_name = preg_replace_callback('/_[a-z]/', create_function('$m', 'return strtoupper(substr($m[0],1));'), '_' . $basename[0]) . 'Controller';
        }
        if (!class_exists($class_name))
        {
            throw new Exception("Controller class `$class_name' not found. Make sure you name your project controller class and file appropriately or use second argument to the dispatch function.");
        }
    	$controller = new $class_name($configuration);
    	$controller->process($_REQUEST['a']);
    }
    catch (Exception $e)
    {
    	AmyProjectController::raiseError($e->getMessage());
    }    
}