# work_effort purpose types - is this work_effort to produce something or repair something?

class WorkEffortPurposeType < ActiveRecord::Base
  # attr_accessible :title, :body

  acts_as_nested_set
  include ErpTechSvcs::Utils::DefaultNestedSetMethods

  has_many :work_efforts

end
