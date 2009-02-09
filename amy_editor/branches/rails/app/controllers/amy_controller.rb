#++
#     ------------------------------------------------------------------------------------------
#     == Amy Editor ==
#     Collaborative Text and Source Code Editor for Developers
# 
#     Built on the technologies developed and maintained by April-Child.com
#     Copyright (c)2007,2008 Petr Krontorad, April-Child.com.
# 
#     Author: Petr Krontorad, petr@krontorad.com
# 
#     All rights reserved.
#     *------------------------------------------------------------------------------------------
# 
#     Main controller
# 
#     *------------------------------------------------------------------------------------------
#--



class AmyController < Amy::AbstractApplicationController

  def load_settings
		path = File.join(amy_support_path, "/settings/#{strip_filename(@params['name'])}.amSettings")
		set_result YAML::load(File.open(path))
  end
  
  def list_themes
		themes_path = File.join(amy_support_path, '/themes/')
		return raise_error("There is no themes directory available.") unless File.directory?(themes_path)
		themes = []
		Dir.foreach(themes_path) do |f|
		  next unless '.amTheme' == f[-8..-1]
		  yaml = YAML::load(File.open(themes_path + f))
		  yaml['id'] = f[0..-9]
		  themes << yaml
	  end
	  set_result themes
  end
  
  def list_bundles
    begin
      set_result amy_list_bundles
    rescue => e
      raise_error "There is no bundles directory available."
    end
  end

  def load_bundle
    bundle = amy_load_bundle(@params['id'], 'default', request.env['HTTP_USER_AGENT'].match(/intosh/).nil? ? 'Windows':'Mac', :yaml)
    set_result bundle.dump_definition
  end

	def load_language_definition_source
		lang_path = amy_support_path + "/bundles/#{@params['language_id'].sub('_', '/languages/')}.amLanguage"
		return set_result(File.read(lang_path)) if File.exist?(lang_path)
		raise_error "Language definition not found for `#{@params['language_id']}'."
	end
end

