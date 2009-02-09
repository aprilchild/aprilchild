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

	Bundle library

  *------------------------------------------------------------------------------------------
*/

class AMYBundle
{
	protected $bundlePath = '';
	protected $info = array();
	protected $supportPath = '';
	protected $hostOS = '';
	protected $name = '';
	
	public $dependencies = array();
	public $snippets_inherited = array();
	
	public function __construct($supportPath, $name = 'default', $hostOS = 'Windows')
	{
		$this->supportPath = $supportPath;
		$this->name = $name;
		$this->hostOS = $hostOS;
		$name = trim($name);
		if ( '' == $name )
		{
			throw new Exception('Invalid bundle name.');
		}
		$this->bundlePath = $supportPath.'/bundles/'.strtolower($name).'/';
		if ( !is_dir($this->bundlePath) )
		{
			throw new Exception('Bundle `'.$name.'` not found at `'.$this->bundlePath.'`.');
		}
		$this->info = $this->loadYAML('info.amBundle', 'info');
		$this->dependencies = $this->info['signature']['dependencies'];
		$this->snippets_inherited = is_array($this->info['signature']['snippets_inherited']) ? $this->info['signature']['snippets_inherited'] : array();
	}
	
	protected function loadYAML($relativePath, $name)
	{
		$file_path = $this->bundlePath.$relativePath;
		if ( !file_exists($file_path) )
		{
			throw new Exception('Bundle `'.$this->name.'` '.$name.' file `'.$file_path.'` not found.');
		}
		try
		{
			$yaml = YAML::load($file_path);
		}
		catch ( Exception $e )
		{
			throw new Exception('Bundle `'.$this->name.'` loading error: `'.$e->getMessage().'` for '.$name.' at `'.$relativePath.'`.');
		}
		return $yaml;
	}
	
	protected function getKeyMapDefinition()
	{
		$keymap_default = $this->loadYAML('/keymaps/default.amKeymap', 'default keymap');
		$keymap_os = $this->loadYAML('/keymaps/'.$this->hostOS.'.amKeymap', 'host OS keymap');
		$definition = $keymap_default['definition']."\n".$keymap_os['definition'];
		if ( is_array($keymap_default['signature']['inherits']) )
		{
			foreach ( $keymap_default['signature']['inherits'] as $bundle_name )
			{
				$bundle = new AMYBundle($this->supportPath, $bundle_name, $this->hostOS);
				$definition = $bundle->getKeyMapDefinition()."\n".$definition;
			}
		}
		return $definition;
	}
	
	protected function getLanguageDefinition($langName)
	{
		$language = $this->loadYAML('/languages/'.$langName.'.amLanguage', 'language');
		$definition = $language['definition'];
		$base_definition = array('chunkRules'=>array());
		$base_signature = array();
		if ( is_array($language['signature']['inherits']) )
		{
			foreach ( $language['signature']['inherits'] as $base )
			{
				$base = explode(':', $base);
				$bundle = new AMYBundle($this->supportPath, $base[0], $this->hostOS);
				$base_language = $bundle->getLanguageDefinition($base[1]);
				$base_signature = array_merge($base_language['signature'], $base_signature);
				$base_definition = array_merge($base_language['definition'], $base_definition);
				$base_definition['chunkRules'] = array_merge($base_language['definition']['chunkRules'], $base_definition['chunkRules']);
			}
		}
		$language['signature'] = array_merge($base_signature, $language['signature']);
		$language['definition'] = array_merge($base_definition, $language['definition']);
		$language['definition']['chunkRules'] = array_merge($base_definition['chunkRules'], $language['definition']['chunkRules']);
		return $language;
	}
	
	private function getSnippetsInDirectory($path, $relativePath)
	{
		$snippets = array();
		if (false !== $d = opendir($path))
		{
			while (false !== $f = readdir($d))
			{
				$new_path = $path.'/'.$f;
				$new_relative_path = $relativePath . '/' . $f;
				if ('.amSnippet' == substr($f, -10) || (is_dir($new_path) && 0 != strncmp('.', $f, 1)))
				{
					if (is_dir($new_path) && file_exists($new_path . '/group.amGroup'))
					{
						$yaml = YAML::load($new_path . '/group.amGroup');
						$yaml['filename'] = $f;
						$yaml['is_collection'] = '1';
						$yaml['path'] = $relativePath;
						$snippets[] = $yaml;
						$snippets = array_merge($snippets, $this->getSnippetsInDirectory($new_path, $new_relative_path));
						continue;
					}
					$def_file = $new_path . 'Def';
					if (!file_exists($def_file))
					{
						throw new Exception('Missing snippet definition file `'.$def_file.'`.');
					}
					$yaml = YAML::load($new_path);
					$yaml['code'] = file_get_contents($def_file);
					$yaml['filename'] = substr($f, 0, -10);
					$yaml['path'] = $relativePath;
					$snippets[] = $yaml;
				}
			}
			closedir($d);
		}
		return $snippets;
	}
	
