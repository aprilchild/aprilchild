
class AmyRexecController < Amy::AbstractApplicationController

	def google_search
		set_result(Amy::Google.search(@params['query']))
	end
	
	def run
		bundle_id = strip_filename(@params['bundle'])
		scriptname = strip_filename(@params['script'])
		script_path = amy_support_path + '/bundles/' + bundle_id + '/scripts/' + scriptname + '.rb';
		return raise_error("Script not found.") unless File.exist?(script_path)
		begin
		  load script_path
		  run_script(self, @params)
		rescue => e
		  return raise_error("Error while running the script.");
	  end
  end

	def command
		bundle_id = strip_filename(@params['bundle'])
		command = @params['command'].gsub('..', '')
		command_path = amy_support_path + '/bundles/' + bundle_id + '/commands/' + command + '.amCommandDef'
		return raise_error("Command not found.") unless File.exist?(command_path)
		begin
		  load command_path
		  run_command(self, @params['text'], params)
		rescue => e
		  return raise_error("Error while executing command: `#{e}'")
	  end
	end

	def import(bundle_id, library_name)
		bundle_id = strip_filename(bundle_id)
		library_name = strip_filename(library_name)
		path = amy_support_path + '/bundles/' + bundle_id + '/libs/' + library_name + '.rb'
		return raise_error("Imported library not found.") unless File.exist?(path)
		begin
		  load path
	  rescue => e
	    return raise_error("Error while importing library.")
    end
  end
	
	def ok(result)
    set_result result
	end

	def fail(error)
    raise_error error
  end
end