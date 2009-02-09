
var buffer = '';
var tests = [];

function initTest(index)
{
	index = index || 0;
	var test = tests[index];
	if ( !test.keepPrevious )
	{
		$('test-area').v(false);
		$('test-area').t(buffer);
	}
	$comboset($('combo-tests'), index);
	$('title').t('?/? ?'.embed(parseInt(index)+1, tests.length, test.title));
	$('note').t(test.note);
	var code = ''+test.code;
	$('code').t((code.substring(code.indexOf('{')+1,code.lastIndexOf('}'))).encodeMarkup());

}

function runTest(index)
{
	if ( !tests[index].keepPrevious )
	{
		$('test-area').t(buffer);
		$('test-area').v(true);
	}
	tests[index].code();
}

function main()
{
	// filling up combo options values
	$combofill( $('combo-tests'), function(index)
	{
		return (tests.length == index ? false : [index, tests[index].title]);
	});
	// saving state of the initial test-area
	$('test-area').v(false);
	buffer = $('test-area').t();

	var getTestIndex = function()
	{
		return parseInt($comboget($('combo-tests')));
	};
	var changeTest = function(offset)
	{
		var index = getTestIndex() + offset;
		if ( tests.length > index && 0 <= index )
		{
			initTest(index);
		}
	}

	$('button-run').e('click', function(evt)
	{
		runTest(getTestIndex());
	})
	$('button-next').e('click', function(evt)
	{
		changeTest(1);
	})
	$('button-prev').e('click', function(evt)
	{
		changeTest(-1);
	})

	initTest(0);			
}
