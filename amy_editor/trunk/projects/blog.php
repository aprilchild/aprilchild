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

	Blog Editor Project controller

  *------------------------------------------------------------------------------------------
*/


	ob_start("ob_gzhandler");

	$__dn = dirname(__FILE__).'/../';
	include $__dn.'lib/amy/amy_project_controller.php';
    include $__dn.'lib/movabletype/class.mtclient.php';
	

	class BlogController extends AmyProjectController
	{
		protected $projectConf = array(
			'name' => 'Blog Editor',
			'protocol_version' => '1.0',
			'authentication_scheme' => 'external_login_handler',
			'authentication_params' => '{form:{additional_fields:{blog_url:["text","Your blog URL","http://"]}}}'
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

		protected function getResource($ticket, $path)
		{
			if (false === $session = $this->retrieveSessionData($ticket))
			{
				throw new Exception('Could not load blogposts. Session error.');
			}
			$resource = array();
			$blog = new mtclient($session[0], $session[1], $session[2], $session[3]);
			if ('/' == $path)
			{
				$posts = $blog->getRecentPosts(1, 20);
				if (!is_array($posts))
				{
					throw new Exception('Could not load blogposts from server.');
				}
				foreach ($posts as $post)
				{
					$basename = $post['title'] . '.html';
					$resources[] = array('basename' => $basename, 'is_collection' => false);
					$map['/'.$basename] = $post['postid'];
				}
				$session[5] = $map;
				$this->storeSessionData($ticket, $session);
			}
			else
			{
				$map = $session[5];
				if (isset($map[$path]))
				{
					$postid = $map[$path];
					$post = $blog->getPost($postid);
					if (!is_array($post))
					{
						throw new Exception("Could not load blogpost `$postid' from server.");
					}
					$resources = $post['description'];
				}
			}
			return $resources;
		}

        // CRUD scheme
    	protected function canUserCreate($ticket, $uri)
    	{
    	    return false;
    	}

    	protected function canUserRead($ticket, $uri)
    	{
    	    return true;
    	}

    	protected function canUserWrite($ticket, $uri)
    	{
    	    return false;
    	}

    	protected function canUserDelete($ticket, $uri)
    	{
    	    return false;
    	}

        // Authentication
        protected function authenticateUser($username, $password)
        {
			$url = $_REQUEST['blog_url'];
			if ('http://' != substr($url, 0, 7))
			{
				$url = 'http://' . $url;
			}
			if (!preg_match('|http://[a-zA-Z-_]{1,}\\.\\w{1,}|', $url))
			{
				throw new Exception("Invalid URL address `$url'.");
			}
			$blog_url = parse_url($url);
			$path = $blog_url['path'] . '/xmlrpc.php';
			$blog = new mtclient($username, $password, $blog_url['host'], $path);
			$blogs = $blog->getUsersBlogs();
			if (!is_array($blogs))
			{
				$path = $blog_url['path'] . '/xmlrpc.cgi';
				$blog = new mtclient($username, $password, $blog_url['host'], $path);
				$blogs = $blog->getUsersBlogs();
				if (!is_array($blogs))
				{
					$path = $blog_url['path'];
					$blog = new mtclient($username, $password, $blog_url['host'], $path);
					$blogs = $blog->getUsersBlogs();
				}
			}
			if (!is_array($blogs))
			{
				throw new Exception("Could not connect to blog URL `$url'.");
			}
			$ticket = $this->generateRandomTicket();
			$this->storeSessionData($ticket, array($username, $password, $blog_url['host'], $path, $blogs));
            return $ticket;
        }

        protected function isAuthenticated($ticket)
        {
            return $this->existsSessionData($ticket);
        }

	}
	
    dispatch_project_controller(array());
	
?>