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

	Project library

  *------------------------------------------------------------------------------------------
*/

function fix_parse_url($url) 
{
	$url = parse_url($url);
	$url['path'] = $url['path'] . (!empty($url['query']) ? ('?' . $url['query']) : '');
	return $url;
}


class AmyRemoteProject
{
	public $url = '';

	public $name = 'Untitled';
	public $protocol_version = 1.0;
	public $authentication_scheme = false;
	public $authentication_params = '';

	public function __construct($url)
	{
	    $this->url = $url;
	    $this->load();
	}
        
	private function fix_parse_url($url) 
	{
		$url = parse_url($url);
		$url['path'] = $url['path'] . (!empty($url['query']) ? ('?' . $url['query']) : '');
		return $url;
	}

	private function load()
	{
		$url = fix_parse_url($this->url);
        $response = SimpleHTTP::send('POST', $url['host'], $url['port'], $url['path'], array('a' => 'description'));
        if ('200' != $response['status_code'])
        {
            throw new Exception("Invalid status code `{$response['status_code']}' returned from server `{$url['host']}'.");
        }
		$descriptor_xml = trim($response['body']);
		if ('' === $descriptor_xml)
		{
		    throw new Exception("Unable to load project descriptor from `{$url['host']}{$url['path']}'.");
		}
		$project = new SimpleXMLElement($descriptor_xml);
		$this->name = (string)$project->configuration->name;
		$this->protocol_version = (float)$project->configuration->protocol_version;
		$this->authentication_scheme = (string)$project->configuration->authentication_scheme;
		if (1.0 != $this->protocol_version)
		{
		    // currently the only one supported
		    throw new Exception("Unsupported project protocol version `{$this->protocol_version}'.");
		}
		// checking authorization scheme type
		$is_authenticated = false;
		$auth_params = '';
		switch ($this->authentication_scheme)
		{
		    case 'readonly': case 'anyone':
		    {
		        $is_authenticated = true;
		    };break;
		    case 'external_login_page':
		    {
		        $auth_params = (string)$project->configuration->authentication_params;
		    };break;
		    case 'external_login_handler':
		    {
		        $auth_params = (string)$project->configuration->authentication_params;
		    };break;
		    case 'facebook':
		    {

		    };break;
		    case 'openid':
		    {

		    };break;
		    default:
		    {
		        throw new Exception("Unsupported authentication scheme `{$this->authentication_scheme}'.");
		    }
		}
		$this->authentication_params = $auth_params;
	}

	public static function authenticate($project_url, $username, $password, $requestParams = array())
	{
		$url = fix_parse_url($project_url);
        $response = SimpleHTTP::send('POST', $url['host'], $url['port'], $url['path'], array_merge($requestParams, array('a' => 'authenticate', 'username' => $username, 'password' => $password)));
        if ('200' != $response['status_code'])
        {
            throw new Exception("Invalid status code `{$response['status_code']}' returned from server `{$url['host']}'.");
        }
		$response = trim($response['body']);
		if ('' === $response)
		{
		    throw new Exception("Unable to authenticate project, no content returned from `{$url['host']}{$url['path']}'.");
		}
		if ('#S#' == substr($response, 0, 3))
		{
			// returning ticket
			return substr($response, 3);
		}
		throw new Exception(substr($response, 3));
	}
	
	public static function open($project_url, $ticket)
	{
		$url = fix_parse_url($project_url);
		$response = SimpleHTTP::send('POST', $url['host'], $url['port'], $url['path'], array('a' => 'open', 'ticket' => $ticket));
		if ('200' != $response['status_code'])
		{
		    throw new Exception("Invalid status code `{$response['status_code']}' returned from server `{$url['host']}'.");
		}
		$response = trim($response['body']);
		if ('' === $response)
		{
		    throw new Exception("Unable to open project, no content returned from `{$url['host']}{$url['path']}'.");
		}
		if ('#S#' == substr($response, 0, 3))
		{	
			$document = DOMDocument::loadXML(substr($response, 3));
			$data = array('resources' => array(), 'opened-resource' => array());
			$lst = $document->documentElement->getElementsByTagName('resources');
			if (0 == $lst->length)
			{
				throw new Exception("Invalid protocol response received from `{$url['host']}{$url['path']}': No resources collection element.");
			}
			$node_resources = $lst->item(0);
			$num_nodes = $node_resources->childNodes->length;
			for ($i=0; $i<$num_nodes; $i++)
			{
				$node = $node_resources->childNodes->item($i);
				if (1 == $node->nodeType && 'resource' == $node->tagName)
				{
					try
					{
						$resource = simplexml_import_dom($node);
						$ser_resource = array();
						foreach (get_object_vars($resource) as $name=>$property)
						{
							$ser_resource[$name] = (string)$property;
						}
						$data['resources'][] = $ser_resource;							
					}
					catch (Exception $e)
					{
						throw new Exception($e->getMessage());
					}
				}
			}
			return $data;
		}
		throw new Exception(substr($response, 3));
	}

