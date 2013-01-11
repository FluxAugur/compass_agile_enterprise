class Fee < ActiveRecord::Base
  attr_protected :created_at, :updated_at

	belongs_to  :fee_record, :polymorphic => true
  belongs_to  :money
  belongs_to  :fee_type
  
end
