$class('ExampleController < ac.TabPaneWidgetController');

// following method is called when tabpane is rendering certain tab content
ExampleController.prototype.onOpen = function(pane, index, node)
{
	node.h(480).w(node.w()).s('margin:0');

	var h_view = node.h() / num_views;
	for ( var i=0; i<num_views; i++ )
	{
		node.a($$()).i('view-?-?'.embed(index, i+1)).h(h_view).s('width:auto');
	}
	var language = ac.chap.Language;
	language = ac.chap.lang.JavaScript;
	var theme = ac.chap.Theme;
	theme = ac.chap.theme.SlushAndPoppies;
	var keymap = ac.chap.KeyMap;

	var chap = $new(ac.chap.Window, {language:language, keymap:keymap});
	for ( i=0; i<num_views; i++ )
	{
		chap.addView($('view-?-?'.embed(index, i+1)), {theme:theme, wordWrap:0==i%2, tabelator:'    '});
	}
	chap.show();

	client.conf.fry.backendURL = pane.source;

	$rpost(
		{a:'get'}
		,
		function(src)
		{
			chap.edit(src);
		},
		function(e)
		{
			alert('Error loading: ? (?).'.embed(pane.source, e));
		}
	)
}


$class('ExampleView < ac.TabPaneWidgetView');


ExampleView.prototype.renderTitle = function(pane, index, node)
{
	node.t('?'.embed(pane.label));
}


if ( 'undefined' != typeof fry && 'undefined' != typeof fry.script )
{
	fry.script.register();
}