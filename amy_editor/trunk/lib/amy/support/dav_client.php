<?php
/*
  *------------------------------------------------------------------------------------------
	Simple WebDAV client Library

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	
*/

include_once dirname(__FILE__).'/simple_http.php';

class WebDAVClient
{
	private $host = '';
	private $port = '';
	private $path = '';
	
	private $username = '';
	private $password = '';

	public function __construct($url, $username, $password)
	{
		$url = parse_url($url);
		$this->host = $url['host'];
		$this->port = is_numeric($url['port']) ? $url['port'] : 80;
		$this->path = $url['path'];
		$this->username = $username;
		$this->password = $password;
	}
	
	public function authenticate()
	{
		$headers = array('Authorization' => 'Basic ' . base64_encode($this->username . ':' . $this->password));
//	    $response = SimpleHTTP::send('GET', $this->host, $this->port, $this->path, array(), $headers);
	    $response = SimpleHTTP::send('OPTIONS', $this->host, $this->port, $this->path, array(), $headers);
		return 200 == $response['status_code'];
	}
	
	private function get_encoded_path($path)
	{
		$parts = explode('/', $path);
		for ($i=0; $i<sizeof($parts); $i++)
		{
			$parts[$i] = urlencode($parts[$i]);
		}
		$enc_path = implode('/', $parts);
		return str_replace('//', '/', $this->path . $enc_path);
	}
	
	private function list_propfind_resources($document)
	{
		$list = $document->documentElement->childNodes;
		$num_nodes = $list->length;
		$resources = array();
		for ($i=0; $i<$num_nodes; $i++)
		{
			$node = $list->item($i);
			if (1 == $node->nodeType && 'response' == substr($node->tagName, -8))
			{
				$response = simplexml_import_dom($node);
				$href = urldecode((string)$response->href);
				$properties = array();
				foreach ($response->propstat as $propstat)
				{
					if (false !== strpos((string)$propstat->status, '200'))
					{
						foreach (get_object_vars($propstat->prop) as $name => $value)
						{
							if (false !== strpos($name, ':'))
							{
								$name = strtolower(array_pop(explode(':', $name)));
							}
							$properties[$name] = is_object($value) ? 'collection' : (string)$value;
						}
					}
				}
				$parts = explode('/', $href);
				$basename = array_pop($parts);
				if ('' == $basename)
				{
					$basename = array_pop($parts);
				}
				$content_type = $properties['getcontenttype'];
				if ('application/octet-stream' == $content_type)
				{
					$content_type = 'text/plain';
				}
				$is_collection = 'collection' == $properties['resourcetype'];
				$is_collection = 'httpd/unix-directory' == $content_type;
				$date_modified = @strtotime($properties['getlastmodified']);
				$resources[] = array('basename'=>$basename, 'is_collection'=>$is_collection?'1':'0', 'size'=>$is_collection?'0':$properties['getcontentlength'], 'href'=>$href, 'date_created'=>$date_modified, 'date_modified'=>$date_modified, 'content_type'=>$content_type, 'version'=>1);
			}
		}
		return $resources;
	}
	
	private function get_resources_document($path, $depth)
	{
		$path = $this->get_encoded_path($path);
		$headers = array('Depth' => $depth, 'Authorization' => 'Basic ' . base64_encode($this->username . ':' . $this->password));
	    $response = SimpleHTTP::send('PROPFIND', $this->host, $this->port, $path, array(), $headers);
		if (207 != $response['status_code'])
		{
			throw new Exception("Invalid status code returned: `{$response['status_code']}'");
		}
		$simplified_source = str_replace('D:', '', str_replace('DAV:', '', $response['body']));
		// file_put_contents(dirname(__FILE__).'/../../cache/dav-response.log', $simplified_source);
		$document = @DOMDocument::loadXML($simplified_source);
		if (!$document->documentElement)
		{
			throw new Exception("Invalid content returned from server at `$path'.");
		}
		return $document;
	}

	private function is_collection($path)
	{
		$resources = $this->list_propfind_resources($this->get_resources_document($path, 0));
		// file_put_contents(dirname(__FILE__).'/../../cache/dav-1.log', var_export($resources, true));
		return 1 == sizeof($resources) && $resources[0]['is_collection'];
	}
	
	public function make_collection($path)
	{
		$enc_path = $this->get_encoded_path($path);
	    $response = SimpleHTTP::send('MKCOL', $this->host, $this->port, $enc_path, '', array('Authorization' => 'Basic ' . base64_encode($this->username . ':' . $this->password), 'Content-Type' => 'httpd/unix-directory'));
		if (201 != $response['status_code'])
		{
			throw new Exception("Could not make collection. Invalid status code `{$response['status_code']}' returned for `$enc_path'.");
		}
		return true;
	}	
	
	public function contentType($path)
	{
		$resource = $this->info($path);
		return $resource['content_type'];
	}

	public function info($path)
	{
		$resources = $this->list_propfind_resources($this->get_resources_document($path, 0));
		if (is_array($resources) && is_array($resources[0]))
		{
			return $resources[0];
		}
		throw new Exception("Resource `$path' not found.");
	}

	public function load($path)
	{
		if ($this->is_collection($path))
		{
			$resources = $this->list_propfind_resources($this->get_resources_document($path, 1));
			return $resources;
		}
		else
		{
			$enc_path = $this->get_encoded_path($path);
		    $response = SimpleHTTP::send('GET', $this->host, $this->port, $enc_path, array(), array('Authorization' => 'Basic ' . base64_encode($this->username . ':' . $this->password)));
			if (200 != $response['status_code'])
			{
				throw new Exception("Could not load resource. Invalid status code returned for `$enc_path'.");
			}
			return $response['body'];
		}
	}
	
	public function save($path, $content)
	{
		$path = $this->get_encoded_path($path);
		$headers = array('Depth' => $depth, 'Authorization' => 'Basic ' . base64_encode($this->username . ':' . $this->password));
	    $response = SimpleHTTP::send('PUT', $this->host, $this->port, $path, $content, $headers);
		return '2' == substr($response['status_code'].'', 0, 1);
	}
}