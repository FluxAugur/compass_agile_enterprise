class InventoryEntry < ActiveRecord::Base
  attr_protected :created_at, :updated_at

	belongs_to :inventory_entry_record, :polymorphic => true
	belongs_to :product_type
	has_one  :classification, :as => :classification, :class_name => 'CategoryClassification'
	has_many :prod_instance_inv_entries
	has_many :product_instances, :through => :prod_instance_inv_entries do
    def available
      includes([:prod_availability_status_type]).where('prod_availability_status_types.internal_identifier = ?', 'available')
    end

    def sold
      includes([:prod_availability_status_type]).where('prod_availability_status_types.internal_identifier = ?', 'sold')
    end
  end
	 
  def to_label
    "#{description}"
  end

end
