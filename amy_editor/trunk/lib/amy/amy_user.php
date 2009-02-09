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

	User and session management library

  *------------------------------------------------------------------------------------------
*/

class AmyUser extends AmyObject
{
	public $userId = 0;
	public $username = 0;
	public $service = 'amy';
	public $credentials = array();
	private $session = null;
	
	private function load_user_info($row = array())
	{
		$this->userId = $row['id'];
		$this->username = $row['username'];
		$this->service = $row['service'];
		foreach (array('email', 'nickname', 'picture', 'bio') as $key)
		{
			$this->credentials[$key] = $row[$key];
		}
	}
	
	private function setup_support_dir()
	{
		$support_path = isset($this->configuration['original-support-path']) ? $this->configuration['original-support-path'] : $this->configuration['support-path'];
		$src_path = $support_path . '/amy_default';
		if (!is_dir($src_path))
		{
			throw new Exception("Invalid default support directory: `$src_path'.");
		}
		$target_path = $support_path . '/' . $this->service . '_' . $this->username;
		if (is_dir($target_path))
		{
			throw new Exception("Target support directory already exists: `$target_path'.");
		}
		$this->copy_dir($src_path, $target_path);
	}
	
	private function copy_dir($src_path, $target_path)
	{
		mkdir($target_path, 0777);
		if (false !== $d = @opendir($src_path))
		{
			while (false !== $f = @readdir($d))
			{
				if ('.' == $f{0})
				{
					continue;
				}
				$new_src_path = $src_path . '/' . $f;
				$new_target_path = $target_path . '/' . $f;
				if (is_dir($new_src_path))
				{
					$this->copy_dir($new_src_path, $new_target_path);
				}
				else
				{
					copy($new_src_path, $new_target_path);
					chmod($new_target_path, 0777);
				}
			}
			closedir($d);
		}
	}
	
	private function save_user_to_session($session)
	{
		$session->authInfo['user_info'] = array_merge($this->credentials, array('id' => $this->userId, 'username' => $this->username, 'service' => $this->service));
		$session->save();
	}
	
	public function load_from_session($session)
	{
		$this->session = $session;
		if (is_array($session->authInfo['user_info']))
		{
			$this->load_user_info($session->authInfo['user_info']);
		}
		else
		{
			$this->load($session->authInfo['user_id']);
			$this->save_user_to_session($session);
		}
	}
	
	public function load($userId = 0)
	{
		if (!is_numeric($userId))
		{
			throw new Exception("Invalid user ID specified: `$userId'");
		}
		if (false === $row = Db::find_first("SELECT * FROM amy.users WHERE id=$userId LIMIT 1"))
		{
			throw new Exception("Unable to lookup user: `$userId'.");
		}
		$this->load_user_info($row);
		return $this;
	}
	
	public function save()
	{
		$sql = 'UPDATE amy.users SET ';
		foreach ($this->credentials as $key=>$value)
		{
			$sql .= $key . "='" . Db::quote_literal($value) . "', ";
		}
		$sql = substr($sql, 0, -2) . ' WHERE id=' . $this->userId;
		if (false === Db::find($sql))
		{
			throw new Exception("Unable to save user credentials: " . Db::last_error());
		}
		if (is_object($this->session))
		{
			$this->save_user_to_session($this->session);
		}
		return $this;
	}
	
	public function authorize($username, $password = null, $service = 'amy')
	{
		$username = Db::quote_literal($username);
		$service = Db::quote_literal($service);
		// bypassing the password - already logged in using external sevice API (Facebook and such)
		if (false === $row = Db::find_first("SELECT * FROM amy.users WHERE username='$username' AND service='$service' LIMIT 1"))
		{
			throw new Exception("Unable to lookup username: `$username' for service `$service'.");
		}
		if (null != $password)
		{
			if (md5($password) != $row['hashed_password'])
			{
				throw new Exception("Invalid password provided.");
			}
		}
		$this->load_user_info($row);
		Db::find("UPDATE amy.users SET last_logged_at=CURRENT_TIMESTAMP WHERE id=" . $this->userId);
		return $this;
	}
	
