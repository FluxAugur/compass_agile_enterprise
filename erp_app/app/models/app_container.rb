class AppContainer < ActiveRecord::Base
  attr_protected :created_at, :updated_at

  has_user_preferences

  belongs_to :user
  belongs_to :app_container_record, :polymorphic => true
  has_and_belongs_to_many :applications

  def preferences
    self.user_preferences.includes([:preference]).where('user_id = ?', self.user.id).map(&:preference)
  end

  def get_preference(preference_type_iid)
    get_user_preference(self.user, preference_type_iid)
  end

  def set_preference(preference_type_iid, preference_option_iid)
    set_user_preference(self.user, preference_type_iid, preference_option_iid)
  end

  def setup_default_preferences
    #template method
  end

  class << self
    def find_by_user(user)
      AppContainer.where('user_id = ?', user.id).first
    end
  end
end
