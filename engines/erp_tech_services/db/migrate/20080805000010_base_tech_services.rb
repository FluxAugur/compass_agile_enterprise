class BaseTechServices < ActiveRecord::Migration
  def self.up
    unless table_exists?(:users)
      # Create the users table
      create_table :users, :force => true do |t|
		  	t.column :user_type,								  :string
        t.column :login,                      :string, :limit => 40
        t.column :name,                       :string, :limit => 100, :default => '', :null => true
        t.column :email,                      :string, :limit => 100
        t.column :crypted_password,           :string, :limit => 40
        t.column :salt,                       :string, :limit => 40
        t.column :created_at,                 :datetime
        t.column :updated_at,                 :datetime
        t.column :remember_token,             :string, :limit => 40
        t.column :remember_token_expires_at,  :datetime
        t.column :activation_code,            :string, :limit => 40
        t.column :activated_at,               :datetime
        t.column :activation_code_expires_at, :datetime
 	      t.column :password_reset_code,        :string, :limit => 40
        t.column :enabled,                    :boolean,               :default => true   
	      t.column :identity_url,							  :string
	      t.column :invitation_id,						  :integer
	      t.column :invitation_limit, 				  :integer
	      t.column :party_id,                   :integer

	      # merge in add_security_questions_add_and_mist_to_user migration
        t.column :club_number,          :string
        t.column :owner_number,         :string
        t.column :dob,                  :date
        t.column :ssn_last_four,        :string

        t.column :salutation,           :string
        t.column :first_name,           :string
        t.column :last_name,            :string

        t.column :street_address,       :string
        t.column :city,                 :string
        t.column :state_province,       :string
        t.column :postal_code,          :string
        t.column :country,              :string
        t.column :phone,                :string

        t.column :security_question_1,  :string
        t.column :security_answer_1,    :string

        t.column :security_question_2,  :string
        t.column :security_answer_2,    :string  

        # merge in add_password_lock_count_column migration
	      t.column :lock_count,           :integer,     :default => 0
      end
    end

    unless table_exists?(:roles)
      # create the roles table
      create_table :roles do |t|
        t.column :description, :string
        t.column :internal_identifier, :string
        t.column :external_identifier, :string
        t.column :external_id_source, :string
        
        t.timestamps
      end
    end

    unless table_exists?(:roles_users)
      # generate the join table
      create_table :roles_users, :id => false do |t|
        t.integer :role_id, :user_id
      end
    end

    unless table_exists?(:logged_exceptions)
      # add exceptions table
      create_table :logged_exceptions, :force => true do |t|
        t.column :exception_class, :string
        t.column :controller_name, :string
        t.column :action_name,     :string
        t.column :message,         :text
        t.column :backtrace,       :text
        t.column :environment,     :text
        t.column :request,         :text
        t.column :created_at,      :datetime
      end
    end

    unless table_exists?(:four_oh_fours)
      # Create four_oh_fours table
      create_table :four_oh_fours do |t|
        t.string  :url,           :referer
        t.integer :count,         :default => 0
        t.string  :remote_address
        t.timestamps
      end
    end

    unless table_exists?(:user_failures)
      # Create user_failures
      create_table :user_failures do |t|
        t.string :remote_ip, :http_user_agent, :failure_type, :username
        t.integer :count, :default => 0
        t.timestamps
      end
    end

    unless table_exists?(:simple_captcha_data)
      # Create simple_captcha_data
      create_table :simple_captcha_data do |t|
        t.string :key,    :limit => 40
        t.string :value,  :limit => 6
        t.timestamps
      end
    end

    unless table_exists?(:sessions)    
      # Create sessions table
      create_table :sessions do |t|
        t.string :session_id, :null => false
        t.text :data
        t.timestamps
      end
    end

    unless table_exists?(:security_questions)
      # Create security questions table
      create_table :security_questions do |t|
        t.string :question
        t.timestamps
      end
    end

    unless table_exists?(:audit_logs)
      # Create audit_logs
      create_table :audit_logs do |t|
        t.column :application_id, :string
        t.column :user_id,        :integer
        t.column :event_id,       :integer
        t.column :description,    :string
        t.column :party_id,       :integer
        t.timestamps
      end
    end
    
    unless table_exists?(:invitations)
      create_table :invitations do |t|
		  	t.integer  :sender_id
		  	t.string   :email, :token
		  	t.datetime :sent_at
		  	t.timestamps
      end
    end

    unless table_exists?(:geo_countries)
      create_table :geo_countries do |t|
        t.column :name,         :string
        t.column :type,         :string,  :default => "GeoCountry"
        t.column :iso_code_2,   :string,  :length => 2
        t.column :iso_code_3,   :string,  :length => 3
        t.column :display,      :boolean, :default => true
        t.column :external_id,  :integer
        t.column :created_at,   :datetime
      end
    end

    unless table_exists?(:geo_zones)
      create_table :geo_zones do |t|
        t.column :geo_country_id, :integer
        t.column :zone_code,      :string,  :default => 2
        t.column :zone_name,      :string
        t.column :created_at,     :datetime
      end
    end

    unless table_exists?(:image_assets)
      create_table :image_assets do |t|
        t.column :parent_id,    :integer
        t.column :content_type, :string
        t.column :filename,     :string    
        t.column :thumbnail,    :string 
        t.column :file_size,    :integer
        t.column :width,        :integer
        t.column :height,       :integer
        t.column :description,  :string
        t.timestamps
      end
    end

    unless table_exists?(:content_mgt_assets)
      create_table :content_mgt_assets do |t|
        t.column    :digital_asset_id,    :integer
        t.column    :digital_asset_type,  :string
        t.column    :description,         :string
        t.timestamps
      end
    end
    
    unless table_exists?(:entity_content_assignments)
      create_table :entity_content_assignments do |t|
        t.column    :content_mgt_asset_id,      :integer      
        t.column    :da_assignment_id,          :integer
        t.column    :da_assignment_type,        :string
        t.column    :default_list_image_flag,   :integer
        t.column    :description,               :string
        t.timestamps
      end
    end

  end

  def self.down
    # check that each table exists before trying to delete it.
    [
      :entity_content_assignments, :content_mgt_assets, :image_assets, 
      :geo_zones, :geo_countries, :invitations,
      :audit_logs, :security_questions, :sessions, 
      :simple_captcha_data, :four_oh_fours, :user_failures, 
      :logged_exceptions, :roles_users, :roles, 
      :users
    ].each do |tbl|
      if table_exists?(tbl)
        drop_table tbl
      end
    end
  end
  
end