	protected function getSnippets()
	{
		$snippets = array();
		foreach ($this->snippets_inherited as $bundle_id )
		{
			$bundle = new AMYBundle($this->supportPath, $bundle_id, $this->hostOS);
			$snippets = array_merge($snippets, $bundle->getSnippets());
		}
		$snippets_path = $this->bundlePath.'/snippets/';
		if ( !is_dir($snippets_path) )
		{
			return $snippets;
		}
		$res_snippets = array();
		foreach ($snippets as $snippet)
		{
			$snippet['is_inherited'] = '1';
			$res_snippets[] = $snippet;
		}
		return array_merge($res_snippets, $this->getSnippetsInDirectory($snippets_path, ''));
	}
	
	private function getCommandsInDirectory($path, $relativePath)
	{
		$commands = array();
		if (false !== $d = opendir($path))
		{
			while (false !== $f = readdir($d))
			{
				$new_path = $path.'/'.$f;
				$new_relative_path = $relativePath . '/' . $f;
				if ('.amCommand' == substr($f, -10) || (is_dir($new_path) && 0 != strncmp('.', $f, 1)))
				{
					if (is_dir($new_path) && file_exists($new_path . '/group.amGroup'))
					{
						$yaml = YAML::load($new_path . '/group.amGroup');
						$yaml['filename'] = $f;
						$yaml['is_collection'] = '1';
						$yaml['path'] = $relativePath;
						$commands[] = $yaml;
						$commands = array_merge($commands, $this->getCommandsInDirectory($new_path, $new_relative_path));
						continue;
					}
					$def_file = $new_path . 'Def';
					if (!file_exists($def_file))
					{
						throw new Exception('Missing command definition file `'.$def_file.'`.');
					}
					$yaml = YAML::load($new_path);
					$yaml['code'] = file_get_contents($def_file);
					$yaml['filename'] = substr($f, 0, -10);
					$yaml['path'] = $relativePath;
					$commands[] = $yaml;
				}
			}
			closedir($d);
		}
		return $commands;
	}	
	
	protected function getCommands()
	{
		$commands_path = $this->bundlePath.'/commands/';
		if ( !is_dir($commands_path) )
		{
			return array();
		}
		return $this->getCommandsInDirectory($commands_path, '');
	}
	
	protected function getTemplates()
	{
		$templates_path = $this->bundlePath.'/templates/';
		if ( !is_dir($templates_path) )
		{
			return array();
		}
		$templates = array();
		if ( false !== $d = opendir($templates_path) )
		{
			while ( false !== $f = readdir($d) )
			{
				if ('.' == $f{0})
				{
					continue;
				}
				$content = file_get_contents($templates_path . '/' . $f);
				$ix = strpos($content, "\n");
				$info = explode(';', substr($content, 0, $ix));
				$content = substr($content, $ix+1);
				$templates[] = array('filename' => $info[0], 'name' => $info[1], 'content' => $content);
			}
			closedir($d);
		}
		return $templates;
	}
	
	public function dumpDefinition()
	{
		$def = array('info'=>$this->info, 'keymap'=>$this->getKeyMapDefinition());
		// getting languages
		$languages = array();
		$lang_dir_path = $this->bundlePath.'/languages';
		if ( is_dir($lang_dir_path) )
		{
			if ( false !== $d = opendir($lang_dir_path) )
			{
				while ( false !== $f = readdir($d) )
				{
					if ( 0 != strncmp('.', $f, 1) && '.amLanguage' == substr($f, -11) )
					{
						$lang_def = $this->getLanguageDefinition(substr($f, 0, -11));
						$lang_def['id'] = substr($f, 0, -11);
						$languages[] = $lang_def;
					}
				}
				closedir($d);
			}
		}
		$def['languages'] = $languages;
		$def['snippets'] = $this->getSnippets();
		$def['commands'] = $this->getCommands();
		$def['templates'] = $this->getTemplates();
		$def['id'] = $this->name;
		return $def;
	}
}