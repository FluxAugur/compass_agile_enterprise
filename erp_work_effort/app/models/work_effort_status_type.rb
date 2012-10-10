class WorkEffortStatusType < ActiveRecord::Base
  attr_protected :created_at, :updated_at

  has_many   :work_effort_statuses
  has_one    :previous_status_type, :class_name => 'WorkEffortStatusType', :foreign_key => 'previous_status_id'
  has_one    :next_status_type, :class_name => 'WorkEffortStatusType', :foreign_key => 'next_status_id'
  
  def status
    description
  end

  def self.iid(internal_identifier)
  	 	self.where('internal_identifier = ?', internal_identifier).first
  end
end
