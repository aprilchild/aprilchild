/*
  *------------------------------------------------------------------------------------------
	== Amy Editor ==
	Collaborative Text and Source Code Editor for Developers

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007,2008 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	Bundles model support

  *------------------------------------------------------------------------------------------
*/

/*	THEMES
	_______________________________________________________________ */

client.model.themes = {};

client.model.listThemes = function()
{
	var themes = [];
	for ( var id in client.model.themes )
	{
		themes.push({id:id, name:client.model.themes[id].info.name});
	}
	return themes;
}

client.model.setupTheme = function(theme)
{
	var class_name = 'default' == theme.id ? 'Amy' : theme.id;
	var src = "$class('ac.chap.theme."+class_name+" < ac.chap.Theme');\n";
	src += 'ac.chap.theme.'+class_name+".prototype.initDefinition = function(){\n$call(this, 'ac.chap.Theme.initDefinition');\n";
	for ( var key in theme.definition )
	{
		if ( 2 < key.length && '_' != key.charAt(0) )
		{
			if ( 'CHUNK' == key.substr(0,5) || 'TOKEN' == key.substr(0,5) )
			{
				src += "this.colorScheme[ac.chap."+key+"]='"+theme.definition[key]+"';";
			}
			else
			{
				src += "this."+key+"='"+theme.definition[key]+"';";
			}
			src += "\n";
		}
	}
	src += "\n}";
	try
	{
//		console.info(src);
		eval(src);
		client.model.themes[theme.id] = {info:theme.signature, klass:null};
		eval('client.model.themes[theme.id].klass = ac.chap.theme.'+class_name+';');
		console.info('Theme `?` set up successfully.'.embed(theme.id));
		return true;
	}
	catch (e)
	{
		console.error('Error while setting up theme `?`: ?'.embed(theme.id, e));
	}
	return false;
}

client.model.getThemeClass = function(themeId)
{
	return client.model.themes[themeId].klass;
}

client.model.getThemeName = function(themeId)
{
	return client.model.themes[themeId].info.name;
}




/*	BUNDLES (keymaps, languages)
	_______________________________________________________________ */


client.model.bundles = {};
client.model.languages = {};
client.model.snippets = {};
client.model.snippetGroups = {};
client.model.commands = {};
client.model.commandGroups = {};

client.model.setupBundle = function(bundle)
{
	client.model.bundles[bundle.id] = {id:bundle.id, state:0, info:bundle.signature, keymap:null, languages:[], templates:bundle.templates};
}

client.model.initializeBundle = function(bundleId, callback)
{
	if ( !$isset(client.model.bundles[bundleId]) )
	{
		console.error('Bundle `?` could not been initialized due no previous setup.'.embed(bundleId));
		callback(false);
		return;
	}
	var bundle = client.model.bundles[bundleId];
	if ( 1 == bundle.state )
	{
		// console.info('Bundle `?` already initialized.'.embed(bundleId));
		callback(bundle);
		return;
	}
	$rpost
	(
		{
			a:'load_bundle',
			id:bundleId
		},
		function(loaded_bundle)
		{
			try
			{
				client.model.compileBundle(bundle, loaded_bundle);
			}
			catch(e)
			{
				bundle.state = 3;
				console.error('Error while compiling bundle `?`: ?'.embed(bundleId, e));
				callback(false);
				return;
			}
			bundle.state = 1;
			callback(bundle);
		},
		function(e)
		{
			bundle.state = 2;
			console.error('Error while loading bundle `?`: ?'.embed(bundleId, e));
			callback(false);
		}
	)
}

client.model.getBundleByExtension = function(extension)
{
	var info = client.model.settings.extensionMap[extension];
	var bundle_id = '';
	if ( !info )
	{
		bundle_id = 'default';
	}
	else
	{
		bundle_id = info[0];
	}
	return client.model.bundles[bundle_id];
}

client.model.initializeBundleByExtension = function(extension, callback)
{
	var info = client.model.settings.extensionMap[extension];
	// console.log('%', info);
	if ( !info )
	{
		callback('Amy_default', '    ', 'default');
		return;
	}
	client.model.initializeBundle(info[0], function(result)
	{
		if ( !result )
		{
			callback('Amy_default', '    ', 'default');
			return;
		}
		var language_id = info[1];
		callback(language_id, client.model.getLanguageTabelator(language_id), info[2]);
	});
}

