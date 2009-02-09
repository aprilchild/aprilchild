/*
 * AC Fry - JavaScript Framework v1.0
 *
 * ac.Chap - Text Editing Component widget - Standalone settings file
 *
 * (c)2006 Petr Krontorad, April-Child.com
 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
 * http://www.april-child.com. All rights reserved.
 * See the license/license.txt for additional details regarding the license.
 * Special thanks to Matt Groening and David X. Cohen for all the robots.
 * NOTE: snippets code initialization/parsing/running *IS* hard wizardry code. 
 */


ac.chap.KeyMap.prototype.initDefinition = function()
{
	this.isMac = /intosh/.test(navigator.appVersion);
	var _ = '\n';

	this.compile
	(
		"# default"
	+_+	"KEY: 0"
	+_+	"	insert(character:true)"
	
	+_+	"# arrow left"
	+_+	"KEY: -37"
	+_+	"	caret(move:'left')"
	+_+	"KEY: -37+shift"
	+_+	"	caret(move:'left')"
	+_+	"	selection(add:true)"
	+_+	"KEY: -37+ctrl"
	+_+	"	caret(move:'prev_regexp', re:'[^|._A-Z ]*$')"
	+_+	"KEY: -37+alt"
	+_+	"	caret(move:'prev_word')"
	+_+	"KEY: -37+ctrl+shift"
	+_+	"	caret(move:'prev_word')"
	+_+	"	selection(add:true)"
	+_+	"KEY: -37+alt+shift"
	+_+	"	caret(move:'prev_word')"
	+_+	"	selection(add:true)"
	+_+	"KEY: -37+meta"
	+_+	"	caret(move:'row_start')"
	+_+	"KEY: -37+meta+shift"
	+_+	"	caret(move:'row_start')"
	+_+	"	selection(add:true)"
	
	+_+	"# arrow right"
	+_+	"KEY: -39"
	+_+	"	caret(move:'right')"
	+_+	"KEY: -39+shift"
	+_+	"	caret(move:'right')"
	+_+	"	selection(add:true)"
	+_+	"KEY: -39+ctrl"
	+_+	"	caret(move:'next_regexp', re:'^[^|._A-Z ]*')"
	+_+	"KEY: -39+alt"
	+_+	"	caret(move:'next_word')"
	+_+	"KEY: -39+ctrl+shift"
	+_+	"	caret(move:'next_word')"
	+_+	"	selection(add:true)"
	+_+	"KEY: -39+alt+shift"
	+_+	"	caret(move:'next_word')"
	+_+	"	selection(add:true)"
	+_+	"KEY: -39+meta"
	+_+	"	caret(move:'row_end')"
	+_+	"KEY: -39+meta+shift"
	+_+	"	caret(move:'row_end')"
	+_+	"	selection(add:true)"
	
	+_+	"# arrow up"
	+_+	"KEY: -38"
	+_+	"	caret(move:'up')"
	+_+	"KEY: -38+shift"
	+_+	"	caret(move:'up')"
	+_+	"	selection(add:true)"
	
	+_+	"# arrow down"
	+_+	"KEY: -40"
	+_+	"	caret(move:'down')"
	+_+	"KEY: -40+shift"
	+_+	"	caret(move:'down')"
	+_+	"	selection(add:true)"
	
	
	);	
	
	if ( this.isMac )
	{
		this.compile
		(
				"# home"
			+_+	"KEY: -36"
			+_+	"	caret(move:'doc_start')"
			+_+	"KEY: -36+shift"
			+_+	"	caret(move:'doc_start')"
			+_+	"	selection(add:true)"
			
			+_+"# end"
			+_+	"KEY: -35"
			+_+	"	caret(move:'doc_end')"
			+_+	"KEY: -35+shift"
			+_+	"	caret(move:'doc_end')"
			+_+	"	selection(add:true)"
			
			+_+"# meta + c"
			+_+	"KEY: 99+meta"
			+_+	"	clipboard(copy:true)"
			
			+_+"# meta + x"
			+_+	"KEY: 120+meta"
			+_+	"	clipboard(cut:true)"
			
			+_+"# meta + z"
			+_+	"KEY: 122+meta"
			+_+	"	undo()"
			
			+_+"# meta + shift + z"
			+_+	"KEY: 122+meta+shift"
			+_+	"	redo()"
			
			+_+"# meta + a"
			+_+	"KEY: 97+meta"
			+_+	"	selection(all:true)"
			
			+_+"# ctrl + a"
			+_+	"KEY: 97+ctrl"
			+_+	"	selection(all:true)"

			+_+"# meta + ["
			+_+	"KEY: 91+meta"
			+_+	"	custom(action:'Indent', direction:'left')"

			+_+"# meta + ]"
			+_+	"KEY: 93+meta"
			+_+	"	custom(action:'Indent', direction:'right')"

			+_+"# meta + /"
			+_+	"KEY: 47+meta"
			+_+	"	custom(action:'Comment')"

			+_+"# meta + +"
			+_+	"KEY: 43+meta"
			+_+	"	custom(action:'RuntimeOption', key:'font.size', value:'bigger')"
			
			+_+"# meta + -"
			+_+	"KEY: 45+meta"
			+_+	"	custom(action:'RuntimeOption', key:'font.size', value:'smaller')"

			+_+"# meta + f"
			+_+	"KEY: 102+meta"
			+_+	"	custom(action:'SearchInteractive')"

			+_+"# ctrl + f"
			+_+	"KEY: 102+ctrl"
			+_+	"	custom(action:'SearchInteractive')"

			+_+"# meta + e"
			+_+	"KEY: 101+meta"
			+_+	"	custom(action:'SetSearchKeyword')"

			+_+"# meta + g"
			+_+	"KEY: 103+meta"
			+_+	"	custom(action:'SearchKeyword', direction:'down')"

			+_+"# ctrl + g"
			+_+	"KEY: 103+ctrl"
			+_+	"	custom(action:'SearchKeyword', direction:'down')"

			+_+"# meta + shift + g"
			+_+	"KEY: 71+shift+meta"
			+_+	"	custom(action:'SearchKeyword', direction:'up')"

			+_+"# ctrl + shift + g"
			+_+	"KEY: 71+shift+ctrl"
			+_+	"	custom(action:'SearchKeyword', direction:'up')"
			
			
		);
		
	}
	else
	{
		this.compile
		(
				"# home"
			+_+	"KEY: -36"
			+_+	"	caret(move:'row_start')"
			+_+	"KEY: -36+shift"
			+_+	"	caret(move:'row_start')"
			+_+	"	selection(add:true)"
			
			+_+"# end"
			+_+	"KEY: -35"
			+_+	"	caret(move:'row_end')"
			+_+	"KEY: -35+shift"
			+_+	"	caret(move:'row_end')"
			+_+	"	selection(add:true)"
			
			+_+"# ctrl + c"
			+_+	"KEY: 99+ctrl"
			+_+	"	clipboard(copy:true)"
			
			+_+"# ctrl + x"
			+_+	"KEY: 120+ctrl"
			+_+	"	clipboard(cut:true)"
			
			+_+"# ctrl + z"
			+_+	"KEY: 122+ctrl"
			+_+	"	undo()"
			
			+_+"# ctrl + shift + z"
			+_+	"KEY: 122+ctrl+shift"
			+_+	"	redo()"

			+_+"# ctrl + a"
			+_+	"KEY: 97+ctrl"
			+_+	"	selection(all:true)"
			
			+_+"# ctrl + ["
			+_+	"KEY: 91+ctrl"
			+_+	"	custom(action:'Indent', direction:'left')"

			+_+"# ctrl + [  - for IE"
			+_+	"KEY: 27+ctrl"
			+_+	"	custom(action:'Indent', direction:'left')"

			+_+"# ctrl + ]"
			+_+	"KEY: 93+ctrl"
			+_+	"	custom(action:'Indent', direction:'right')"

			+_+"# ctrl + ]  - for IE"
			+_+	"KEY: 29+ctrl"
			+_+	"	custom(action:'Indent', direction:'right')"

			+_+"# ctrl + /"
			+_+	"KEY: 47+ctrl"
			+_+	"	custom(action:'Comment')"

			+_+"# ctrl + +"
			+_+	"KEY: 43+ctrl"
			+_+	"	custom(action:'RuntimeOption', key:'font.size', value:'bigger')"
			
			+_+"# ctrl + -"
			+_+	"KEY: 45+ctrl"
			+_+	"	custom(action:'RuntimeOption', key:'font.size', value:'smaller')"
			
			+_+"# ctrl + e"
			+_+	"KEY: 101+ctrl"
			+_+	"	custom(action:'SetSearchKeyword')"

			+_+"# ctrl + u  - for IE"
			+_+	"KEY: 21+ctrl"
			+_+	"	custom(action:'SetSearchKeyword')"

			+_+"# ctrl + g"
			+_+	"KEY: 103+ctrl"
			+_+	"	custom(action:'SearchKeyword', direction:'down')"

			+_+"# ctrl + g  - for IE"
			+_+	"KEY: 7+ctrl"
			+_+	"	custom(action:'SearchKeyword', direction:'down')"

			+_+"# ctrl + shift + g"
			+_+	"KEY: 71+shift+ctrl"
			+_+	"	custom(action:'SearchKeyword', direction:'up')"

			+_+"# ctrl + shift + g  - for IE"
			+_+	"KEY: 7+shift+ctrl"
			+_+	"	custom(action:'SearchKeyword', direction:'up')"
			
			+_+"# ctrl + f"
			+_+	"KEY: 102+ctrl"
			+_+	"	custom(action:'SearchInteractive')"
			
			
		);
	}
	
	this.compile
	(
		"# ctrl+shit+k"
	+_+	"KEY: 75+ctrl+shift"
	+_+	"	delete(row:true)"
	);
	
	this.compile
	(
		"# enter"
	+_+	"KEY: -13"
	+_+	"	custom(action:'SmartIndent', split_line:true, indent_tab_when_ends:'{')"

	+_+ "# meta + enter"
	+_+	"KEY: -13+meta"
	+_+	"	custom(action:'SmartIndent', split_line:false, indent_tab_when_ends:'{')"

	+_+ "# ctrl + enter"
	+_+	"KEY: -13+alt"
	+_+	"	custom(action:'SmartIndent', split_line:false, indent_tab_when_starts:'if def class do')"

	+_+ "# d"
	+_+	"KEY: 100"
	+_+	"	custom(action:'SmartUnindent', match_from:'start', starts_with:'def if while class', ends_with:'end end end end')"


	+_+ "# meta + shift + enter"
	+_+	"KEY: -13+meta+shift"
	+_+	"	custom(action:'SmartIndent', split_line:false, set_char_at_end:';', indent_tab_when_ends:'{')"

	+_+ "# }"
	+_+	"KEY: 125"
	+_+	"	custom(action:'SmartUnindent', match_from:'end', starts_with:'{', ends_with:'}')"

	+_+ "# {"
	+_+	"KEY: 123"
	+_+	"	custom(action:'AutoComplete', use_selection:true, text:'}')"

	+_+ "# '"
	+_+	"KEY: 39"
	+_+	"	custom(action:'AutoComplete', use_selection:true, text:'\\'')"
	
	+_+ "# \""
	+_+	"KEY: 34"
	+_+	"	custom(action:'AutoComplete', use_selection:true, text:'\"')"
	
	+_+ "# ["
	+_+	"KEY: 91"
	+_+	"	custom(action:'AutoComplete', use_selection:true, text:']')"
	
	+_+ "# ("
	+_+	"KEY: 40"
	+_+	"	custom(action:'AutoComplete', use_selection:true, text:')')"
	
	
	
	+_+	"# delete"
	+_+	"KEY: -8"
	+_+	"	delete(character:true)"

	+_+	"# backspace"
	+_+	"KEY: -46"
	+_+	"	delete(character:false)"

	+_+	"# escape"
	+_+	"KEY: -27"
	+_+	"	custom(action:'WordComplete', direction:true)"
	+_+	"KEY: -27+shift"
	+_+	"	custom(action:'WordComplete', direction:false)"

	+_+	"# tab"
	+_+	"KEY: -9"
	+_+	"	custom(action:'SnippetComplete')"

	+_+	"# shift + enter"
	+_+	"KEY: -13+shift"
	+_+	"	custom(action:'SnippetComplete')"

	+_+	"# F2"
	+_+	"KEY: -113"
	+_+	"	custom(action:'GoToBookmark', direction:1)"

	+_+	"# F2 shift"
	+_+	"KEY: -113+shift"
	+_+	"	custom(action:'GoToBookmark', direction:-1)"

	+_+	"# F2 + meta"
	+_+	"KEY: -113+meta"
	+_+	"	custom(action:'ToggleBookmark')"

	
	);
}


