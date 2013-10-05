class OrderLineItem < ActiveRecord::Base
  attr_protected :created_at, :updated_at

	belongs_to :order_txn, :class_name => 'OrderTxn'
	belongs_to :order_line_item_type
	
  has_many :charge_lines, :as => :charged_item

  belongs_to :product_instance
  belongs_to :product_type

  has_many :order_line_item_pty_roles, :dependent => :destroy
  has_many :role_types, :through => :order_line_item_pty_roles

  ## Allow for polymorphic subtypes of this class
  belongs_to :order_line_record, :polymorphic => true

  def get_total_charges
    # get all of the charge lines associated with the order_line
    total_hash = Hash.new
    charge_lines.each do |charge|
      cur_money = charge.money
      cur_total = total_hash[cur_money.currency.internal_identifier]
      if (cur_total.nil?)
        cur_total = cur_money.clone
      else
        cur_total.amount = 0 if cur_total.amount.nil?
        cur_total.amount += cur_money.amount if !cur_money.amount.nil?
      end
      total_hash[cur_money.currency.internal_identifier] = cur_total
    end
    return total_hash.values
  end
end