client.model.compileBundle = function(bundle, loadedBundle)
{
//	console.log('%o', loadedBundle);
	// creating keymap
	var class_name = 'default' == bundle.id ? 'Amy' : bundle.id;
	var keymap_source = loadedBundle.keymap.replace(/\n/g, '\\n').replace(/'/g, "\\'");
	var src = "$class('ac.chap.keymap."+class_name+" < ac.chap.KeyMap');\n";
	src += 'ac.chap.keymap.'+class_name+".prototype.initDefinition = function(){\n$call(this, 'ac.chap.KeyMap.initDefinition');\n";
	src += "this.compile('"+keymap_source+"');\n"
	src += "}";
	eval(src);
	eval('bundle.keymap=ac.chap.keymap.'+class_name+';');
	bundle.keymapSource = keymap_source.replace(/\\n/g, '\n').replace(/\\'/g, "'");
	// compiling languages
	$foreach ( loadedBundle.languages, function(language)
	{
		language.signature.bundleId = bundle.id;
		language.signature.bundleName = bundle.info.name;
		class_name = ('default' == bundle.id ? 'Amy' : bundle.id)+'_'+language.id;
		src = "$class('ac.chap.lang."+class_name+" < ac.chap.Language');\n";
		src += "ac.chap.lang."+class_name+".prototype.initDefinition = function(){\n";
		src += "$call(this, 'ac.chap.Language.initDefinition');\n";
		src += "this.chunkRules = [];\n";
		var definition_source = '';
		
		for ( var key in language.definition )
		{
			if ( 2 < key.length && '_' != key.charAt(0) )
			{
				if ( 'chunkRules' == key )
				{
					$foreach ( language.definition[key], function(rule)
					{
						src += "this.chunkRules.push("+rule+");\n";
					})
				}
				else if ( 0 == key.indexOf('multiRow') || 0 == key.indexOf('singleQ') ||0 == key.indexOf('doubleQ') )
				{
					src += "this."+key+"='"+language.definition[key].replace(/'/g, "\\'")+"';";
				}
				else
				{
					src += "this."+key+"="+language.definition[key]+";";
					
				}
				src += "\n";
			}
		}
		src += "}"
		try
		{
			eval(src);
		}
		catch (e)
		{
			throw new FryException(987, "Error while compiling languages: `?', source: `?'".embed(e, src))
		}
		eval("client.model.languages[class_name] = {info:language.signature, klass:ac.chap.lang."+class_name+"};");
		client.model.bundles[bundle.id].languages.push(class_name);
	});
	client.model.snippets[bundle.id] = [];
	client.model.snippetGroups[bundle.id] = [];
	$foreach ( loadedBundle.snippets, function(snippet)
	{
		if ('1' == snippet.is_collection && '1' != snippet.is_inherited)
		{
			client.model.snippetGroups[bundle.id].push(snippet)
		}
		else
		{
		    snippet.index = client.model.snippets[bundle.id].length;
			client.model.snippets[bundle.id].push(snippet);
		}
	});
	client.model.commands[bundle.id] = [];
	client.model.commandGroups[bundle.id] = [];
	$foreach ( loadedBundle.commands, function(command)
	{
		if ('1' == command.is_collection)
		{
			client.model.commandGroups[bundle.id].push(command);
		}
		else
		{
		    command.index = client.model.commands[bundle.id].length;
		    command.bundle_id = bundle.id;
			client.model.commands[bundle.id].push(command);
		}
	});
	bundle.templates = [];
	$foreach ( loadedBundle.templates, function(template)
	{
		bundle.templates.push({filename:template.filename, name:template.name, content:template.content});
	});
}

client.model.listBundles = function()
{
	var bundles = [];
	for ( var id in client.model.bundles )
	{
		bundles.push({id:id, name:client.model.bundles[id].info.name, state:client.model.bundles[id].state});
	}
	return bundles;
}

client.model.listLanguages = function()
{
	var languages = [];
	for ( var id in client.model.languages )
	{
		languages.push({id:id, name:client.model.languages[id].info.name, bundleName:client.model.languages[id].info.bundleName});
	}
	return languages;
}

client.model.listSnippets = function(bundleId)
{
	return client.model.snippets[bundleId];
}

client.model.listSnippetsByLanguage = function(languageId)
{
	var bundle_id = client.model.languages[languageId].info.bundleId;
	return client.model.listSnippets(bundle_id);
}

client.model.listCommands = function(bundleId)
{
	return client.model.commands[bundleId];
}

client.model.listCommandsByLanguage = function(languageId)
{
	var bundle_id = client.model.languages[languageId].info.bundleId;
	return client.model.listCommands(bundle_id);
}

client.model.getLanguageClass = function(languageId)
{
	return client.model.languages[languageId].klass;
}

client.model.getLanguageName = function(languageId)
{
	return client.model.languages[languageId].info.name;
}

client.model.getLanguageTabelator = function(languageId)
{
	return new Array(parseInt(client.model.languages[languageId].info.tabSize)+1).join(' ');
}

client.model.getKeymapClass = function(languageId)
{
	return client.model.bundles[client.model.languages[languageId].info.bundleId].keymap;
}

client.model.loadLanguageDefinitionSource = function(languageId, callback)
{
    if ( 'Amy_' == languageId.substr(0,4) )
    {
        languageId = 'default_'+languageId.substr(4);
    }
    $rpost
    (
        {a:'load_language_definition_source', language_id:languageId},
        function(source)
        {
            callback(source);
        },
        function(e)
        {
            callback(null);
        }
    );
}

client.model.createSnippet = function(bundle)
{
	var snippet = {name:$loc('new_snippet_name'), key_activation:'', tab_activation:'snippet', code:$loc('new_snippet_code'), index:client.model.snippets[bundle.id].length};
	client.model.snippets[bundle.id].push(snippet);
	return snippet;
}

client.model.updateSnippet = function(bundleId, snippetIndex, name, code, tabActivation, keyActivation)
{
    var snippet = null;
    if ( $isset(client.model.snippets[bundleId][snippetIndex]) )
    {
        snippet = client.model.snippets[bundleId][snippetIndex];
        snippet.name = name;
        snippet.code = code;
        snippet.tab_activation = tabActivation;
        snippet.key_activation = keyActivation;
    }
	return snippet;
}

client.model.saveSnippets = function(bundleId, callback)
{
    var data = [];
    var snippets = client.model.snippets[bundleId];
    for ( var i in snippets )
    {
        var snippet = snippets[i];
        data.push($xmlinner($xmldeserialize(snippet)));
    }
    $rpost
    (
        {a:'save_bundle_snippets', id:bundleId, data:data},
        function(updates)
        {
            $foreach (updates, function(update)
            {
                client.model.snippets[bundleId][update.index].filename = update.filename;
            });
            callback(true);
        },
        function(e)
        {
            callback(false);
        }
    )
}

client.model.deleteSnippet = function(bundleId, snippetIndex, callback)
{
    if ( $isset(client.model.snippets[bundleId][snippetIndex]) )
    {
        var snippet = client.model.snippets[bundleId][snippetIndex];
        if ( $isset(snippet.filename) )
        {
            $rpost
            (
                {a:'delete_bundle_snippet', id:bundleId, filename:snippet.filename},
                function(r)
                {
                    delete client.model.snippets[bundleId][snippetIndex];
                    callback(true);
                },
                function(e)
                {
                    callback(false);
                }
            );
            return;
        }
        else
        {
            delete client.model.snippets[bundleId][snippetIndex];
            return callback(true);
        }
    }
    callback(false);
}

client.model.createCommand = function(bundle)
{
	var command = {
	    name:$loc('new_command_name'), 
	    key_activation:'67+ctrl+alt+shift', 
	    tab_activation:'', 
	    code:$loc('new_command_code'), 
	    input_type:'selected_text',
	    input_type:'document',
	    output_type:'insert_as_text',
	    script_env:'php',
	    index:client.model.commands[bundle.id].length,
	    bundle_id:bundle.id
	};
	client.model.commands[bundle.id].push(command);
	return command;
}

client.model.updateCommand = function(bundleId, commandIndex, name, code, tabActivation, keyActivation, inputType, inputTypeOr, outputType)
{
    var command = null;
    if ( $isset(client.model.commands[bundleId][commandIndex]) )
    {
        command = client.model.commands[bundleId][commandIndex];
        command.name = name;
        command.code = code;
        command.tab_activation = tabActivation;
        command.key_activation = keyActivation;
        command.input_type = inputType;
        command.input_type_or = inputTypeOr;
        command.output_type = outputType;
    }
	return command;
}

client.model.saveCommands = function(bundleId, callback)
{
    var data = [];
    var commands = client.model.commands[bundleId];
    for ( var i in commands )
    {
        var command = commands[i];
        data.push($xmlinner($xmldeserialize(command)));
    }
    $rpost
    (
        {a:'save_bundle_commands', id:bundleId, data:data},
        function(updates)
        {
            $foreach (updates, function(update)
            {
                client.model.commands[bundleId][update.index].filename = update.filename;
            });
            callback(true);
        },
        function(e)
        {
            callback(false);
        }
    )
}

client.model.deleteCommand = function(bundleId, commandIndex, callback)
{
    if ( $isset(client.model.commands[bundleId][commandIndex]) )
    {
        var snippet = client.model.commands[bundleId][commandIndex];
        if ( $isset(command.filename) )
        {
            $rpost
            (
                {a:'delete_bundle_command', id:bundleId, filename:command.filename},
                function(r)
                {
                    delete client.model.commands[bundleId][commandIndex];
                    callback(true);
                },
                function(e)
                {
                    callback(false);
                }
            );
            return;
        }
        else
        {
            delete client.model.commands[bundleId][commandIndex];
            return callback(true);
        }
    }
    callback(false);
}



amy.MainMenuModel.prototype.loadBundleSnippetsElement = function(acElem, callbackOnSuccess, callbackOnError)
{
	var bundle_id = acElem.properties.bundleId;
	var path = acElem.properties.path;
	client.model.initializeBundle(bundle_id, function(result)
	{
	    if ( !result )
	    {
	        return callbackOnError();
	    }
		// listing snippets
		var index = 0;
		var item = null;
		for (var i in client.model.snippets[bundle_id])
		{
			var snippet = client.model.snippets[bundle_id][i];
			if (path == snippet.path && '1' != snippet.is_inherited)
			{
		        var item = $new(ACElement);
		        item.isCollection = false;
				item.properties.label = snippet.name.encodeMarkup();
				item.properties.small = true;
				item.properties.bundleId = bundle_id;
				item.properties.snippetIndex = snippet.index;
				item.properties.commandId = 'bundles__run_snippet';
				item.properties.keyLikeSymbol = snippet.tab_activation + '<img src="mm/i/tab_key_symbol.gif" width="14" height="13" align="top"/>';
				item.properties.commandParams = ['bundleId', 'snippetIndex'];
		        acElem.appendChild(item);
				index++;
			}
		}
		var s_item = null;
		if (0 < index)
		{
	        s_item = acElem.appendChild($new(ACElement));
	        s_item.isCollection = false;
			s_item.properties.isSeparator = true;
		}
		index = 0;
	    // listing snippet groups
		for (var i in client.model.snippetGroups[bundle_id])
		{
			var snippetGroup = client.model.snippetGroups[bundle_id][i];
			if (path == snippetGroup.path)
			{
		        var item = $new(ACElement);
		        item.isCollection = true;
				item.type = 'bundle-snippets';
				item.properties.label = snippetGroup.name.encodeMarkup();
				item.properties.path = snippetGroup.path + '/' + snippetGroup.filename;
				item.properties.bundleId = bundle_id;
		        item.setState(item.STATE_COLLAPSED | item.STATE_WILL_LOAD);
		        acElem.appendChild(item);
				index++;
			}
		}
		if (0 == index && null != s_item)
		{
			s_item.parentElement.removeChild(s_item);
		}
	    callbackOnSuccess();
	});	
}

amy.MainMenuModel.prototype.loadBundleCommandsElement = function(acElem, callbackOnSuccess, callbackOnError)
{
	var bundle_id = acElem.properties.bundleId;
	var path = acElem.properties.path;
	client.model.initializeBundle(bundle_id, function(result)
	{
	    if ( !result )
	    {
	        return callbackOnError();
	    }
		// listing commands
		var index = 0;
		var item = null;
		for (var i in client.model.commands[bundle_id])
		{
			var command = client.model.commands[bundle_id][i];
			if (path == command.path)
			{
		        var item = $new(ACElement);
		        item.isCollection = false;
				item.properties.label = command.name.encodeMarkup();
				item.properties.small = true;
				item.properties.bundleId = bundle_id;
				item.properties.commandIndex = command.index;
				item.properties.commandId = 'bundles__run_command';
				item.properties.keyLikeSymbol = amy.util.get_key_combination_symbol(command.key_activation);
				item.properties.commandParams = ['bundleId', 'commandIndex'];
		        acElem.appendChild(item);
				index++;
			}
		}
		var s_item = null;
		if (0 < index)
		{
	        s_item = acElem.appendChild($new(ACElement));
	        s_item.isCollection = false;
			s_item.properties.isSeparator = true;
		}
		index = 0;
	    // listing snippet groups
		for (var i in client.model.commandGroups[bundle_id])
		{
			var commandGroup = client.model.commandGroups[bundle_id][i];
			if (path == commandGroup.path)
			{
		        var item = $new(ACElement);
		        item.isCollection = true;
				item.type = 'bundle-commands';
				item.properties.label = commandGroup.name.encodeMarkup();
				item.properties.path = commandGroup.path + '/' + commandGroup.filename;
				item.properties.bundleId = bundle_id;
		        item.setState(item.STATE_COLLAPSED | item.STATE_WILL_LOAD);
		        acElem.appendChild(item);
				index++;
			}
		}
		if (0 == index && null != s_item)
		{
			s_item.parentElement.removeChild(s_item);
		}
	    callbackOnSuccess();
	});	
}




/*  ---------------------------------------------------------------- 
	amy.BundleEditorTreeModel < ac.TreeWidgetModel
*/

$class('amy.BundleEditorTreeModel < ac.TreeWidgetModel');

amy.BundleEditorTreeModel.prototype.loadElements = function(acElem, callbackOnSuccess, callbackOnError)
{
    switch ( acElem.type )
    {
        case 'bundle':
        {
            var bundle_id = acElem.properties.bundle.id;
            client.model.initializeBundle(bundle_id, function(result)
            {
                if ( !result )
                {
                    return;
                }
                // keymap
                var keymap_source = client.model.bundles[bundle_id].keymapSource;
                var child_elem = $new(ACElement);
                child_elem.isCollection = false;
                child_elem.type = 'keymap';
                child_elem.properties.source = keymap_source;
                child_elem.properties.label = $loc('keymap');
                acElem.appendChild(child_elem);

                // languages
                var languages = client.model.bundles[bundle_id].languages;
                var language_id = null;
                for ( var i in languages )
                {
                    language_id = languages[i];
                    var language = client.model.languages[language_id];
                    child_elem = $new(ACElement);
                    child_elem.isCollection = false;
                    child_elem.type = 'language';
                    child_elem.properties.language = language;
                    child_elem.properties.language_id = language_id;
                    child_elem.properties.label = language.info.name;
                    acElem.appendChild(child_elem);
                }
                
                // snippets
                var snippets = client.model.listSnippetsByLanguage(language_id);
                for ( i in snippets )
                {
                    var snippet = snippets[i];
//                    console.log(snippet);
                    var child_elem = $new(ACElement);
                    child_elem.isCollection = false;
                    child_elem.type = 'snippet';
                    child_elem.properties.snippet = snippet;
                    child_elem.properties.bundleId = bundle_id;
                    child_elem.properties.label = snippet.name;
                    acElem.appendChild(child_elem);
                }
                // commands
                var commands = client.model.listCommandsByLanguage(language_id);
                for ( i in commands )
                {
                    var command = commands[i];
//                    console.log(command);
                    var child_elem = $new(ACElement);
                    child_elem.isCollection = false;
                    child_elem.type = 'command';
                    child_elem.properties.command = command;
                    child_elem.properties.bundleId = bundle_id;
                    child_elem.properties.label = command.name;
                    acElem.appendChild(child_elem);
                }
                
                callbackOnSuccess();
            });
        };break;
        default: // root
        {
            var bundles = client.model.listBundles();
            $foreach ( bundles, function(bundle)
            {
                var child_elem = $new(ACElement);
                child_elem.isCollection = true;
                child_elem.type = 'bundle';
                child_elem.setState(child_elem.STATE_COLLAPSED | child_elem.STATE_WILL_LOAD);
                child_elem.properties.bundle = bundle;
                child_elem.properties.label = bundle.name;
                acElem.appendChild(child_elem);
            })
            callbackOnSuccess();
        }
    }
}
