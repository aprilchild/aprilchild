 <?php

	$doc_dir = dirname(__FILE__).'/../doc/api/';
	$packages = array();
	$classes = array();
	$methods = array();


	function traverseDir($path)
	{
		global $doc_dir;
		if ( false !== opendir($path) )
		{
			$d = opendir($path);
			while ( false !== $f = readdir($d) )
			{
				$full_path = $path.'/'.$f;
				if ( 0 != strncmp($f, '.', 1) )
				{
					if ( is_dir($full_path) )
					{
						traverseDir($full_path);
					}
					else
					{
						if ( '.js' != substr($f, -3) )
						{
							continue;
						}
						if ( false === strpos($full_path, 'widget') )
						{
							if ( 'ac.fry.' != substr($f, 0, 7) )
							{
								continue;
							}
						}
						generateAPI($full_path, $f);
					}
				}
			}
			closedir($d);
		}
	}

	function generateAPI($path, $name)
	{
		global $classes;
		$source = file_get_contents($path);
//		preg_match_all('|(ac\.[^\.]*)\.prototype.([^ ]*)[ = ]*function\(([^\)]*)|', $source, $m);
		preg_match_all('|(.*)\.prototype.([^ ]*)[ = ]*function\(([^\)]*)|', $source, $m);
		for ( $i=0; $i<sizeof($m[1]); $i++ )
		{
			if ( !isset($classes[$m[1][$i]]) )
			{
				$classes[$m[1][$i]] = array();
			}
			if ( !isset($classes[$m[1][$i]][$m[2][$i]]) )
			{
				$classes[$m[1][$i]][$m[2][$i]] = $m[3][$i];
			}
		}
		echo '<pre>';
		print_r($m);
		preg_match_all('/(?U)\$class[\( ]*\'([^\']*)\'/', $source, $m);
		if ( is_array($m[1]) )
		{
			foreach ( $m[1] as $definition )
			{
				$d = explode('<', $definition);
				$class_name = trim($d[0]);
				$classes[$class_name]['_extends'] = array();
				if ( 2 == sizeof($d) )
				{
					// _extends
					$bd = explode(',', $d[1]);
					foreach ( $bd as $b )
					{
						$classes[$class_name]['_extends'][] = trim($b);
					}
				}
			}
		}
		print_r($m);
		die();
	}



	@unlink($doc_dir.'index.html');

	generateAPI(dirname(__FILE__).'/../widget/ac.accordion.js', 'Accordion');
	traverseDir(dirname(__FILE__).'/../');
	traverseDir(dirname(__FILE__).'/../chap/');
	
	$index = array();
	
	foreach ( $classes as $class_name=>$class )
	{
		$class_content = '';
		if ( 0 < sizeof($class['_extends']) )
		{
			$class_content .= '<h3>Extends</h3><ul>';
			foreach ( $class['_extends'] as $base_class )
			{
				$class_content .= '<li><a href="class.'.$base_class.'.html">'.$base_class.'</a></li>';
			}
			$class_content .= '</ul>';
		}
		$class_content .= '<h3>Methods</h3>';
		$class_content .= '<ul>';
		foreach ( $class as $method=>$params )
		{
			if ( '_' == substr($method, 0, 1) )
			{
				continue;
			}
			$class_content .= '<li><span class="method">'.$method.'</span> (<span class="params">'.$params.'</span>)</li>';
		}
		$class_content .= '</ul>';
		$content = '<html><head><title>AC Fry - API - class '.$class_name.'</title><link href="api.css" rel="stylesheet" type="text/css" /></head><body><h1>Class <strong>'.$class_name.'</strong></h1>';
		$content .= '<a href="index.html">Back</a>';
		$content .= $class_content;
		$content .= '</body></html>';
		$class_file = 'class.'.$class_name.'.html';
		file_put_contents($doc_dir.$class_file, $content);
		
		$index[$class_name] = $class_file;
	}

	$content = '<html><head><title>AC Fry - API</title><link href="api.css" rel="stylesheet" type="text/css" /></head><body><h1>AC Fry API</h1><h2>Contents</h2><ul>';
	foreach ( $index as $class_name=>$class_file )
	{
		$content .= '<li><a href="'.$class_file.'">'.$class_name.'</a></li>';
	}
	$content .= '</ul></body></html>';
	
	file_put_contents($doc_dir.'index.html', $content);

	print_r($classes);


?>

<a href="../doc/api/" target="_blank">View API</a>