$class('ac.chap.theme.SlushAndPoppies < ac.chap.Theme');

ac.chap.theme.SlushAndPoppies.prototype.initDefinition = function()
{
	$call(this, 'ac.chap.Theme.initDefinition');
	this.cssId = 'slush-poppies';
	this.background = '#f1f1f1';
	this.caretRowStyleActive = '#E6E6ED';
	this.selectionStyle = '#b2b0ff';
	this.colorScheme[ac.chap.TOKEN_MULTIROW_COMMENT] = 'color:#888';
	this.colorScheme[ac.chap.TOKEN_SINGLEROW_COMMENT] = 'color:#888';
	this.colorScheme[ac.chap.TOKEN_SINGLE_QUOTED] = 'color:#a00';
	this.colorScheme[ac.chap.TOKEN_DOUBLE_QUOTED] = 'color:#a00';
	this.colorScheme[ac.chap.CHUNK_KEYWORD] = 'color:#00a';
	this.colorScheme[ac.chap.CHUNK_NUMBER] = 'color:teal';
	this.colorScheme[ac.chap.CHUNK_OPERATOR] = 'color:#3D5DAA;';
	this.colorScheme[ac.chap.CHUNK_PARENTHESIS] = 'font-weight:bold';
	this.colorScheme[ac.chap.CHUNK_KEYWORD_CUSTOM] = 'color:#880';
	this.colorScheme[ac.chap.CHUNK_FUNCTION_NAME] = 'color:#622';
	this.colorScheme[ac.chap.CHUNK_LIBRARY] = 'color:#08f';
	this.colorScheme[ac.chap.CHUNK_LIBRARY_CUSTOM] = 'color:#CC581D';
}


