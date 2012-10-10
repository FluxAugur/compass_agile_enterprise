class BizTxnRelationship < ActiveRecord::Base
  attr_protected :created_at, :updated_at

  belongs_to :txn_event_from, :class_name => "BizTxnEvent", :foreign_key => "txn_event_id_from"  
  belongs_to :txn_event_to , :class_name => "BizTxnEvent", :foreign_key => "txn_event_id_to"
  
  belongs_to :biz_txn_rel_type

end
