<?php
/*
  *------------------------------------------------------------------------------------------
	SimpleHTTP Library

	Built on the technologies developed and maintained by April-Child.com
	Copyright (c)2007 Petr Krontorad, April-Child.com.

	Author: Petr Krontorad, petr@krontorad.com

	All rights reserved.
  *------------------------------------------------------------------------------------------

	
*/

class SimpleHTTP
{
    public static function send_post($hostname, $url_path, $data = array())
    {
        return self::send('POST', $hostname, 80, $url_path, $data);
    }
    
    public static function send_get($hostname, $url_path, $data = array())
    {
        return self::send('GET', $hostname, 80, $url_path, $data);
    }
    
	protected static function decode_body($headers, $str, $eol = "\r\n")
	{
		$tmp = $str;
		$add = strlen ($eol);
		$str = '';
		if (isset($headers['transfer-encoding']) && 'chunked' == $headers['transfer-encoding'])
		{
			do
			{
				$tmp = ltrim($tmp);
				$pos = strpos($tmp, $eol);
				$len = hexdec(substr($tmp,0,$pos));
				if (isset($headers['content-encoding']))
				{
					$str .= @gzinflate(substr($tmp, $pos + $add + 10, $len));
				}
				else
				{
					$str .= substr($tmp, $pos + $add, $len);
				}

				$tmp = substr($tmp, $len + $pos + $add);
				$check = trim ($tmp);
			}
			while (!empty($check));
		}
		else if (isset( $headers['content-encoding']))
		{
			$str = @gzinflate(substr($tmp, 10));
		}
		else 
		{
			$str = $tmp;
		}
		return $str;
	}

    public static function send($method, $hostname, $port, $url_path, $data = array(), $headers = array())
    {
        $method = strtoupper($method);
        if (!in_array($method, array('GET', 'POST', 'PROPFIND', 'OPTIONS', 'PUT', 'MKCOL')))
        {
            $method = 'GET';
        }
		if (!is_numeric($port))
		{
			$port = 80;
		}
        $s_data = array();
		if (!is_array($data))
		{
			$s_data = $data;
		}
		else
		{
	        foreach ($data as $key=>$value)
	        {
	            $s_data[] = $key.'='.urlencode($value);
	        }
	        $s_data = implode('&', $s_data);
		}
		if ('GET' == $method && 0 != strlen($s_data))
		{
			$url_path .= '?' . $s_data;
			$s_data = '';
		}
		$status_code = '';
        if (!$s = @fsockopen($hostname, $port))
		{
	        $body = '';
			$headers = array();
			$status_code = '500';
			$status = 'HTTP/1.1 500 Internal server error or host unreachable.';
		}
		else
		{
			$content_type = 'application/x-www-form-urlencoded';
			if (isset($headers['Content-Type']))
			{
				$content_type = $headers['Content-Type'];
				unset($headers['Content-Type']);
			}
	        fputs($s, $method.' '.$url_path." HTTP/1.1\r\n");
	        fputs($s, "Host: $hostname\r\n");
	        fputs($s, "Content-Type: $content_type\r\n");
	        fputs($s, "Content-Length: ".strlen($s_data)."\r\n");
	        fputs($s, "Accept-Encoding: compress, gzip\r\n");
	        fputs($s, "User-Agent: Gecko MSIE AppleWebKit KHTML Opera Win Mac Linux (April-Child.com simple HTTP client)\r\n");
			foreach ($headers as $name => $value)
			{
		        fputs($s, "$name: $value\r\n");
			}
	        fputs($s, "Connection: close\r\n\r\n");
	        fputs($s, $s_data);
	        $response = '';
	        while (!feof($s))
	        {
	            $response .= fgets($s, 128);
	        }
	        fclose($s);
	        $headers = array();
	        $body = '';
	        if (false !== $ix = strpos($response, "\r\n\r\n"))
	        {
	            $raw_headers = explode("\r\n", substr($response, 0, $ix));
	            $status = array_shift($raw_headers);
	            preg_match_all('|\\d{3}|', $status, $m);
	            $status_code = $m[0][0];
	            foreach ($raw_headers as $header)
	            {
	                $pair = explode(':', $header);
	                $headers[trim(strtolower($pair[0]))] = trim($pair[1]);
	            }
				$body = SimpleHTTP::decode_body($headers, substr($response, $ix+4));
	        }
		}
        return array('status' => $status, 'status_code' => $status_code, 'headers' => $headers, 'body' => $body);
    }    
}