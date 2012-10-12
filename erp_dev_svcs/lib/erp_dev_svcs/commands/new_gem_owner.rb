require 'optparse'
require 'erp_dev_svcs/commands/helper'

module ErpDevSvcs
  module Commands
    class NewGemOwner

      def self.execute
        new()
      end

      def initialize
        options = {}

        gem_names = ErpDevSvcs::Commands::Helper.compass_gem_names

        opt_parser = OptionParser.new do |opt|
          opt.banner = "Usage: compass-util new_gem_owner --emails LISTOFEMAILS"

          opt.on('-r', '--remove', String, "remove user from gem owner"){|r| options[:remove] = "-r"}
          
          opt.on("-e", "--emails LISTOFEMAILS", Array,
                 "comma seperated list of email addresses of the users "\
                 "you want to own the compass gems") {|emails| options[:emails] = emails}

          opt.on_tail("-h", "--help", "Show this message") do
            puts opt
            exit
          end
        end

        opt_parser.parse!

        puts opt_parser; exit if options[:emails].nil?

        ErpDevSvcs::Commands::Helper.exec_in_engines do |engine_name|
          command = options[:remove] || "-a" 
          
          options[:emails].each do |email|
            result = %x[gem owner #{engine_name} #{command} #{email}]
            puts result
          end
        end
      end
    end
  end
end
