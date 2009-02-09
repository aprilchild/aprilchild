class SetupAmyEditor < ActiveRecord::Migration
  def self.up
    ActiveRecord::Base.establish_connection 'amy_editor'
    execute File.read(File.join(RAILS_ROOT, 'db/setup_amy_editor.sql'))
    ActiveRecord::Base.establish_connection 'development'
  end

  def self.down
    ActiveRecord::Base.establish_connection 'amy_editor'
    execute 'DROP SCHEMA amy CASCADE'
    ActiveRecord::Base.establish_connection 'development'
  end
end