$class('ac.chap.theme.Black < ac.chap.Theme');

ac.chap.theme.Black.prototype.initDefinition = function()
{
	$call(this, 'ac.chap.Theme.initDefinition');
	this.cssId = 'black';
	this.background = '#222';
	this.textColor = '#fff';
	this.caretRowStyleActive = '#444';
	this.caretColor = '#fff';
	this.selectionStyle = '#283a76';
	this.colorScheme[ac.chap.TOKEN_MULTIROW_COMMENT] = 'color:#888';
	this.colorScheme[ac.chap.TOKEN_SINGLEROW_COMMENT] = 'color:#888';
	this.colorScheme[ac.chap.TOKEN_SINGLE_QUOTED] = 'color:#f00';
	this.colorScheme[ac.chap.TOKEN_DOUBLE_QUOTED] = 'color:#f00';
	this.colorScheme[ac.chap.CHUNK_KEYWORD] = 'color:#66f';
	this.colorScheme[ac.chap.CHUNK_NUMBER] = 'color:#ff0';
	this.colorScheme[ac.chap.CHUNK_OPERATOR] = 'color:#7FC7EC;';
	this.colorScheme[ac.chap.CHUNK_PARENTHESIS] = 'font-weight:bold';
	this.colorScheme[ac.chap.CHUNK_KEYWORD_CUSTOM] = 'color:#C9C900';
	this.colorScheme[ac.chap.CHUNK_FUNCTION_NAME] = 'color:#DD3D2A';
	this.colorScheme[ac.chap.CHUNK_LIBRARY] = 'color:#08f';
	this.colorScheme[ac.chap.CHUNK_LIBRARY_CUSTOM] = 'color:#CC581D';
}


