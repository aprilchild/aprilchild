#++
#  Amy Editor - A Collaborative Text and Source Code Editor for Developers
#  Rails plugin
#  Copyright(c)2007-2008 Petr Krontorád, AprilChild.com
#--

module Amy
  class Bundle
    
    class << self
      def list(support_path)
  			bundles_path = "#{support_path}/bundles/"
  			raise RuntimeError, "There is no bundles directory available at `#{bundles_path}'." unless File.directory?(bundles_path)
  			bundles = []
  			Dir.foreach(bundles_path) do |f|
  			  next if '.' == f[0..0]
  			  bundle_path = "#{bundles_path}/#{f}/"
  			  info_file_path = "#{bundle_path}/info.amBundle"
  			  next unless File.exist?(info_file_path)
  			  yaml = YAML::load(File.open(info_file_path))
  			  yaml['id'] = f
  			  # getting list of bundle templates
  			  templates = []
  			  templates_path = "#{bundle_path}/templates/"
  			  if File.directory?(templates_path)
  			    Dir.foreach(templates_path) do |f|
  			      next if '.' == f[0..0]
  			      templates << File.read(templates_path + f).split("\n")[0]
			      end
			    end
			    yaml['templates'] = templates
			    bundles << yaml
			  end
			  bundles
		  end
    end
    
    attr_reader :dependencies
    
    def initialize(support_path, name = 'default', host_os = 'Windows')
      @support_path, @name, @host_os = support_path, name, host_os
      raise RuntimeError, 'Invalid bundle name.' if '' == name.strip
      @bundle_path = @support_path+'/bundles/'+name.downcase+'/'
      raise RuntimeError, "Bundle `#{name}' not found at `#{@bundle_path}'" unless File.directory?(@bundle_path)
      @info = load_bundle_yaml('info.amBundle', 'info')
      @dependencies = @info['signature']['dependencies']
      @snippets_inherited = @info['signature']['snippets_inherited'] ? @info['signature']['snippets_inherited'] : []
    end
  
    private

      def load_bundle_yaml(relative_path, name)
        file_path = @bundle_path+relative_path
        raise RuntimeError, "Bundle `#{@name}' `#{name}' file `#{file_path}' not found." unless File.exist?(file_path)
        begin
          YAML.load(File.open(file_path))
        rescue
          raise RuntimeError, "Bundle `#{@name}' loading error: `#{$!}' for `#{name}' at `#{relative_path}'."
        end
      end

    	def get_snippets_in_directory(path, relative_path)
    	  raise RuntimeError, "Directory for snippets at `#{path}' not found." unless File.directory?(path)
    		snippets = []
        Dir.foreach(path) do |f|
          new_path = "#{path}/#{f}"
          new_relative_path = "#{relative_path}/#{f}"
          # puts new_relative_path
          if '.amSnippet' == f[-10..-1] || (File.directory?(new_path) && '.' != f[0..0])
            if File.directory?(new_path) && File.exist?("#{new_path}/group.amGroup")
              yaml = YAML::load(File.open("#{new_path}/group.amGroup"))
              yaml['filename'] = f
              yaml['is_collection'] = '1'
              yaml['path'] = relative_path
              snippets << yaml
              snippets.concat(get_snippets_in_directory(new_path, new_relative_path))
              next
            end
            def_file = "#{new_path}Def"
            raise RuntimeError, "Missing snippet definition file `#{def_file}'." unless File.exist?(def_file)
            yaml = YAML::load(File.open(new_path))
            yaml['code'] = File.read(def_file)
            yaml['filename'] = f[0..-11]
            yaml['path'] = relative_path
            snippets << yaml
          end
        end
        snippets
      end

      def get_commands_in_directory(path, relative_path)
    	  raise RuntimeError, "Directory for commands at `#{path}' not found." unless File.directory?(path)
    		commands = []
    		Dir.foreach(path) do |f|
          new_path = "#{path}/#{f}"
          new_relative_path = "#{relative_path}/#{f}"
          if '.amCommand' == f[-10..-1] || (File.directory?(new_path) && '.' != f[0..0])
            if File.directory?(new_path) && File.exist?("#{new_path}/group.amGroup")
              yaml = YAML::load(File.open("#{new_path}/group.amGroup"))
              yaml['filename'] = f
              yaml['is_collection'] = '1'
              yaml['path'] = relative_path
              commands << yaml
              commands.concat(get_commands_in_directory(new_path, new_relative_path))
              next
            end
            def_file = "#{new_path}Def"
            raise RuntimeError, "Missing command definition file `#{def_file}'." unless File.exist?(def_file)
            yaml = YAML::load(File.open(new_path))
            yaml['code'] = File.read(def_file)
            yaml['filename'] = f[0..-11]
            yaml['path'] = relative_path
            commands << yaml
    		  end
  		  end
  		  commands
		  end

    public


  	def get_snippets
  	  snippets = []
  	  @snippets_inherited.each do |bundle_id|
  	    bundle = Amy::Bundle.new(@support_path, bundle_id, @host_os)
  	    snippets.concat(bundle.get_snippets)
	    end
	    snippets_path = "#{@bundle_path}/snippets/"
	    return snippets unless File.directory?(snippets_path)
  	  snippets.map do |snippet|
  	    snippet['is_inherited'] = '1'
	    end
  	  snippets.concat(get_snippets_in_directory(snippets_path, ''))
  	  snippets
    end
    
    def get_commands
      commands_path = @bundle_path+'/commands/'
      get_commands_in_directory(commands_path, '')
    end

    def get_keymap_definition
      keymap_default = load_bundle_yaml('/keymaps/default.amKeymap', 'default keymap')
      keymap_os = load_bundle_yaml("/keymaps/#{@host_os}.amKeymap", 'host OS keymap')
      definition = keymap_default['definition']+"\n"+keymap_os['definition']
      if keymap_default['signature']['inherits']
        keymap_default['signature']['inherits'].each do |bundle_name|
          bundle = Bundle.new(@support_path, bundle_name, @host_os)
          definition = bundle.get_keymap_definition+"\n"+definition
        end
      end
      definition
    end    
    
    def get_language_definition(lang_name)
      language = load_bundle_yaml("/languages/#{lang_name}.amLanguage", 'language')
      # puts lang_name
      definition =language['definition']
      base_definition = {'chunkRules' => []}
      base_signature = {}
      if language['signature']['inherits']
        language['signature']['inherits'].each do |base|
          base_info = base.split(':')
          bundle = Bundle.new(@support_path, base_info[0], @host_os)
          base_language = bundle.get_language_definition(base_info[1])
          base_signature = base_language['signature'].merge(base_signature)
          base_definition = base_language['definition'].merge(base_definition)
          base_definition['chunkRules'].concat(base_language['definition']['chunkRules'])
        end
      end
      language['signature'] = base_signature.merge(language['signature'])
      language['definition'] = base_definition.merge(language['definition'])
      language['definition']['chunkRules'].concat(base_definition['chunkRules'])
      return language
    end
    
    def get_templates
      templates_path = "#{@bundle_path}/templates/"
      return [] unless File.directory?(templates_path)
      templates = []
      Dir.foreach(templates_path) do |f|
        next if '.' == f[0..0]
        content = File.read(templates_path + f)
        ix = content.index("\n")
        info = content[0..ix-1].split(';')
        content = content[ix+1..-1]
        templates << {'filename' => info[0], 'name' => info[1], 'content' => content}
      end
      templates
    end

    def dump_definition
      definition = {
        'info' => @info,
        'keymap' => get_keymap_definition
      }
      # getting languages
      languages = []
      lang_dir_path = @bundle_path+'/languages'
      if File.directory?(lang_dir_path)
        Dir.foreach(lang_dir_path) do |f|
          next if '.' == f[0..0]
          if '.amLanguage' == f[-11..-1]
            language = get_language_definition(f[0..-12])
            language['id'] = f[0..-12]
            languages << language
          end
        end
      end
      definition['languages'] = languages
      definition['snippets'] = get_snippets
      definition['commands'] = get_commands
      definition['templates'] = get_templates
      definition['id'] = @name;
      definition
    end
    
    
  
  end
end