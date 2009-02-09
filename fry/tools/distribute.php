 <?php

	function traverseDir($path)
	{
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
						if ( !$_REQUEST['clean'] && '.js' == substr($f,-3) && 0 != strncmp('dist.', $f, 5) && 0 != strncmp('obf.', $f, 4) )
						{
							echo "<p>Shrinking <strong>$f</strong> at <small>$path</small><br/>";
							
							$source = file_get_contents($full_path);
							$size = strlen($source);
							
							$new_source = shrinkSource($source);
							$new_size = strlen($new_source);
							
							$new_path = $path.'/dist.'.$f;
							file_put_contents($new_path, $new_source);
							chmod($new_path, 0777);
							
							echo 'Original size: <strong>'.$size.'</strong>, new size: <strong>'.$new_size.'</strong>. Shrinked to <strong>'.(100*$new_size/$size).'%</strong> of the original.';
							
							$obf_source = obfuscateSource($new_source);
							$obf_size = strlen($obf_source);

							$obf_path = $path.'/obf.'.$f;
							file_put_contents($obf_path, $obf_source);
							chmod($obf_path, 0777);
							
							echo '<br>Obfuscated size: <strong>'.$obf_size.'</strong>. Shrinked to <strong>'.(100*$obf_size/$size).'%</strong> of the original.';
							echo '</p>';
//							die();
						}
						else if ( $_REQUEST['clean'] && '.js' == substr($f,-3) && (0 == strncmp('dist.', $f, 5) || 0 == strncmp('obf.', $f, 4)) )
						{
							// cleaning
							echo "<p>Cleaning <strong>$f</strong> at <small>$path</small></p>";
							unlink($full_path);
						}
					}
				}
			}
			closedir($d);
		}
	}

	function shrinkSource($source)
	{
		$new_source = '';
		$inside_sq = false;
		$inside_dq = false;
		$n = strlen($source);
		$i = 0;
		while ( $i<$n )
		{
			$ch = $source{$i};
			if ( "'" == $ch )
			{
				if ( !$inside_dq )
				{
					if ( $inside_sq )
					{
						if ( '\\' != $source{$i-1} )
						{
							$inside_sq = false;
						}
					}
					else
					{
						$inside_sq = true;
					}
				}
			}
			else if ( '"' == $ch )
			{
				if ( !$inside_sq )
				{
					if ( $inside_dq )
					{
						if ( '\\' != $source{$i-1} )
						{
							$inside_dq = false;
						}
					}
					else
					{
						$inside_dq = true;
					}
				}
			}
			else if ( '/' == $ch )
			{
				if ( !$inside_sq && !$inside_dq )
				{
					if ( '*' == $source{$i+1} )
					{
						$i++;
						while ( $i<$n )
						{
							if ( '*/' == substr($source, $i++, 2) )
							{
								$i++;
								break;
							}
						}
						continue;
					}
					else if ( '/' == $source{$i+1} )
					{
						$ix = strpos(substr($source, $i+2), "\n");
						if ( false === $ix )
						{
							break;
						}
						$i+= $ix+2;
						continue;
					}
				}
			}
			$i++;
			if ( !$inside_sq && !$inside_dq )
			{
				if ( "\t" == $ch )
				{
					continue;
				}
				else if ( "\n" == $ch )
				{
					if ( preg_match('/[;\\{\\n]/', $source{$i-2}) )
					{
						continue;
					}
				}
				else if ( " " == $ch )
				{
					if ( !preg_match('/[a-zA-Z0-9\\$]/', $source{$i-2}) || !preg_match('/[a-zA-Z0-9\\$\']/', $source{$i}) )
					{
						continue;
					}
				}
			}
			$new_source .= $ch;
		}
		return trim($new_source);
	}
	
	function obfuscateSource($source)
	{
		$reserved = array('var', 'function', 'if', 'else', 'while', 'with', 'prototype', 'return', 'null', 'case', 'switch', 'default',
		'Array', 'superclass', 'Math', 'String', 'indexOf', 'length', 'this', 'typeof', 'break', 'continue');
		$words = array();
		$positions = array();
		$new_source;
		$inside_sq = false;
		$inside_dq = false;
		$next_word = '';
		$i = 0;
		$n = strlen($source);
		while ( $i<$n )
		{
			$ch = $source{$i};
			if ( "'" == $ch )
			{
				if ( !$inside_dq )
				{
					if ( $inside_sq )
					{
						if ( '\\' != $source{$i-1} )
						{
							$inside_sq = false;
						}
					}
					else
					{
						$inside_sq = true;
					}
				}
			}
			else if ( '"' == $ch )
			{
				if ( !$inside_sq )
				{
					if ( $inside_dq )
					{
						if ( '\\' != $source{$i-1} )
						{
							$inside_dq = false;
						}
					}
					else
					{
						$inside_dq = true;
					}
				}
			}
			else
			{
				if ( !$inside_sq && !$inside_dq )
				{
					if ( preg_match('/[a-zA-Z0-9_]/', $ch) )
					{
						$next_word .= $ch;
					}
					else
					{
						if ( '' != $next_word && !in_array($next_word, $reserved) )
						{
							// saving word
							if ( !isset($words[$next_word]) )
							{
								$words[$next_word] = 1;
								$positions[$next_word] = array();
							}
							$words[$next_word]++;
							$positions[$next_word][] = $i;
						}
						$next_word = '';
					}
				}
			}
			$i++;
		}
		arsort($words);
		// now the most frequent words are on top
		$conversion = array();
		$vx = 0;
		$vy = -1;
		foreach ( $words as $word=>$num_count )
		{
			if ( is_numeric($word) )
			{
				continue;
			}
			$hash = (-1!=$vy?chr(65+$vy):'').chr(65+$vx);
			$vx++;
			if ( 26 == $vx )
			{
				$vy++;
				$vx = 0;
			}
			if ( strlen($word) > strlen($hash) )
			{
				$conversion[$word] = $hash;
			}
		}
//		print_r($words);
//		print_r($conversion);
		$new_source = $source;
		foreach ( $conversion as $word=>$hash )
		{
			foreach ( $positions[$word] as $i=>$index )
			{
				$new_source = substr($new_source, 0, $index-strlen($word)).str_repeat('~', strlen($word)-strlen($hash)).$hash.substr($new_source, $index);
			}
		}
		return str_replace('~', '', $new_source);
	}

	function createCompactDistro()
	{
		$included = array('ac.fry', 'ac.fry.data', 'ac.fry.xml', 'ac.fry.data.calendar', 'ac.fry.ui', 'ac.fry.ui.support');
		$source = "// --- Automatically generated, do not edit --- \n";
		$dist_source = "// --- Automatically generated, do not edit --- \n";
		$obf_source = "// --- Automatically generated, do not edit --- \n";
		$pattern = '/*--------*/';
		foreach ( $included as $file )
		{
			$path = dirname(__FILE__).'/../'.$file.'.js';
			$f_source = file_get_contents($path);
			if ( (false !== $ix_start = strpos($f_source, $pattern)) && (false !== $ix_end = strrpos($f_source, $pattern)) )
			{
				if ( $ix_start != $ix_end )
				{
					$f_source = substr($f_source, strlen($pattern)+$ix_start, $ix_end-$ix_start-strlen($pattern));
				}
			}
			$sf_source = shrinkSource($f_source);
			$dist_source .= '// ------ compact shrinked distro: '.$file.' ------'."\n\n".$sf_source;
			$obf_source .= '// ------ compact obfuscated distro: '.$file.' ------'."\n\n".obfuscateSource($sf_source);
			$source .= '// ------ compact distro: '.$file.' ------'."\n\n".$f_source;
		}
		$dist_path = dirname(__FILE__).'/../ac.fry.compact.js';
		file_put_contents($dist_path, $source);
		chmod($dist_path, 0777);
		
		echo "<p>Shrinking <strong>$dist_path</strong><br/>";

		$size = strlen($source);

		$new_size = strlen($dist_source);

		$new_path = dirname(__FILE__).'/../dist.ac.fry.compact.js';
		file_put_contents($new_path, $dist_source);
		chmod($new_path, 0777);

		echo 'Original size: <strong>'.$size.'</strong>, new size: <strong>'.$new_size.'</strong>. Shrinked to <strong>'.(100*$new_size/$size).'%</strong> of the original.';

		$obf_size = strlen($obf_source);

		$obf_path = dirname(__FILE__).'/../obf.ac.fry.compact.js';
		file_put_contents($obf_path, $obf_source);
		chmod($obf_path, 0777);

		echo '<br>Obfuscated size: <strong>'.$obf_size.'</strong>. Shrinked to <strong>'.(100*$obf_size/$size).'%</strong> of the original.';
		echo '</p>';
		
		
	}


	traverseDir(dirname(__FILE__).'/../');
	if ( !$_REQUEST['clean'])
	{
	//	createCompactDistro();
		
	}


?>