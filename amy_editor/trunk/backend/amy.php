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

	Main backend controller

  *------------------------------------------------------------------------------------------
*/

	function shutdown()
	{
		if (class_exists('Db'))
		{
			Db::close_connection();
		}
	}
	register_shutdown_function('shutdown');


	if ('download_resource' != $_REQUEST['a'])
	{
		ob_start("ob_gzhandler");
	}

	$__dn = dirname(__FILE__).'/../';
	try
	{
		include $__dn.'client/fry/api/php/ac_backend.php';
		include $__dn.'conf/amy/configuration.php';
		include $__dn.'lib/amy.php';
	}
	catch (Exception $e)
	{
		if ('development' == $GLOBALS['_AMY_CONF']['environment'])
		{
			echo '<h1>Amy Editor Exception</h1>';
			echo $e->getMessage();
			echo '<hr/><pre>';
			print_r($e);
		}
	}



	class AmyController extends ACBackend
	{
		protected $resourceManager = null;
		protected $configuration = null;
		protected $connection = null;
		protected $user = null;
		
		public function __construct($configuration = array())
		{
			$this->configuration = $configuration;
			$this->configuration['original-support-path'] = $this->configuration['support-path'];
			try
			{
				$session = new AmySession($configuration);
				$session->authorize();
				$this->user = new AmyUser($configuration);
				$this->user->load_from_session($session);
			}
			catch (Exception $e)
			{
				// echo $e->getMessage();
			}
			try
			{
				if (null === $this->user)
				{
					$this->user = new AmyUser($configuration);
					$this->user->make_default();
					$this->user->create_session();
				}
				$this->configuration['support-path'] .= '/' . $this->user->service . '_' . $this->user->username . '/';
			}
			catch (Exception $e)
			{
				$this->configuration['support-path'] .= '/amy_default/';
			}
		}
		
		
		private function fail_not_authenticated()
		{
			if ($this->user->is_default())
			{
				self::raiseError('Not authenticated.');
			}
		}
		# _______ user management
		
		public function on_user_sign_in($pars)
		{
			try
			{
				$user = new AmyUser($this->configuration);
				$user->authorize($pars['username'], $pars['password'], 'amy');
				$user->create_session();
				self::setResult($user);
			}
			catch (Exception $e)
			{
				self::raiseError('Unable to login: ' . $e->getMessage());
			}			
		}

		public function on_user_sign_out($pars)
		{
			$user = new AmyUser($this->configuration);
			$user->make_default();
			$user->create_session();
			self::setResult(true);
		}
		
		public function on_user_register($pars)
		{
			$user = new AmyUser($this->configuration);
			try
			{
				$user->register($pars['username'], $pars['password'], 'amy', $pars);
				$user->create_session();
			}
			catch (Exception $e)
			{
				self::raiseError('Unable to register: ' . $e->getMessage());
			}
			self::setResult($user);
		}
		
		public function on_user_change_picture($pars)
		{
			$this->fail_not_authenticated();
			$this->user->credentials['picture'] = $pars['url'];
			$this->user->save();
			self::setResult($this->user);
		}
		
		public function on_user_find_relations($pars)
		{
			$this->fail_not_authenticated();
			if (false === $res = Db::find('SELECT * FROM amy.user_find_relations(' . $this->user->userId . ')'))
			{
				self::raiseError('Cannot acquire user relations.');
			}
			$data = array();
			while (false !== $row = pg_fetch_assoc($res))
			{
				$data[] = $row;
			}
			self::setResult($data);
		}
		
		public function on_user_update_relation($pars)
		{
			$this->fail_not_authenticated();
			$original_email = Db::quote_literal(trim($pars['original_email']));
			$email = Db::quote_literal(trim($pars['email']));
			$nickname = Db::quote_literal(trim($pars['nickname']));
			if (false === $row = Db::find_first('SELECT * FROM amy.user_update_relation(' . $this->user->userId . ", '$original_email', '$nickname', '$email')"))
			{
				self::raiseError('Error updating relation: ' . Db::last_error());
			}
			self::setResult($row);
		}

		public function on_user_remove_relation($pars)
		{
			$this->fail_not_authenticated();
			$user_id = $pars['user_id'];
			if (is_numeric($user_id) && 0 < $user_id)
			{
				$res = Db::find('SELECT amy.user_delete_relation(' . $this->user->userId . ", $user_id)");
			}
			else
			{
				$email = Db::quote_literal(trim($pars['email']));
				$res = Db::find('SELECT amy.user_delete_relation(' . $this->user->userId . ", '$email')");
			}
			if (false === $res)
			{
				self::raiseError('Error removing relation: ' . Db::last_error());
			}
			self::setResult(true);
		}
		
		# _______ resources management
		
		#public

		public function on_download_resource($pars)
		{
			header('Content-type: text/plain');
			header('Content-Disposition: attachment; filename="'.$pars['filename'].'"');
			header('Content-length: ' . strlen($pars['content']));
			echo $pars['content'];
			exit();
		}
		
		# _______ preferences & bundles support

		#private
		private function stripFileName($name)
		{
			return str_replace('..', '', str_replace('/', '', $name));
		}

		private function getFilenameByName($name)
		{
			$filename = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
			if ( '' == $filename )
			{
				$filename = 'snippet';
			}
			return $filename;			
		}

        #public        
		public function on_load_settings($pars)
		{
			$path = $this->configuration['support-path'].'/settings/'.$this->stripFileName($pars['name']).'.amSettings';
			$yaml = YAML::load($path);
			self::setResult($yaml);
		}
        
		public function on_list_themes($pars)
		{
			$theme_dir_path = $this->configuration['support-path'].'/themes/';
			if ( !is_dir($theme_dir_path) )
			{
				throw new Exception('There is no themes directory available.');
			}
			$themes = array();
			if ( false !== $d = opendir($theme_dir_path) )
			{
				while ( false !== $f = readdir($d) )
				{
					if ( 0 == strncmp('.', $f, 1) || '.amTheme' != substr($f, -8) )
					{
						continue;
					}
					$yaml = YAML::load($theme_dir_path.$f);
					$yaml['id'] = substr($f, 0, -8);
					$themes[] = $yaml;
				}
				closedir($d);
			}
			self::setResult($themes);
		}

		public function on_list_bundles($pars)
		{
			$bundle_dir_path = $this->configuration['support-path'].'/bundles/';
			if ( !is_dir($bundle_dir_path) )
			{
				throw new Exception('There is no bundles directory available.');
			}
			$bundles = array();
			if ( false !== $d = opendir($bundle_dir_path) )
			{
				while ( false !== $f = readdir($d) )
				{
					if ( 0 == strncmp('.', $f, 1) || !is_dir($bundle_dir_path.$f) )
					{
						continue;
					}
					$yaml = YAML::load($bundle_dir_path.$f.'/info.amBundle');
					$yaml['id'] = $f;
					// getting list of bundle templates
					$templates_path = $bundle_dir_path.$f.'/templates/';
					$templates = array();
					if (is_dir($templates_path))
					{
						if (false !== $d_templates = opendir($templates_path))
						{
							while (false !== $ff = readdir($d_templates))
							{
								if(0 == strncmp('.', $ff, 1))
								{
									continue;
								}
								$content = explode("\n", @file_get_contents($templates_path.$ff));
								$templates[] = $content[0];
							}
							closedir($d_templates);
						}
					}
					$yaml['templates'] = $templates;
					$bundles[] = $yaml;
				}
				closedir($d);
			}
			self::setResult($bundles);
		}

		public function on_load_bundle($pars)
		{
			$pars['id'] = $this->stripFileName($pars['id']);
			$host_os = isset($pars['host_os']) ? $pars['host_os'] : (false!==strpos($_SERVER['HTTP_USER_AGENT'], 'intosh')?'Mac':'Windows');
			if ( !in_array($host_os, array('Mac', 'Windows')) )
			{
				$host_os = 'Windows';
			}
			$cached_file = $this->configuration['support-path'] . '/cached/bundle_' . $pars['id'] . '_' . $host_os . '.ser';
			$bundle_last_modified = filectime($this->configuration['support-path'] . '/bundles/' . $pars['id'] . '/info.amBundle');
			$bundle_dump = null;
			if (file_exists($cached_file))
			{
				$bundle_cache = @unserialize(@file_get_contents($cached_file));
				if (is_array($bundle_cache['bundle']) && $bundle_cache['time'] == $bundle_last_modified)
				{
					$bundle_dump = $bundle_cache['bundle'];
				}
			}
			if (null == $bundle_dump)
			{
				$bundle = new AMYBundle($this->configuration['support-path'], $pars['id'], $host_os);
				$bundle_dump = $bundle->dumpDefinition();
				file_put_contents($cached_file, @serialize(array('time' => $bundle_last_modified, 'bundle' => $bundle_dump)));
			}
			self::setResult($bundle_dump);
		}

		public function on_load_language_definition_source($pars)
		{
			$parts = explode('_', $this->stripFileName($pars['language_id']));
			$lang_path = $this->configuration['support-path'].'/bundles/'.$parts[0].'/languages/'.$parts[1].'.amLanguage';
			if ( file_exists($lang_path) )
			{
				self::setResult(@file_get_contents($lang_path));
			}
			self::raiseError('Language definition not found `'.$pars['language_id'].'`');
		}

		public function on_save_bundle_snippets($pars)
		{
			$bundle_id = $this->stripFileName($pars['id']);
			$data = $pars['data'];
			if ( is_array($data) )
			{
				$files = array();
				$snippets_dir = $this->configuration['support-path'].'/bundles/'.$bundle_id.'/snippets/';
				foreach ($data as $snippet_xml)
				{
					$snippet = new SimpleXMLElement($snippet_xml);
					$filename = trim((string)$snippet->filename);
					$snippet_path = $snippets_dir.$filename.'.amSnippet';
					if ( '' == $filename || !file_exists($snippet_path) )
					{
						$filename = $this->getFilenameByName((string)$snippet->name);
					}
					$snippet_path = $snippets_dir.$filename.'.amSnippet';
					$yaml_contents  = "  name: '".str_replace("'", "\\'", (string)$snippet->name)."'\n";
					$yaml_contents .= "  key_activation: '".str_replace("'", "\\'", (string)$snippet->key_activation)."'\n";
					$yaml_contents .= "  tab_activation: '".str_replace("'", "\\'", (string)$snippet->tab_activation)."'\n";

					$files[$snippet_path] = array($yaml_contents, (string)$snippet->index, $filename);
					$files[$snippet_path.'Def'] = (string)$snippet->code;
				}
				// cleaning snippets directory
				if ( false !== $d = opendir($snippets_dir) )
				{
					while ( false !== $f = readdir($d) )
					{
						if ( '.' != $f && '..' != $f )
						{
							unlink($snippets_dir.$f);
						}
					}
					closedir($d);
				}
				$result = array();
				// saving new files
				foreach ($files as $path=>$content)
				{
					if ( is_array($content) )
					{
						$index = $content[1];
						$filename = $content[2];
						$content = $content[0];
						$result[] = array('index'=>$index, 'filename'=>$filename);
					}
					file_put_contents($path, $content);
					chmod($path, 0666);
				}
				//print_r($files);die();
				self::setResult($result);
			}
			self::raiseError('Invalid data posted.');
		}

		public function on_delete_bundle_snippet($pars)
		{
			$bundle_id = $this->stripFileName($pars['id']);
			$filename = $this->stripFileName($pars['filename']);
			$snippets_dir = $this->configuration['support-path'].'/bundles/'.$bundle_id.'/snippets/';
			$snippet_path = $snippets_dir.$filename.'.amSnippet';
			if ( file_exists($snippet_path) )
			{
				unlink($snippet_path);
				unlink($snippet_path.'Def');
				self::setResult(true);
			}
			self::raiseError('Snippet not found.');
		}

		public function on_save_bundle_commands($pars)
		{
			$bundle_id = $this->stripFileName($pars['id']);
			$data = $pars['data'];
			if ( is_array($data) )
			{
				$commands_dir = $this->configuration['support-path'].'/bundles/'.$bundle_id.'/commands/';
				$files = array();
				foreach ($data as $command_xml)
				{
					$command = new SimpleXMLElement($command_xml);
					$filename = trim((string)$command->filename);
					$command_path = $commands_dir.$filename.'.amCommand';
					if ( '' == $filename || !file_exists($command_path) )
					{
						$filename = $this->getFilenameByName((string)$command->name);
					}
					$command_path = $commands_dir.$filename.'.amCommand';
					$yaml_contents  = "  name: '".str_replace("'", "\\'", (string)$command->name)."'\n";
					$yaml_contents .= "  key_activation: '".str_replace("'", "\\'", (string)$command->key_activation)."'\n";
					$yaml_contents .= "  tab_activation: '".str_replace("'", "\\'", (string)$command->tab_activation)."'\n";
					$yaml_contents .= "  input_type: '".str_replace("'", "\\'", (string)$command->input_type)."'\n";
					$yaml_contents .= "  input_type_or: '".str_replace("'", "\\'", (string)$command->input_type_or)."'\n";
					$yaml_contents .= "  output_type: '".str_replace("'", "\\'", (string)$command->output_type)."'\n";
					$yaml_contents .= "  script_env: '".str_replace("'", "\\'", (string)$command->script_env)."'\n";

					$files[$command_path] = array($yaml_contents, (string)$command->index, $filename);
					$files[$command_path.'Def'] = (string)$command->code;
				}
				// cleaning commands directory
				if ( false !== $d = opendir($commands_dir) )
				{
					while ( false !== $f = readdir($d) )
					{
						if ( '.' != $f && '..' != $f )
						{
							unlink($commands_dir.$f);
						}
					}
					closedir($d);
				}
				$result = array();
				// saving new files
				foreach ($files as $path=>$content)
				{
					if ( is_array($content) )
					{
						$index = $content[1];
						$filename = $content[2];
						$content = $content[0];
						$result[] = array('index'=>$index, 'filename'=>$filename);
					}
					file_put_contents($path, $content);
					chmod($path, 0666);
				}
				//print_r($files);die();
				self::setResult($result);
			}
			self::raiseError('Invalid data posted.');
		}

		public function on_delete_bundle_command($pars)
		{
			$bundle_id = $this->stripFileName($pars['id']);
			$filename = $this->stripFileName($pars['filename']);
			$commands_dir = $this->configuration['support-path'].'/bundles/'.$bundle_id.'/commands/';
			$command_path = $commands_dir.$filename.'.amCommand';
			if ( file_exists($command_path) )
			{
				unlink($command_path);
				unlink($command_path.'Def');
				self::setResult(true);
			}
			self::raiseError('Command not found.');
		}			

		
        # _______ collaboration 
		
		#public
		
		public function on_collaboration_invite($pars)
		{
			try
			{
				if ('' == $pars['url'] && isset($pars['content']))
				{
					// resource not in the project tree
					$content = $pars['content'];
				}
				else
				{
					$content = AmyRemoteProject::load_resource($pars['url'], $pars['ticket'], $pars['path']);
				}
				if (false === $row = Db::find_first("SELECT * FROM amy.coll_create(" . $this->user->userId. ", '" . Db::quote_literal($pars['url']) . "', '" . Db::quote_literal($pars['path']) . "', '" . Db::quote_literal($content) . "', '" . Db::quote_literal($pars['email']) . "', '" . Db::quote_literal($pars['permission']) . "', '" . Db::quote_literal($pars['message']) . "', '3:00:00')") )
				{
					self::raiseError('Unable to invite: ' . Db::last_error());
				}
				$mail = new Mail($this->user->credentials['email'], $pars['email']);
				$body = <<<BODY
Hello, {$this->user->credentials['nickname']} has invited you to collaborate on the document `{$pars['path']}' via the Amy Editor.

----------------------------
{$pars['message']}
----------------------------

You can either visit the link http://www.april-child.com/amy/amy.php?invitation_code={$row['invitation_hash']} or (if you have already Amy Editor open) go to the File > Collaboration > Accept ... menu and enter the code: {$row['invitation_hash']}

Cheers,
Amy Editor.
BODY;
				$mail->send('Amy Editor - Invitation to collaboration on ' . $pars['path'], $body);
				self::setResult($row);
			}
			catch (Exception $e)
			{
				self::raiseError($e->getMessage());
			}
		}

		public function on_collaboration_accept($pars)
		{
			if ( false === $row = Db::find_first("SELECT * FROM amy.coll_accept(" . $this->user->userId. ", '" . Db::quote_literal($pars['hash']) . "')") )
			{
				self::raiseError('Unable to accept: ' . Db::last_error());
			}
			self::setResult($row);
		}
		
		public function on_collaboration_stop($pars)
		{
			if ( false === $row = Db::find_first("SELECT * FROM amy.coll_stop(" . Db::quote_literal($pars['collaborator_id']) . ")") )
			{
				self::raiseError('Unable to stop properly: ' . Db::last_error());
			}
			self::setResult(true);
		}
		
		public function on_collaboration_get_unread_messages($pars)
		{
			$pre_ids = explode(',', $pars['receiver_ids']);
			$ids = array();
			foreach ( $pre_ids as $id )
			{
				$ids[] = Db::quote_literal($id);
			}
			# checking/reviving existing collaborations
			if (false === $res = Db::find('SELECT amy.coll_check_collaborations(ARRAY[' . implode(',', $ids) . '])'))
			{
				self::raiseError('Unable to proceed: ' . Db::last_error());
			}
			if (false === $res = Db::find('SELECT * FROM amy.coll_unread_messages WHERE collaborator_receiver_id IN ('.implode(',', $ids).')'))
			{
				self::raiseError('Unable to proceed: ' . Db::last_error());
			}
			$messages = array();
			while ( false !== $r = @pg_fetch_assoc($res) )
			{
				$r['params'] = Db::parse_array_string($r['params']);
				$messages[] = $r;
			}
			self::setResult($messages);
		}
		
		public function on_collaboration_handle_message($pars)
		{
			$response = true;
			if ( 'call' == $pars['routine'] )
			{
				$sql = 'SELECT * FROM amy.coll_handle_message('.Db::quote_literal($pars['collaborator_id']).','.Db::quote_literal($pars['id']).',';
				if ( is_array($pars['pars']) )
				{
					$n = sizeof($pars['pars']);
					for ( $i=0; $i<$n; $i++ )
					{
						$pars['pars'][$i] = Db::quote_literal($pars['pars'][$i]);
					}
					$sql .= "ARRAY['".implode("','", $pars['pars'])."'])";
				}
				else
				{
					$sql .= 'NULL)';
				}
				if ( false === $res = Db::find($sql) )
				{
					self::raiseError('Unable to handle message: ' . Db::last_error());
					// self::raiseError('Unable to handle. ' . $sql . '. ' . Db::last_error());
				}
				$row = pg_fetch_row($res);
//				print_r($row);die();
				$row = Db::parse_array_string($row[0]);
				$response = array();
//				print_r($row);die();
				foreach ($row as $i=>$value)
				{
					$response[] = array('key' => $i, 'value' => $value);
				}
			}
			else
			{
				Db::find('SELECT amy.coll_delete_message('.Db::quote_literal($pars['id']).')');
			}
			self::setResult($response);
		}
		
		public function on_collaboration_handle_transactions($pars)
		{
			$colls = $pars['colls'];
			if ( !is_array($colls) )
			{
				self::raiseError('Invalid data received.');
			}
			$response = array();
			$n = sizeof($colls);
			for ( $i=0; $i<$n; $i++ )
			{
				$coll = explode('|', $colls[$i]);
				$document_id = Db::quote_literal($coll[0]);
				$collaborator_id = Db::quote_literal($coll[1]);
				$last_transid = Db::quote_literal($coll[2]);
				unset($coll[0]);
				unset($coll[1]);
				unset($coll[2]);
				$log = Db::quote_literal(str_replace('\\', '\\\\', implode('|', $coll)));
				
				$coll_response = array();
				if ( false !== $res = Db::find("SELECT * FROM amy.coll_handle_transactions($document_id, $collaborator_id, $last_transid, '$log')") )
				{
					while ( false !== $r = pg_fetch_assoc($res) )
					{
						$coll_response[] = $r;						
					}
				}
				else
				{
					$coll_response = Db::last_error();
				}
				$response[] = array('document_id'=>$document_id, 'transactions'=>$coll_response);
			}
			self::setResult($response);
		}
				
	}
	
	// _______ end callback function
	function end_amy_request()
	{
		Db::close_connection();
	}
	
	// _______ launcher
	try
	{
		$action = new AmyController($_AMY_CONF);
		$action->process($_REQUEST['a'], new AmyLogger, 'end_amy_request');
	}
	catch ( Exception $e )
	{
		AmyController::raiseError( $e->getMessage() );
	}