$class('ac.chap.theme.Cobalt < ac.chap.Theme');

ac.chap.theme.Cobalt.prototype.initDefinition = function()
{
	$call(this, 'ac.chap.Theme.initDefinition');
	this.cssId = 'black';
	this.background = '#072240';
	this.textColor = '#DFEFFF';
	this.caretRowStyleActive = '#041629';
	this.selectionStyle = '#86553b';
	this.caretColor = 'lime';
	this.colorScheme[ac.chap.TOKEN_MULTIROW_COMMENT] = 'color:#0084FF;font-style:italic';
	this.colorScheme[ac.chap.TOKEN_SINGLEROW_COMMENT] = 'color:#0084FF;font-style:italic';
	this.colorScheme[ac.chap.TOKEN_SINGLE_QUOTED] = 'color:#00DF00';
	this.colorScheme[ac.chap.TOKEN_DOUBLE_QUOTED] = 'color:#00DF00';
	this.colorScheme[ac.chap.CHUNK_KEYWORD] = 'color:#FF9D00';
	this.colorScheme[ac.chap.CHUNK_NUMBER] = 'color:#FF5B8C';
	this.colorScheme[ac.chap.CHUNK_OPERATOR] = 'color:#FF9D00;';
	this.colorScheme[ac.chap.CHUNK_PARENTHESIS] = 'color:#FFF177';
	this.colorScheme[ac.chap.CHUNK_KEYWORD_CUSTOM] = 'color:#54FFB8';
	this.colorScheme[ac.chap.CHUNK_FUNCTION_NAME] = 'color:#FFE000';
	this.colorScheme[ac.chap.CHUNK_LIBRARY] = 'color:#71E5B6';
	this.colorScheme[ac.chap.CHUNK_LIBRARY_CUSTOM] = 'color:#FF78E5';
}