	public function register($username, $password = null, $service = 'amy', $credentials = array())
	{
		$username = Db::quote_literal($username);
		if ('' == trim($username))
		{
			throw new Exception('Username cannot be empty.');
		}
		$service = Db::quote_literal($service);
		$hashed_password = null == $password ? '' : md5($password);
		$q_data = array();
		if (is_array($credentials))
		{
			foreach (array('email', 'nickname', 'picture', 'bio') as $key)
			{
				$q_data[$key] = isset($credentials[$key]) ? Db::quote_literal($credentials[$key]) : '';
			}
		}		
		if (false === $row = Db::find_first("SELECT * FROM amy.user_create('$username', '$hashed_password', '$service', '" . $q_data['email'] . "', '" . $q_data['nickname'] . "', '" . $q_data['picture'] . "', '" . $q_data['bio'] . "')"))
		{
			throw new Exception("User registration failed: `" . Db::last_error(). "'.");
		}
		$this->load_user_info($row);
		try
		{
			$this->setup_support_dir();
		}
		catch (Exception $e)
		{
			Db::find("SELECT amy.user_delete(" . $this->userId . ")");
			throw new Exception($e->getMessage());
		}
		return $this;
	}
	
	public function make_default()
	{
		$this->authorize('default');
	}

	public function is_authorized()
	{
		return 0 != $this->userId;
	}
	
	public function is_default()
	{
		return 'default' == $this->username;
	}
	
	public function create_session()
	{
		if (!$this->is_authorized())
		{
			throw new Exception('User is not authorized. Could not create session.');
		}
		$session = new AmySession($this->configuration);
		$session->create($this->userId);
		$this->save_user_to_session($session);
		$this->session = $session;
		return $session;
	}
}

class AmySession extends AmyObject
{
	public $authInfo = array('token' => '', 'user_id' => 1);
	protected $session_storage_path = '';
	const EXPIRES_AFTER_SECONDS = 10800; // 3 hours
	const RENEW_BEFORE_EXPIRATION = 3600; // 1 hour before actual expiration
	
	public function __construct($configuration = array())
	{
		parent::__construct($configuration);
		$this->session_storage_path = dirname(__FILE__) . '/../../cache/sessions/amy/';
	}
	
	public function authorize()
	{
		AmyLogger::logn('Authorizing session, cookie token value:', $_COOKIE['amy_token']);
		if (!isset($_COOKIE['amy_token']) || '32' != strlen($_COOKIE['amy_token']))
		{
			AmyLogger::logn('Invalid or non-existent session token.');
			throw new Exception('Invalid or non-existent session token.');
		}
		$session_path = $this->session_storage_path . $_COOKIE['amy_token'];
		if (!@file_exists($session_path))
		{
			AmyLogger::logn("Unable to authorize session: `session file not found at $session_path'.");
			throw new Exception("Unable to authorize session: `session file not found'.");
		}
		$this->authInfo = @unserialize(@file_get_contents($session_path));
		if (!is_array($this->authInfo))
		{
			AmyLogger::logn("Unable to authorize session: `session file corrupted or could not been read at $session_path'.");
			throw new Exception("Unable to authorize session: `session file unreadable or corupted'.");
		}
		AmyLogger::logn("Session authorized.", $this->authInfo);
		return $this;
	}
	
	public function create($userId = 1)
	{
		AmyLogger::logn('Creating session for:', $userId);
		if (!is_numeric($userId))
		{
			AmyLogger::logn("Invalid user ID specified: `$userId'");
			throw new Exception("Invalid user ID specified: `$userId'");
		}
		try
		{
			$this->authorize();
			if ($userId == $this->authInfo['user_id'])
			{
				AmyLogger::logn("Already authorized, renewing.", $this->authInfo);
				if (time() + self::RENEW_BEFORE_EXPIRATION < $this->authInfo['expired_at'])
				{
					AmyLogger::logn("Not necessary to renew yet.");
					// not renewing until one hour before expiration to avoid overhead
					return $this;
				}
				// let's renew it
				$this->authInfo['expired_at'] = time() + self::EXPIRES_AFTER_SECONDS;
				$this->save();
				AmyLogger::logn("Renewed successfully");
				return $this;
			}
		}
		catch (Exception $e)
		{
		}
		$this->authInfo['user_id'] = $userId;
		$this->authInfo['expired_at'] = time() + self::EXPIRES_AFTER_SECONDS;
		$this->authInfo['token'] = $this->generate_hash();
		$this->save();
		AmyLogger::logn('Setting cookie for newly created session: ', $this->authInfo);
		setcookie('amy_token', $this->authInfo['token'], 0, '/');
		return $this;
	}
	
	private function generate_hash()
	{
		$offset = rand(0, 10);
		return time() . substr(md5(rand(1, 4434783) . time()), $offset, 22);
	}

	public function save()
	{
		$session_path = $this->session_storage_path . $this->authInfo['token'];
		@file_put_contents($session_path, @serialize($this->authInfo));
	}
}