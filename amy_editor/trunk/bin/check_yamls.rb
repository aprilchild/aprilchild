#!/usr/bin/env ruby
require 'yaml'

def check_dir_for_yamls(path)
  Dir.foreach(path) do |f|
    next if '.' == f[0..0]
    new_path = "#{path}/#{f}"
    if f =~ /(amSnippet|amTheme|amBundle|amKeymap|amLanguage|amMenu|amCommand)$/
      begin
        YAML::load(File.open(new_path))
      rescue => e
        puts "#{new_path}\n\n#{e}"
        exit
      end
    elsif File.directory?(new_path)
      check_dir_for_yamls new_path
    end
  end
end

def check
  check_dir_for_yamls File.dirname(__FILE__) + '/../support/amy_default'
end

check