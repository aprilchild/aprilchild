#++
#     ------------------------------------------------------------------------------------------
#     == Amy Editor ==
#     Collaborative Text and Source Code Editor for Developers
# 
#     Built on the technologies developed and maintained by April-Child.com
#     Copyright (c)2007,2008 Petr Krontorad, April-Child.com.
# 
#     Author: Petr Krontorad, petr@krontorad.com
# 
#     All rights reserved.
#     *------------------------------------------------------------------------------------------
# 
#     User and session management library
# 
#     *------------------------------------------------------------------------------------------
#--
unless defined?(Amy::User)

require "digest/md5"

module Amy
  class User
    
    CREDENTIALS_FIELDS = %w(email nickname picture bio)
    attr_reader :user_id, :username, :service, :credentials
    
    def initialize
      @user_id = 0
      @username = ''
      @service = 'amy'
      @credentials = {}
      @session = nil
    end
    
    def load_user_info(row)
      @user_id, @username, @service = row['id'], row['username'], row['service']
      CREDENTIALS_FIELDS.each do |key|
        @credentials[key] = row[key]
      end
    end
    
    def support_path(force_original=false)
      return Amy::SUPPORT_PATH if force_original
      File.join(Amy::SUPPORT_PATH, "#{@service}_#{@username}/")
    end
    
    def setup_support_dir
      copy_dir File.join(support_path(true), 'amy_default/'), support_path
    end
    
    private

    def copy_dir(src_path, target_path)
      Dir.mkdir(target_path, 0755)
      Dir.foreach(src_path) do |f|
        next if '.' == f[0..0]
        new_src_path = "#{src_path}/#{f}"
        new_target_path = "#{target_path}/#{f}"
        if File.directory?(new_src_path)
          copy_dir new_src_path, new_target_path
        else
          File.open(new_target_path, 'w') { |f| f.write File.read(new_src_path)}
        end
      end
    end
    
    def save_user_to_session(session)
      concatenated = @credentials
      concatenated['id'], concatenated['username'], concatenated['service'] = @user_id, @username, @service
      session.auth_info['user_info'] = concatenated
      session.save
    end
      
    public
    
    def load_from_session(session)
      @session = session
      if @session.auth_info['user_info']
        load_user_info @session.auth_info['user_info']
      else
        load!(@session.auth_info['user_id'])
        save_user_to_session session
      end
      self
    end
    
    def load!(user_id=0)
      raise RuntimeError, "Invalid user ID specified: `#{user_id}'" unless 0 < user_id.to_i
      unless row = Amy::Support::Db.find_first("SELECT * FROM amy.users WHERE id=#{user_id.to_i} LIMIT 1")
        raise RuntimeError, "Unable to lookup user: `#{user_id}'."
      end
      load_user_info row
      self
    end

    def save!
  		sql = 'UPDATE amy.users SET ';
  		@credentials.each do |key, value|
  		  sql = sql + key + "='" . Amy::Support::Db.quote_literal(value) + "', "
		  end
  		sql = sql[0..-3] + ' WHERE id=' + @user_id
  		unless Amy::Support::Db.find(sql)
  			raise RuntimeError, "Unable to save user credentials: #{Amy::Support::Db.last_error}"
  		end
  		unless @session.nil?
  		  save_user_to_session @session
		  end
		  self
	  end
	  
	  def authorize(username, password=nil, service='amy')
	    username = Amy::Support::Db.quote_literal(username)
	    service = Amy::Support::Db.quote_literal(service)
	    # bypassing the password - already logged in using external sevice API (Facebook and such)
	    unless row = Amy::Support::Db.find_first("SELECT * FROM amy.users WHERE username='#{username}' AND service='#{service}' LIMIT 1")
	      raise RuntimeError, "Unable to lookup username: `#{username}' for service `#{service}'."
      end
      unless password.nil?
        raise RuntimeError, "Invalid password provided." unless Digest::MD5.hexdigest(password) == row['hashed_password']
      end
      load_user_info row
      Amy::Support::Db.find("UPDATE amy.users SET last_logged_at=CURRENT_TIMESTAMP WHERE id=#{@user_id}")
      self
    end
    
    def register(username, password=nil, service='amy', credentials={})
	    username = Amy::Support::Db.quote_literal(username.strip)
	    raise RuntimeError, "Username cannot be empty" if 0 == username.length
	    service = Amy::Support::Db.quote_literal(service)
	    hashed_password = password.nil? ? '' : Digest::MD5.hexdigest(password)
	    q_data = {}
	    CREDENTIALS_FIELDS.each do |key|
	      q_data[key] = credentials[key] ? Amy::Support::Db.quote_literal(credentials[key]) : ''
      end
	    unless row = Amy::Support::Db::find_first("SELECT * FROM amy.user_create('#{username}', '#{hashed_password}', '#{service}', '" + q_data['email'] + "', '" + q_data['nickname'] + "', '" + q_data['picture'] + "', '" + q_data['bio'] + "')")
	      raise RuntimeError, "User registration failed: `#{Amy::Support::Db.last_error}'."
      end
      load_user_info row
      begin
        setup_support_dir
      rescue => e
        Amy::Support::Db.find("SELECT amy.user_delete(#{@user_id})")
        raise RuntimeError, "User registration failed: `Unable to set up support directory', #{e}."
      end
      self
    end
    
    def make_default
      authorize 'default'
    end
    
    def is_authorized
      return 0 != @user_id
    end
    
    def is_default
      return 'default' == @username
    end
    
    def create_session
      raise RuntimeError, "User is not authorized. Could not create session." unless is_authorized
      session = Session.new
      session.create @user_id
      save_user_to_session session
      @session = session
      session
    end
	  
  end

  class Session
    
    EXPIRES_AFTER_SECONDS = 10800 # 3 hours
    RENEW_BEFORE_EXPIRATION = 3600 # 1 hour before actual expiration
    
    
    attr_accessor :auth_info
    cattr_accessor :amy_token

    def initialize
      @auth_info = {}
      @session_storage_path = File.join(RAILS_ROOT, 'tmp/sessions/')
    end

    def authorize
      unless @@amy_token && 32 == @@amy_token.length
        raise RuntimeError, "Invalid or non-existent session token."
      end
      session_path = @session_storage_path + @@amy_token
      unless File.exist?(session_path)
        raise RuntimeError, "Unable to authorize session: `session file not found'."
      end
      begin
        File.open(session_path) do |f|
          @auth_info = Marshal.load(f)
        end
      rescue => e
        raise RuntimeError, "Unable to authorize session: `session file unreadable or corupted'."
      end
      self
    end
    
    def create(user_id=1)
      raise RuntimeError, "Invalid user ID specified: `#{user_id}'" unless 0 < user_id.to_i
      begin
        authorize
        if user_id == @auth_info['user_id']
          if Time.new + RENEW_BEFORE_EXPIRATION < @auth_info['expired_at']
            return self
          end
          #renewing
          @auth_info['expired_at'] = Time.new + EXPIRES_AFTER_SECONDS
          save
          return self
        end
      rescue => e
      end
      @auth_info['user_id'] = user_id
      @auth_info['expired_at'] = Time.new + EXPIRES_AFTER_SECONDS
      @auth_info['token'] = generate_hash
      @@amy_token = @auth_info['token']
      save
      self
    end
    
    def save
      session_path = @session_storage_path + @@amy_token
      File.open(session_path, 'w') do |f|
        Marshal.dump(@auth_info, f)
      end
    end

    private
      def generate_hash
        offset = rand(11)
        return Time.now.to_i.to_s + Digest::MD5.hexdigest(rand(4434783).to_s + Time.now.to_i.to_s)[offset..(offset+21)]
      end

  end

end

end