$class('ac.chap.lang.Ruby < ac.chap.Language');

ac.chap.lang.Ruby.prototype.initDefinition = function()
{
	$call(this, 'ac.chap.Language.initDefinition');
	this.foldingStartMarkers = [/^\s*def/i, /^\s*if/i];
	this.foldingParityMarkers = [/do|(^\s*if)|(^\s*def)/i, /do|(^\s*if)/i];
	this.foldingStopMarkers = [/^\s*end/i, /^\s*end/i];
	this.singleRowCommentStartMarkers = ['#'];
	this.chunkRules.push([
		/(([^\w]|^)(BEGIN|begin|case|class|def|do|else|elsif|END|end|ensure|for|if|in|module|rescue|then|unless|until|when|while)([^\w]|$))/i,
		3,
		ac.chap.CHUNK_KEYWORD
	]);
	this.chunkRules.push([
		/(([^\w]|^)(@[\w]*|and|not|or|alias|alias_method|break|next|redo|retry|return|super|undef|yield)([^\w]|$))/i,
		3,
		ac.chap.CHUNK_KEYWORD_CUSTOM
	]);
	this.chunkRules.push([
		/((def[ ]{1,})([\w]{1,}))/i, 
		3, 
		ac.chap.CHUNK_FUNCTION_NAME
	]);
	this.chunkRules.push([
		/(([^\w]|^)(ApplicationController|AplicationModel|ACBackendController)([^\w]|$))/i, 
		3, 
		ac.chap.CHUNK_LIBRARY
	]);
	this.wordDelimiter = /[\w\d]/;
	this.indentIgnoreMarker = /[\t \s]/;
	this.stringInterpolation = ['(#\{[^\}]*\})', 1];
}

$class('ac.chap.lang.JavaScript < ac.chap.Language');

