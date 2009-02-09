<?php
	ob_start("ob_gzhandler");
	header('Content-Type: text/javascript');
	
	// check for cache
	$cachet_name = md5($_REQUEST['bundle'].'/'.$_REQUEST['theme'].'/'.$_REQUEST['language']).'.eamy';
	$cachet_path = dirname(__FILE__).'/../../cache/files/' . $cachet_name;
	if (file_exists($cachet_path) && (3600 > time() - filectime($cachet_path)))
	{
		echo file_get_contents($cachet_path);
		exit();
	}
	

	$http_addr = 'http://'.$_SERVER['HTTP_HOST'] . str_replace('/api/embed/amy.php', '', $_SERVER['SCRIPT_NAME']);

	$__dn = dirname(__FILE__).'/../../';
	include $__dn.'conf/amy/configuration.php';
	include $__dn.'lib/amy.php';
	
	$_AMY_CONF['support-path'] .= '/amy_default/';
	
	// including Fry
	include $__dn.'client/fry/ac.fry.js';
	include $__dn.'client/fry/ac.fry.keyboard.js';
?>
	var client = {conf:{fry:{backendURL:''}}};
	var eamy = 
	{
		snippets:[],
		instances:[]
	};

<?php
	include $__dn.'client/fry/chap/ac.chap.js';
	include $__dn.'client/fry/chap/ac.chap.view.js';
	include $__dn.'client/fry/chap/ac.chap.settings.js';

	function strip_file_name($name)
	{
		return str_replace('..', '', str_replace('/', '', $name));
	}


	// BEGIN: embedding Theme definition script
	echo "\n// Generated from theme definition file.\n";
	$theme_name = strip_file_name($_REQUEST['theme'].'.amTheme');
	$themes_path = $_AMY_CONF['support-path'].'/themes/';
	if (!file_exists($themes_path.$theme_name))
	{
		$theme_name = 'default.amTheme';
	}
	
	$theme = YAML::load($themes_path.$theme_name);

	echo '$class(\'ac.chap.theme.EAmy < ac.chap.Theme\');

	ac.chap.theme.EAmy.prototype.initDefinition = function()
	{
		$call(this, \'ac.chap.Theme.initDefinition\');';
	foreach ($theme['definition'] as $key=>$value)
	{
		if ('T' == $key{0} || 'C' == $key{0})
		{
			$key = 'colorScheme[ac.chap.' . $key . ']';
		}
		echo 'this.' . $key . ' = ' . "'$value';\n";
	}
	echo '}' . "\n\n";
	// END: embedding Theme definition script
	
	echo "\n// Generated from bundle keymap definition file.\n";
	// BEGIN: embedding bundle
	$bundle_id = strip_file_name($_REQUEST['bundle']);
	$host_os = isset($pars['host_os']) ? $pars['host_os'] : (false!==strpos($_SERVER['HTTP_USER_AGENT'], 'intosh')?'Mac':'Windows');
	if ( !in_array($host_os, array('Mac', 'Windows')) )
	{
		$host_os = 'Windows';
	}
	try
	{
		$bundle = new AMYBundle($_AMY_CONF['support-path'], $bundle_id, $host_os);
	}
	catch (Exception $e)
	{
		$bundle = new AMYBundle($_AMY_CONF['support-path'], 'default', $host_os);
	}
	$bundle_def = $bundle->dumpDefinition();
	echo 'ac.chap.KeyMap.prototype.initDefinition = function()
	{
		var _ = \'\n\';
		this.compile
		(""';
	$lines = explode("\n", trim($bundle_def['keymap']));
	foreach ($lines as $line)
	{
		$line = trim($line);
		if ('' == $line || '#' == $line{0})
		{
			continue;
		}
		echo '+_+ "' . ('K' == $line{0} ? '' : "\t") . $line . "\"\n";
	}
	echo ")};\n\n";
	
	echo '$class(\'ac.chap.lang.EAmy < ac.chap.Language\');

	ac.chap.lang.EAmy.prototype.initDefinition = function()
	{
		$call(this, \'ac.chap.Language.initDefinition\');';
	
	// one bundle can contain more than one language definition - so the search for desired one.. &bundle=javascript&language=fry
	$lang_def = $bundle_def['languages'][0];
	foreach ($bundle_def['languages'] as $language)
	{
		if ($_REQUEST['language'] == $language['id'])
		{
			$lang_def = $language;
			break;
		}
	}
	foreach ($lang_def['definition'] as $key=>$value)
	{
		if (!is_array($value))
		{
			if (false !== strpos($key, 'Quote') || false !== strpos($key, 'multiRowComment'))
			{
				echo 'this.' . $key . ' = "' . str_replace('"', '\\"', $value) . '"';
			}
			else
			{
				echo 'this.' . $key . ' = ' . $value;
			}
			echo ";\n";
		}
	}
	foreach ($lang_def['definition']['chunkRules'] as $rule)
	{
		echo 'this.chunkRules.push(' . $rule . ')' . "\n";
	}
	echo '}' . "\n";
	
	echo "var snippet = {};\n";
	foreach ($bundle_def['snippets'] as $snippet)
	{
		echo 'snippet = {' . ('' != $snippet['key_activation'] ? ("key_activation:'" . $snippet['key_activation'] . "',") : '');
		echo "tab_activation: '" . str_replace("'", "'+\"'\"+'", $snippet['tab_activation']) . "', code: '" . str_replace("\n", '\\n', str_replace("'", "'+\"'\"+'", str_replace('\u', "" ."'+'u", $snippet['code']))) . "'};\n";
		echo "eamy.snippets.push(snippet);\n";
	}
	// END: embedding bundle

	
?>

	
	function showEditor(templateNode)
	{
		var source = templateNode.value;
		templateNode = $(templateNode);
		var w = templateNode.w();
		var h = templateNode.h();
		
		var node = templateNode.p().ib($$(), templateNode).w(w).h(h);
		templateNode.d(false);
		
		var language = ac.chap.lang.JavaScript;
		var keymap = ac.chap.keymap.EAmyJavaScript;

		var instance = $new(ac.chap.Window, {language:ac.chap.lang.EAmy, keymap:ac.chap.Keymap});
		instance.addView(node, {theme:ac.chap.theme.EAmy, rowHeight:11, colWidth:7, wordWrap:true, tabelator:'<?php echo str_repeat(' ', $lang_def['signature']['tabSize']); ?>'});

		instance.show();
		instance.setSnippets(eamy.snippets);
		instance.keymap.importSnippets(eamy.snippets);
		instance.edit(source);
		eamy.instances.push(instance);

	}
	
	document.write('<link rel="stylesheet" href="<?php echo $http_addr; ?>/api/embed/amy_style.php" type="text/css" media="screen" title="no title" charset="utf-8" />');

	// var style = document.getElementsByTagName('head').item(0).appendChild(document.createElement('link'));
	// style.setAttribute('type', 'text/css');
	// style.setAttribute('rel', 'stylesheet');
	// style.setAttribute('href', '<?php echo $http_addr; ?>/api/embed/amy_style.php');
	
	

	$__tune.event.addListener(self, 'load', function(evt)
	{
		var lst = document.getElementsByTagName('textarea');
		for (var i=0; i<lst.length; i++)
		{
			var node = lst.item(i);
			if ('true' == node.getAttribute('-amy-enabled'))
			{
				showEditor(node);
				var form_node = node;
				while (document != form_node.parentNode)
				{
					if ('form' == form_node.tagName.toLowerCase())
					{
						// changing the submit handler
						eamy.action = form_node.action;
						eamy.form = form_node;
						eamy.textarea = node;
						form_node.action = null;
						form_node.onsubmit = function() {setTimeout('eamy.submit()', 50); return false;}
					}
					form_node = form_node.parentNode;
				}
				break;
			}
		}		
	});
	

	
	eamy.submit = function()
	{
		eamy.form.action = eamy.action;
		eamy.form.onsubmit = null;
		if ($__tune.isSafari2)
		{
			eamy.textarea.innerHTML = eamy.instances[0].getText();
		}
		else
		{
			eamy.textarea.value = eamy.instances[0].getText();
		}
		eamy.form.submit();
	}
	
	if (!self['console'])
	{
		var console = {info:function(){}};
		console.log = console.error = console.warn = console.info;
		
	}
	
<?php
	@file_put_contents($cachet_path, ob_get_contents());
?>