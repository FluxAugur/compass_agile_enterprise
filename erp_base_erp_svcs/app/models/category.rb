class Category < ActiveRecord::Base
  attr_protected :created_at, :updated_at
  
  acts_as_nested_set
  include ErpTechSvcs::Utils::DefaultNestedSetMethods

  belongs_to :category_record, :polymorphic => true
  has_many :category_classifications, :dependent => :destroy
  
  def self.iid( internal_identifier_string )
    where("internal_identifier = ?",internal_identifier_string.to_s).first
  end
  
end