ac.chap.lang.JavaScript.prototype.initDefinition = function()
{
	$call(this, 'ac.chap.Language.initDefinition');
	this.foldingStartMarkers = [/^.*\bfunction\s*(\w+\s*)?\([^\)]*\)(\s*\{[^\}]*)?\s*$/i];
	this.foldingParityMarkers = [/\{[^\'\"]*$/i];
	this.foldingStopMarkers = [/[^\'\"]*\}/i];
	this.singleRowCommentStartMarkers = ['//'];
	this.multiRowCommentStartMarker = '/*';
	this.multiRowCommentEndMarker = '*/';
	this.chunkRules.push([
		/(([^\w]|^)(break|case|catch|continue|default|do|else|finally|for|goto|if|in|with|import|package|return|switch|throw|try|while)([^\w]|$))/i,
		3,
		ac.chap.CHUNK_KEYWORD
	]);
	this.chunkRules.push([
		/(([^\w]|^)(function|var|prototype|this|instanceof)([^\w]|$))/i,
		3,
		ac.chap.CHUNK_KEYWORD_CUSTOM
	]);
	this.chunkRules.push([
		/((prototype\.|function[ ]{1,})([\w]{1,}))/i, 
		3, 
		ac.chap.CHUNK_FUNCTION_NAME
	]);
	this.chunkRules.push([
		/(([^\w]|^)(document|window|self|top|event|documentElement|write|close|open|status|alert|submit|prompt|console)([^\w]|$))/i, 
		3, 
		ac.chap.CHUNK_LIBRARY
	]);
	this.chunkRules.push([
		/(([^\w]|^)(\$class|\$new|\$delete|\$rpost|\$upload|\$combofill|\$comboget|\$comboset|\$call|\$loc|\$runafter|\$runinterval|\$foreach|\$dotimes|\$isset|\$notset|\$getdef|construct|destruct|\$)([^\w]|$))/i, 
		3, 
		ac.chap.CHUNK_LIBRARY_CUSTOM
	]);
	this.wordDelimiter = /[\w\d]/;
	this.indentIgnoreMarker = /[\t ]/;
	this.stringInterpolation = ['(({|)\\$[\\w{]+(}|))', 1]
}


$class('ac.chap.lang.Markup < ac.chap.Language');

ac.chap.lang.Markup.prototype.initDefinition = function()
{
	$call(this, 'ac.chap.Language.initDefinition');
	this.foldingStartMarkers = [];
	this.foldingParityMarkers = [];
	this.foldingStopMarkers = [];
	this.singleRowCommentStartMarkers = [];
	this.multiRowCommentStartMarker = '<!--';
	this.multiRowCommentEndMarker = '-->';
	this.chunkRules.push([
		/((<|<\/)([\w-_\:]*)([ >]))/i,
		3,
		ac.chap.CHUNK_KEYWORD
	]);
	this.chunkRules.push([
		/(([ \t])([\w-_\:]*)(=$))/i,
		3,
		ac.chap.CHUNK_KEYWORD_CUSTOM
	]);
	this.chunkRules.push([
		/(([^\w]|^)(!DOCTYPE)([^\w]|$))/i, 
		3, 
		ac.chap.CHUNK_LIBRARY
	]);
}


function get_snippets()
{
	var _ = "\n";
	return [
		{
			tab_activation:'',
			name:'default snippet for selection',
			code:'function ${1:$CHAP_SELECTED_TEXT}(${2:args})\n{\n\t$3\n}\n$0'
		},
		{
			key_activation:'59+ctrl',
			tab_activation:'both',
			name:'test key activation tabstops 1',
			code:'function $1($2)\n{\n\t$3\n}\n$0'
		},
		{
			tab_activation:'a',
			name:'test tabstops 1',
			code:'function $1($2)\n{\n\t$3\n}\n$0'
		},
		{
			tab_activation:'a2',
			name:'test tabstops 1',
			code:'def $1\n\t$0\nend'
		},
		{
			tab_activation:'b',
			name:'test tabstops 2 - escaped chars',
			code:'function $1(\\$params = array())\n{\n\t$0\n}\n'
		},
		{
			tab_activation:'c',
			name:'test tabstops 3 - empty',
			code:'None you should see caret here:>'
		},
		{
			tab_activation:'d',
			name:'test variables 1',
			code:'#(NEXT_WORD)$CHAP_NEXT_WORD(/NEXTWORD) #(PREV_WORD)$CHAP_PREV_WORD(/PREV_WORD) :CLIPBOARD => $CHAP_CLIPBOARD_TEXT :SELECTION => $CHAP_SELECTED_TEXT tab>$0<stop#'
		},		
		{
			tab_activation:'d2',
			name:'test variables 2 - CHAP_WORD variations',
			code:'[PREV-2]:$CHAP_WORD-2 [NEXT+4]$CHAP_WORD+4'
		},		
		{
			tab_activation:'d2e',
			name:'test variables 2 - escape',
			code:'[ESCAPED PREV-2]:$$CHAP_WORD-2'
		},		
		{
			tab_activation:'d3',
			name:'test variables 3 - reverse',
			code:'Words swapped: *$CHAP_WORD+1* for *$CHAP_WORD-2* '
		},		
		{
			tab_activation:'d4',
			name:'test variables 3 - default values',
			code:'Testing default values: $CHAP_PREV_WORD => ${CHAP_SELECTED_TEXT:no ...} => ${CHAP_SELECTED_TEXT:$CHAP_WORD-2}'
		},
		{
			tab_activation:'d4e',
			key_activation:'39+ctrl', // KEY '
			name:'test variables 3 - default values escape',
			code:' ! SELECTED text or previous word if not selected: >$${CHAP_SELECTED_TEXT:$CHAP_WORD-1}< ! '
		},		
		{
			tab_activation:'d5',
			name:'test variables 3 - regular transformations values',
			code:' ! replace <a> with <A> >$CHAP_WORD-2< => >${CHAP_WORD-2/a/A/g}< ! '
		},
		{
			tab_activation:'d4e',
			key_activation:'46+ctrl', // KEY .
			name:'test variables 4 - regular transformations values escaped',
			code:' ! replace <a> with <A> >$CHAP_SELECTED_TEXT< => >$${CHAP_SELECTED_TEXT/a/A/g}< ! '
		},		
		{
			tab_activation:'d6',
			name:'test variables 4 - custom transformations values',
			code:'$CHAP_WORD-2 => ${CHAP_WORD-2|.toUpperCase()}'	// will invoke str.toUpperCase()
		},
		{
			tab_activation:'d7',
			name:'test variables 5 - custom transformations',
			code:'$CHAP_WORD-2 => ${CHAP_WORD-2|test}' // will invoke this.snippetTransform_test(str, component) method
		},
		{
			tab_activation:'e',
			name:'test placeholders 1',
			code:'<textarea name="${1:Name}" rows="${2:8}" cols="${3:40}">$0</textarea>'
		},
		{
			tab_activation:'e2',
			name:'test placeholders 1/2',
			code:'<textarea name="${1:\\$Na\\$me}" rows="${2:\\$8}" cols="${3:40}">$0\\$</textarea>'
		},
		{
			tab_activation:'f',
			name:'test placeholders 2 - nested',
			code:'<div${1: id="${2:some_id}"}>\n\t$0\n</div>'
		},
		{
			tab_activation:'g',
			name:'test mirror 1',
			code:'<{${1:}}>$0</{$1}>'
		},
		{
			tab_activation:'h',
			name:'test mirror 2 - default value',
			code:'<{${1:tag name}}>$0</{$1}>'
		},
		{
			tab_activation:'i',
			name:'test mirror 3 - mirrored before (unsupported)',
			code:'<{$1}>$0</{${1:tag_name}}>'
		},
		{
			tab_activation:'x1',
			name:'test bacticks/execution 1 - client-side',
			code:'result: `/local/javascript'
			+_+	"	alert('yep');"		
			+_+ "`"
		},
		{
			tab_activation:'x2',
			name:'test bacticks/execution 2 - client-side',
			code:'result: `/local/javascript'
			+_+	"	output = new Date();"	
			+_+ "`"
		},
		{
			tab_activation:'x3',
			name:'test bacticks/execution 3 - server-side',
			code:'result: `/remote/post'
			+_+	"	action = 'reverse_string';"
			+_+	"	params.str = '$$CHAP_WORD-2';" // we better escape variable, this way it can contain any character and will fit nicely into code
			+_+ "`"
		},
		{
			tab_activation:'x4',
			name:'test bacticks/execution 4 - more complex server-side',
			code:'<{${1:`/remote/post'
			+_+	"	action = 'reverse_string';"
			+_+	"	params.str = '$$CHAP_WORD-2';" // we better escape variable, this way it can contain any character and will fit nicely into code
			+_+ "`}}>$0</{$1}>"
		},
		{
			tab_activation:'x5',
			name:'test bacticks/execution 5 - multiple remote backsticks',
			code:'<{${1:`/remote/post'
			+_+	"	action = 'reverse_string';"
			+_+	"	params.str = '$$CHAP_WORD-2';" 
			+_+ "`}}>`/remote/post"
			+_+	"	action = 'reverse_string';"
			+_+	"	params.str = '$$CHAP_WORD-3';" // we better escape variable, this way it can contain any character and will fit nicely into code
			+_+ "`$0</{$1}>"
		},
		{
			tab_activation:'x6',
			name:'test bacticks/execution 6 - combining local and remote backsticks',
			code:'<{${1:`/remote/post'
			+_+	"	action = 'reverse_string';"
			+_+	"	params.str = '$$CHAP_WORD-2';" 
			+_+ "`}}>`/remote/post"
			+_+	"	action = 'reverse_string';"
			+_+	"	params.str = '$$CHAP_WORD-3';" // we better escape variable, this way it can contain any character and will fit nicely into code
			+_+ "`$0</{$1}> Documents has `/local/javascript"
			+_+ "	output = component.char_map.length; ` rows."
		},
		{
			tab_activation:'def',
			name:'ruby def',
			code:'def ${1:method}'
			+_+ "\t$0"
			+_+ "end"
		}
		
	];	
}

if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}

