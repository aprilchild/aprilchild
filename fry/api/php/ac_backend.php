<?php
/*
	 * AC Fry - JavaScript Framework v1.0
	 *
	 * Remote backend implementation - PHP 5+
	 *
	 * (c)2006 Petr Krontorad, April-Child.com
	 * Portions of code based on WHOA Bender Framework, (c)2002-2005 Petr Krontorad, WHOA Group.
	 * http://www.april-child.com. All rights reserved.
	 * See the license/license.txt for additional details regarding the license.
	 * Special thanks to Matt Groening and David X. Cohen for all the robots.
	
	
	To use it, simply extend ACBackend class with your own:
	-------------------------------------------------------	
	include 'your_path_to/ac.backend.php';
	
	class YourBackend extends ACBackend
	{
		public function on_your_action($pars)
		{
			if ( an_error_occured )
			{
				self::raiseError('A message.');
			}
			else
			{
				// $result can be of any type (scalar, array, object, array of arrays ...)
				self::setResult($result);
			}
		}
	}
	
	// now adding execution launcher
	try
	{
		$action = new YourBackend();
		$action->process( $_REQUEST['a'] );
	}
	catch ( Exception $e )
	{
		YourBackend::raiseError( $e->getMessage() );
	}
	
	// and that's it ...
	// for more information, see the test/remote.php source.
	
*/
    error_reporting(E_ALL ^ E_NOTICE);

	ob_start();
	
// ______________ ACBackend class

	abstract class ACBackend
	{
		public static $logger = null;
		public static $endCallback = null;

		private function encode( $o )
		{
			return str_replace('>', '&gt;', str_replace('<', '&lt;', str_replace( '&', '&amp;', $o ) ) );
		}
		
		private static function log($msg)
		{
			if ( is_object(self::$logger) )
			{
				self::$logger->log($msg);
			}
		}
		
		public function process( $command = '', $logger = null, $endCallback = null)
		{
			$command = explode(',', $command);
			$command = $command[0];
			self::$logger = $logger;
			self::$endCallback = $endCallback;
			if ( '' == $command )
			{
				throw new Exception( 'No action command specified.' );
			}
			if ( !method_exists($this, 'on_'.$command) )
			{
				throw new Exception( 'Action command `'.$command.'` not found.' );
			}
			$command = 'on_'.$command;
			$p = array();

			if (get_magic_quotes_gpc())
			{
				$req_vars = array_map('stripslashes', $_REQUEST);
			}
			else
			{
				$req_vars = $_REQUEST;
			}
			
			foreach ( $req_vars as $k=>$v )
			{
				if ( '(a)' == substr($k,-3) )
				{
					// array passed
					$v = explode('],[', substr($v,1,-1));
					$n = sizeof($v);
					for ($i=0; $i<$n; $i++ )
					{
						$v[$i] = str_replace('`§~§[]§~§`', '],[', $v[$i]);
					}
					$p[substr($k,0,-3)] = $v;
				}
				else if ( '(o)' == substr($k,-3) )
				{
					// object passed
					$obj = new stdClass;
					$v = explode('],[', substr($v,1,-1));
					$n = sizeof($v);
					for ($i=0; $i<$n; $i++ )
					{
						$pair = str_replace('`§~§[]§~§`', '],[', $v[$i]);
						if ( false !== $ix = strpos($pair, '=') )
						{
							$prop_name = substr($pair, 0, $ix);
							$obj->$prop_name = substr($pair, $ix+1);
						}
					}
					$p[substr($k,0,-3)] = $obj;
				}
				else
				{
					$p[$k] = $v;
				}
			}
			$this->$command( $p );			
		}
		
		private static function endResponse($logResponse = true)
		{
			if ($logResponse)
			{
				self::log('Remote command result: `'.ob_get_contents().'`.');
			}
			if (self::$endCallback)
			{
				call_user_func(self::$endCallback);
			}
			exit;			
		}
	
		public static function raiseError( $errorMsg )
		{
			ob_clean();
			self::log('Error while performing remote command `'.$errorMsg.'`.' );
			echo '#E#'.$errorMsg;
			self::endResponse(false);
		}
		
		public static function setResult( $result )
		{
			ob_clean();
			if ( is_array($result) )
			{
				self::setArrayResult($result);
			}
			else if ( is_object($result) )
			{
				self::setObjectResult($result);				
			}
			else
			{
				header('Content-Type: text/html; charset=UTF-8');
				echo '#S#'.$result;				
			}
			self::endResponse();
		}
		
		private static function formatXmlTextNode( $value )
		{
			return '<![CDATA[' . $value . ']]>';
			$hasCDATA = false !== strpos($value, '<') || false !== strpos($value, '>') || false !== strpos($value, '&');
			return ($hasCDATA ? '<![CDATA[' : '') . $value . ($hasCDATA ? ']]>' : '');
		}
		
		public static function setArrayResult( $result, $omitXmlDeclaration = false, $tagName = false )
		{
			if ( false === $omitXmlDeclaration )
			{
				ob_clean();
				header('Content-Type: text/xml; charset=UTF-8');
				echo '<'.'?xml version="1.0" encoding="UTF-8"?'.'><r>';
			}
			if ( false === $tagName )
			{
				$tagName = '__fry_array_item';
			}
			foreach ( $result as $key=>$value )
			{
				echo '<'.(is_numeric($key) ? $tagName : $key).'>';
				if ( is_array($value) )
				{
					self::setArrayResult($value, true, $key);
				}
				else if ( is_object($value) )
				{
					self::setObjectResult($value, true);
				}
				else
				{
					echo self::formatXmlTextNode($value);
				}
				echo '</'.(is_numeric($key) ? $tagName : $key).'>';
			}
			if ( !$omitXmlDeclaration )
			{
				echo '</r>';
				self::endResponse();
			}
		}		
		
		public static function setObjectResult( $result, $omitXmlDeclaration = false )
		{
			if ( false === $omitXmlDeclaration )
			{
				ob_clean();
				header('Content-Type: text/xml; charset=UTF-8');
				echo '<'.'?xml version="1.0" encoding="UTF-8"?'.'><r>';
			}
			if ( method_exists( $result, 'exposeProperties' ) )
			{
				$properties = $result->exposeProperties();
			}
			else
			{
				$properties = get_object_vars( $result );
			}
			foreach ( $properties as $name=>$value )
			{
				echo '<'.$name.'>';
				if ( is_array($value) )
				{
					self::setArrayResult($value, true, $name);
				}
				else if ( is_object($value) )
				{
					self::setObjectResult($value, true);
				}
				else
				{
					echo self::formatXmlTextNode($value);
				}
				echo '</'.$name.'>';
			}
			if ( !$omitXmlDeclaration )
			{
				echo '</r>';
				self::endResponse();
			}
		}		
		
	}
	
?>