	public static function create_folder_resource($project_url, $ticket, $path, $label)
	{
		$url = fix_parse_url($project_url);
		$url = parse_url($project_url);
		$label = trim(str_replace('/', '', $label));
        $response = SimpleHTTP::send('POST', $url['host'], $url['port'], $url['path'], array('a' => 'create_folder_resource', 'ticket' => $ticket, 'path' => $path, 'label' => $label));
        if ('200' != $response['status_code'])
        {
            throw new Exception("Invalid status code `{$response['status_code']}' returned from server `{$url['host']}'.");
        }
		$content = trim($response['body']);
		if ('' === $content)
		{
		    throw new Exception("Unable to create project folder resource, no content returned from `{$url['host']}{$url['path']}'.");
		}
		if (false !== strpos($response['headers']['content-type'], 'text/xml'))
		{
			return array('flush' => true, 'content' => $content);
		}
		if ('#S#' != substr($content, 0, 3))
		{
			throw new Exception("Error while creating project folder resource: Message from {$url['host']}{$url['path']}: " . substr($content, 3));
		}
		return array('flush' => false, 'content' => substr($content, 3));
	}

	public static function create_resource($project_url, $ticket, $path, $label, $content)
	{
		$url = fix_parse_url($project_url);
		$label = trim(str_replace('/', '', $label));
        $response = SimpleHTTP::send('POST', $url['host'], $url['port'], $url['path'], array('a' => 'create_resource', 'ticket' => $ticket, 'path' => $path, 'label' => $label, 'content' => $content));
        if ('200' != $response['status_code'])
        {
            throw new Exception("Invalid status code `{$response['status_code']}' returned from server `{$url['host']}'.");
        }
		$content = trim($response['body']);
		if ('' === $content)
		{
		    throw new Exception("Unable to create project resource, no content returned from `{$url['host']}{$url['path']}'.");
		}
		if (false !== strpos($response['headers']['content-type'], 'text/xml'))
		{
			return array('flush' => true, 'content' => $content);
		}
		if ('#S#' != substr($content, 0, 3))
		{
			throw new Exception("Error while creating project resource: Message from {$url['host']}{$url['path']}: " . substr($content, 3));
		}
		return array('flush' => false, 'content' => substr($content, 3));
	}

	public static function load_resource($project_url, $ticket, $path)
	{
		$url = fix_parse_url($project_url);
        $response = SimpleHTTP::send('POST', $url['host'], $url['port'], $url['path'], array('a' => 'load_resource', 'ticket' => $ticket, 'path' => $path));
        if ('200' != $response['status_code'])
        {
            throw new Exception("Invalid status code `{$response['status_code']}' returned from server `{$url['host']}'.");
        }
		$content = trim($response['body']);
		// AmyLogger::logn($content);
		if ('' === $content)
		{
		    throw new Exception("Unable to load project resource, no content returned from `{$url['host']}{$url['path']}'.");
		}
		if (false !== strpos($response['headers']['content-type'], 'text/xml'))
		{
			return array('flush' => true, 'content' => $content);
		}
		if ('#S#' != substr($content, 0, 3))
		{
			throw new Exception("Error while loading project resource: Message from {$url['host']}{$url['path']}: " . substr($content, 3));
		}
		return array('flush' => false, 'content' => substr($content, 3));
	}
	
	public static function preview_resource($project_url, $ticket, $path)
	{
		$url = fix_parse_url($project_url);
        $response = SimpleHTTP::send('POST', $url['host'], $url['port'], $url['path'], array('a' => 'preview_resource', 'ticket' => $ticket, 'path' => $path));
        if ('200' != $response['status_code'])
        {
            throw new Exception("Invalid status code `{$response['status_code']}' returned from server `{$url['host']}'.");
        }
		return array('content_type' => $response['headers']['content-type'], 'content' => $response['body']);
	}	
		
	public static function save_resource($project_url, $ticket, $path, $content)
	{
		$url = fix_parse_url($project_url);
        $response = SimpleHTTP::send('POST', $url['host'], $url['port'], $url['path'], array('a' => 'save_resource', 'ticket' => $ticket, 'path' => $path, 'content' => $content));
        if ('200' != $response['status_code'])
        {
            throw new Exception("Invalid status code `{$response['status_code']}' returned from server `{$url['host']}'.");
        }
		$content = trim($response['body']);
		if ('' === $content)
		{
		    throw new Exception("Unable to save project resource, no content returned from `{$url['host']}{$url['path']}'.");
		}
		if ('#S#' != substr($content, 0, 3))
		{
			throw new Exception("Error while saving resource: Message from {$url['host']}{$url['path']}: " . substr($content, 3));
		}
		return true;
	}		
}





?>