class LoyaltyProgramCode < ActiveRecord::Base
  attr_protected :created_at, :updated_at

  # Extend this class to define specific loyalty program code functionality
  has_many :currencies, :through => :locales
  
end
