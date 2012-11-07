module ErpCommunicationEvents
  class Engine < Rails::Engine
    isolate_namespace ErpCommunicationEvents
    
    #add observers
	  #this is ugly need a better way
	  (config.active_record.observers.nil?) ? config.active_record.observers = [:communication_event_observer] : config.active_record.observers << :communication_event_observer
	  config.active_record.observers << :email_address_change_event_observer
	  config.active_record.observers << :phone_number_change_event_observer
	  config.active_record.observers << :phone_number_change_event_observer

    ErpBaseErpSvcs.register_as_compass_ae_engine(config, self)

  end
end
