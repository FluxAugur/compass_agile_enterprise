class WorkEffortSkillStandard < ActiveRecord::Base
  attr_protected :created_at, :updated_at
  # attr_accessible :title, :body
  belongs_to  :work_effort
  belongs_to  :skill_type
  belongs_to  :estimated_cost, :class_name => 'Money', :foreign_key => 'estimated_cost_money_id'
end
