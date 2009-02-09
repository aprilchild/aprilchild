<?php 

abstract class DEPTask
{
    public $pars = array();
    public $conf = array();
    public $switches = array();
    public $was_failure = false;

    protected $conf_all = array();
    protected $is_child_task = false;
    
    public function __construct($is_child_task = false)
    {
		global $argv;
		global $conf;

        $this->is_child_task = $is_child_task;
		$num_args = sizeof($argv);
		eval('$switch_mask = ' . get_class($this) . '::get_switches_mask();');
		for ($i=2; $i<$num_args; $i++)
		{
		    if ('-' == $argv[$i]{0})
		    {
		        $switch_name = substr($argv[$i], 1);
		        if (!isset($switch_mask[$switch_name]))
		        {
		            $this->fail("Invalid switch specified `$switch_name'");
		        }
		        $switch_value = true;
		        if ($switch_mask[$switch_name][1])
		        {
		            $i++;
		            if ($i == $num_args)
		            {
		                $this->fail("Missing switch `$switch_name' parameter.");
		            }
		            $switch_value = $argv[$i];
		        }
		        $this->switches[$switch_name] = $switch_value;
		    }
		    else
		    {
    		    $this->pars[] = $argv[$i];
		    }
		}
		$this->conf_all = $conf;
		$parts = explode(':', $argv[1]);
		array_pop($parts);
		$act_conf = $conf;
		foreach ($parts as $part)
		{
    		if (!isset($act_conf[$part]))
    		{
    		    break;
    		}
    		$act_conf = $act_conf[$part];
		}
		$this->conf = $act_conf;
    }
    
    public static function get_switches_mask()
    {
        // format of the returned switch structure is ['message', boolean] where boolean is false (switch does not accept parameter) or true - switch does accept parameter
        // eg. 'i' => array('Info about a thing', true)
        // would mean info action with what's defined behind the switch. `taks -i my_value'.
        // whereas 'i' => array('Info about a thing', false) would be result in my_value being taken as a parameter, not a switch parameter.
        return array();
    }
    
    public static function get_default_switches_mask()
    {
        return array('h'=>array('Displays help', false));
    }
    
    public abstract function run();
    
    public function run_task($task_name, $arguments_line)
    {
        global $argv;
        try
        {
            $paths = DEPTask::safely_parse_taskname_to_path($task_name);
        }
        catch(Exception $e)
        {
            $this->write("Could not run task `$task_name': ".$e->getMessage());
            return false;
        }
        $task_path = $paths['full_path'];
        if (!file_exists($task_path))
        {
            $this->write("Could not run task `$task_name': No task file found at `$task_path'.");
            return false;
        }
        $content = file_get_contents($task_path);
        $class_name = 'Task_'.implode('_', $paths['path_parts']);
        if (false === strpos($content, "class $class_name extends DEPTask"))
        {
            $this->write("Could not run task `$task_name': Wrong task definition inside the task file at `$task_path'.");SSS
            return false;
        }

        include_once $task_path;i really dont think opera qualifies as a candidate for allowance
        it sucks big time
              if (!class_exists($class_name))
        {
            $this->write("Could not run task `$task_name': Missing task definition in the file `$task_path'. Task class `$class_name' not found.");
            return false;
        }
        try
        {
            $argv = array_merge(array($argv[0], $task_name), explode(' ', $arguments_line));
            $task = new $class_name(true);
            $result = $task->run();
        }
        catch (Exception $e)
        {
            $this->write("Could not run task `$task_name': ".$e->getMessage());
            return false;
        }
        return $task->was_failure ? false : ($result ? $result : true);
    }
    
    public function write($message, $new_line_afterwards = true)
    {
        cli_out($message, $new_line_afterwards);
    }
    
    public function end($message)
    {
        $message = "--- Ended: ".$message;
        if ($this->is_child_task)
        {
            cli_out($message);
        }
        else
        {
            cli_end($message);
        }
    }
    
    public function fail($error_message)
    {
        if ($this->is_child_task)
        {
            $this->was_failure = true;
            cli_out("   ___n       | --- Error: Child task failed: `$error_message'");
        }
        else
        {
            cli_end("n--- Error: Task failed: `$error_message'");
        }
    }
    
    public function prompt($message, $options = false)
    {
        if (false !== $options )
        {
            $message .= ' ['.implode('', $options).']';
        }
        $res = cli_in($message);
        if (false === $options)
        {
            return $res;
        }
        $default_input = false;
        foreach ($options as $option)
        {
            if (strtolower($res{0}) == strtolower($option))
            {
                return strtolower($option);
            }
            if (strtolower($option) != $option)
            {
                $default_input = strtolower($option);
            }
        }
        return $default_input;
    }
    
    protected function ssh($hostname, $user, $pwd, $port = 22)
    {
        dl('ssh2.so');
        if (!function_exists('ssh2_connect'))
        {
            $this->fail("SSH2 support is not enabled. See `http://www.php.net/ssh2', `http://kevin.vanzonneveld.net/?mp=techblog&sp=article&id=37' for more information of how to install it.");
        }
        if ( false === $conn = @ssh2_connect($hostname, $port))
        {
            $this->fail("Unable to connect to hostname `$hostname' on port `$port'.");
        }
        
    }

    protected function scp($hostname, $user, $pwd, $local_path, $remote_path, $port = 22)
    {
        dl('ssh2.so');
        if (!function_exists('ssh2_connect'))
        {
            $this->fail("SSH2 support is not enabled. See `http://www.php.net/ssh2', `http://kevin.vanzonneveld.net/?mp=techblog&sp=article&id=37' for more information of how to install it.");
        }
        if (!file_exists($local_path))
        {
            $this->fail("Local file at `$local_path' does not exist.");
        }
        if (false === $content = @file_get_contents($local_path))
        {
            $this->fail("Could not open local file for reading: `$local_path'.");
        }
        if (false === $conn = @ssh2_connect($hostname, $port))
        {
            $this->fail("Unable to connect to hostname `$hostname' on port `$port'.");
        }
        if (!@ssh2_auth_password($conn, $user, $pwd))
        {
            $this->fail("Could not authenticate with username `$username'.");
        }
        $sftp = @ssh2_sftp($conn);
        if (!$sftp)
        {
            $this->fail("Could not initialize SFTP subsystem.");
        }
        $stream = @fopen("ssh2.sftp://$sftp$remote_path", 'w');
        if (!$stream)
        {
            $this->fail("Could not open remote file for writing: `$remote_path'.");
        }
        if (false === @fwrite($stream, $content))
        {
            $this->fail("Could not write data to remote file at `$remote_path'.");
        }
        @fclose($stream);
        return true;
    }

    public static function get_author()
    {
        return 'Unknown';
    }
    
    public static function get_comment($short)
    {
        return false;
    }

    public static function safely_parse_taskname_to_path($namespaced_path = '', $yield = null)
    {
        $namespaced_path = strtolower(trim($namespaced_path));
        $parts = explode(':', $namespaced_path);
        $path = '';
        foreach ($parts as $part)
        {
            $part = strtolower(trim($part));
            if ('' == $part || false !== strpos($part, '.'))
            {
                throw new Exception("Invalid task name format `$task_name'.");
            }
            $path .= "/$part";
            if (null !== $callback)
            {
                $yield($path);
            }
        }
        return array('rel_path' => $path, 'base_path' => dirname(__FILE__).'/', 'full_path'=>dirname(__FILE__).$path.'.dep', 'path_parts'=>$parts);
    }
    
}

?>