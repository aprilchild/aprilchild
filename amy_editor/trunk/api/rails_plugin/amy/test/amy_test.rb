#++
#  Amy Editor - A Collaborative Text and Source Code Editor for Developers
#  Rails plugin
#  Copyright(c)2007-2008 Petr Krontorád, AprilChild.com
#--


require 'test/unit'
require 'yaml'
require File.join(File.dirname(__FILE__), '../lib/amy_bundle.rb')

class AmyTest < Test::Unit::TestCase
  
  # @@support_path = File.join(RAILS_ROOT, 'vendor/plugins/amy/support')
  @@support_path = File.join(File.dirname(__FILE__), '../support')

  def test_list_bundles
    list = Amy::Bundle.list(@@support_path)
    assert_equal(9, list.length)
  end

  def test_load_bundle
    bundle = Amy::Bundle.new(@@support_path, 'rails', 'Mac')
  end

  def test_load_bundle_snippets
    bundle = Amy::Bundle.new(@@support_path, 'ruby', 'Mac')
    assert_equal(144, bundle.get_snippets.length)
  end

  def test_load_bundle_snippets_inherited
    bundle = Amy::Bundle.new(@@support_path, 'rails', 'Mac')
    assert_equal(226, bundle.get_snippets.length)
  end

  def test_load_bundle_commands
    bundle = Amy::Bundle.new(@@support_path, 'default', 'Mac')
    assert_equal(8, bundle.get_commands.length)
  end
  
  def test_get_keymap_definition
    bundle = Amy::Bundle.new(@@support_path, 'javascript', 'Windows')
    bundle.get_keymap_definition
  end
  
  # this will effectively scan for all keymaps yaml - must proceed successfully for validity!
  def test_get_all_bundles_keymaps
    Amy::Bundle.list(@@support_path).each do |bundle_info|
      bundle = Amy::Bundle.new(@@support_path, bundle_info['id'], 'Mac')
      bundle.get_keymap_definition
      bundle = Amy::Bundle.new(@@support_path, bundle_info['id'], 'Windows')
      bundle.get_keymap_definition
    end
  end

  # this will effectively scan for all yamls - must proceed successfully for validity!
  def test_get_all_bundles_definitions
    Amy::Bundle.list(@@support_path).each do |bundle_info|
      bundle = Amy::Bundle.new(@@support_path, bundle_info['id'], 'Mac')
      bundle.dump_definition
      bundle = Amy::Bundle.new(@@support_path, bundle_info['id'], 'Windows')
      bundle.dump_definition
    end
  end


end