__END__


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
			if (false === $res = Pg::find('SELECT * FROM amy.user_find_relations(' . $this->user->userId . ')'))
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
			$original_email = Pg::quote_literal(trim($pars['original_email']));
			$email = Pg::quote_literal(trim($pars['email']));
			$nickname = Pg::quote_literal(trim($pars['nickname']));
			if (false === $row = Pg::find_first('SELECT * FROM amy.user_update_relation(' . $this->user->userId . ", '$original_email', '$nickname', '$email')"))
			{
				self::raiseError('Error updating relation: ' . Pg::last_error());
			}
			self::setResult($row);
		}

		public function on_user_remove_relation($pars)
		{
			$this->fail_not_authenticated();
			$user_id = $pars['user_id'];
			if (is_numeric($user_id) && 0 < $user_id)
			{
				$res = Pg::find('SELECT amy.user_delete_relation(' . $this->user->userId . ", $user_id)");
			}
			else
			{
				$email = Pg::quote_literal(trim($pars['email']));
				$res = Pg::find('SELECT amy.user_delete_relation(' . $this->user->userId . ", '$email')");
			}
			if (false === $res)
			{
				self::raiseError('Error removing relation: ' . Pg::last_error());
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
	
		private function getFilenameByName($name)
		{
			$filename = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
			if ( '' == $filename )
			{
				$filename = 'snippet';
			}
			return $filename;			
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
				if (false === $row = Pg::find_first("SELECT * FROM amy.coll_create(" . $this->user->userId. ", '" . Pg::quote_literal($pars['url']) . "', '" . Pg::quote_literal($pars['path']) . "', '" . Pg::quote_literal($content) . "', '" . Pg::quote_literal($pars['email']) . "', '" . Pg::quote_literal($pars['permission']) . "', '" . Pg::quote_literal($pars['message']) . "', '3:00:00')") )
				{
					self::raiseError('Unable to invite: ' . Pg::last_error());
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
			if ( false === $row = Pg::find_first("SELECT * FROM amy.coll_accept(" . $this->user->userId. ", '" . Pg::quote_literal($pars['hash']) . "')") )
			{
				self::raiseError('Unable to accept: ' . Pg::last_error());
			}
			self::setResult($row);
		}
		
		public function on_collaboration_stop($pars)
		{
			if ( false === $row = Pg::find_first("SELECT * FROM amy.coll_stop(" . Pg::quote_literal($pars['collaborator_id']) . ")") )
			{
				self::raiseError('Unable to stop properly: ' . Pg::last_error());
			}
			self::setResult(true);
		}
		
		public function on_collaboration_get_unread_messages($pars)
		{
			$pre_ids = explode(',', $pars['receiver_ids']);
			$ids = array();
			foreach ( $pre_ids as $id )
			{
				$ids[] = Pg::quote_literal($id);
			}
			# checking/reviving existing collaborations
			if (false === $res = Pg::find('SELECT amy.coll_check_collaborations(ARRAY[' . implode(',', $ids) . '])'))
			{
				self::raiseError('Unable to proceed: ' . Pg::last_error());
			}
			if (false === $res = Pg::find('SELECT * FROM amy.coll_unread_messages WHERE collaborator_receiver_id IN ('.implode(',', $ids).')'))
			{
				self::raiseError('Unable to proceed: ' . Pg::last_error());
			}
			$messages = array();
			while ( false !== $r = @pg_fetch_assoc($res) )
			{
				$r['params'] = Pg::parse_array_string($r['params']);
				$messages[] = $r;
			}
			self::setResult($messages);
		}
		
		public function on_collaboration_handle_message($pars)
		{
			$response = true;
			if ( 'call' == $pars['routine'] )
			{
				$sql = 'SELECT * FROM amy.coll_handle_message('.Pg::quote_literal($pars['collaborator_id']).','.Pg::quote_literal($pars['id']).',';
				if ( is_array($pars['pars']) )
				{
					$n = sizeof($pars['pars']);
					for ( $i=0; $i<$n; $i++ )
					{
						$pars['pars'][$i] = Pg::quote_literal($pars['pars'][$i]);
					}
					$sql .= "ARRAY['".implode("','", $pars['pars'])."'])";
				}
				else
				{
					$sql .= 'NULL)';
				}
				if ( false === $res = Pg::find($sql) )
				{
					self::raiseError('Unable to handle message: ' . Pg::last_error());
					// self::raiseError('Unable to handle. ' . $sql . '. ' . Pg::last_error());
				}
				$row = pg_fetch_row($res);
//				print_r($row);die();
				$row = Pg::parse_array_string($row[0]);
				$response = array();
//				print_r($row);die();
				foreach ($row as $i=>$value)
				{
					$response[] = array('key' => $i, 'value' => $value);
				}
			}
			else
			{
				Pg::find('SELECT amy.coll_delete_message('.Pg::quote_literal($pars['id']).')');
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
				$document_id = Pg::quote_literal($coll[0]);
				$collaborator_id = Pg::quote_literal($coll[1]);
				$last_transid = Pg::quote_literal($coll[2]);
				unset($coll[0]);
				unset($coll[1]);
				unset($coll[2]);
				$log = Pg::quote_literal(str_replace('\\', '\\\\', implode('|', $coll)));
				
				$coll_response = array();
				if ( false !== $res = Pg::find("SELECT * FROM amy.coll_handle_transactions($document_id, $collaborator_id, $last_transid, '$log')") )
				{
					while ( false !== $r = pg_fetch_assoc($res) )
					{
						$coll_response[] = $r;						
					}
				}
				else
				{
					$coll_response = Pg::last_error();
				}
				$response[] = array('document_id'=>$document_id, 'transactions'=>$coll_response);
			}
			self::setResult($response);
		}
				
	}
	
	// _______ end callback function
	function end_amy_request()
	{
		Pg::close_connection();
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
	
?>
