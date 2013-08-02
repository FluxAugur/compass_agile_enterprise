require 'yaml'
require 'aws/s3'

module ErpTechSvcs
  module FileSupport
    class S3Manager < Manager
      class << self
        cattr_accessor :s3_connection, :s3_bucket, :tree

        def setup_connection
          @@configuration = YAML::load_file(File.join(Rails.root, 'config', 's3.yml'))[Rails.env]

          # S3 debug logging
          # AWS.config(
          #     :logger => Rails.logger,
          #     :log_level => :info
          # )

          @@s3_connection = AWS::S3.new(
              :access_key_id => @@configuration['access_key_id'],
              :secret_access_key => @@configuration['secret_access_key']
          )

          @@s3_bucket = @@s3_connection.buckets[@@configuration['bucket'].to_sym]
        end

      end

      def buckets
        @@s3_connection.buckets
      end

      def bucket=(name)
        @@s3_bucket = @@s3_connection.buckets[name.to_sym]
      end

      def bucket
        @@s3_bucket
      end

      def root
        ''
      end

      def update_file(path, content)
        file = FileAsset.where(:name => ::File.basename(path)).where(:directory => ::File.dirname(path)).first
        acl = (file.is_secured? ? :private : :public_read) unless file.nil?
        options = (file.nil? ? {} : {:acl => acl, :content_type => file.content_type})
        path = path.sub(%r{^/}, '')
        bucket.objects[path].write(content, options)
      end

      def create_file(path, name, content)
        path = path.sub(%r{^/}, '')
        full_filename = (path.blank? ? name : File.join(path, name))
        bucket.objects[full_filename].write(content, {:acl => :public_read})
      end

      def create_folder(path, name)
        path = path.sub(%r{^/}, '')
        full_filename = (path.blank? ? name : File.join(path, name))
        folder = full_filename + "/"
        bucket.objects[folder].write('', {:acl => :public_read})
      end

      def save_move(path, new_parent_path)
        result = false
        unless self.exists? path
          message = FILE_DOES_NOT_EXIST
        else
          file = FileAsset.where(:name => ::File.basename(path)).where(:directory => ::File.dirname(path)).first
          acl = (file.is_secured? ? :private : :public_read) unless file.nil?
          options = (file.nil? ? {} : {:acl => acl})
          name = File.basename(path)
          path = path.sub(%r{^/}, '')
          new_path = File.join(new_parent_path, name).sub(%r{^/}, '')
          old_object = bucket.objects[path]
          if new_object = old_object.move_to(new_path, options)
            message = "#{name} was moved to #{new_path} successfully"
            result = true
          else
            message = "Error moving file #{path}"
          end
        end

        return result, message
      end

      def rename_file(path, name)
        result = false
        old_name = File.basename(path)
        path_pieces = path.split('/')
        path_pieces.delete(path_pieces.last)
        path_pieces.push(name)
        new_path = path_pieces.join('/')
        begin
          file = FileAsset.where(:name => ::File.basename(path)).where(:directory => ::File.dirname(path)).first
          acl = (file.is_secured? ? :private : :public_read) unless file.nil?
          options = (file.nil? ? {} : {:acl => acl})
          path = path.sub(%r{^/}, '')
          new_path = new_path.sub(%r{^/}, '')
#          Rails.logger.info "renaming from #{path} to #{new_path}"
          old_object = bucket.objects[path]
          if new_object = old_object.move_to(new_path, options)
            message = "#{old_name} was renamed to #{name} successfully"
            result = true
          else
            message = "Error renaming #{old_name}"
          end
        rescue AWS::S3::Errors::NoSuchKey => ex
          message = FILE_FOLDER_DOES_NOT_EXIST
        end

        return result, message
      end

      def set_permissions(path, canned_acl=:public_read)
        path = path.sub(%r{^/}, '')
        bucket.objects[path].acl = canned_acl
      end

      def delete_file(path, options={})
        is_directory = !path.match(/\/$/).nil?
        path = path.sub(%r{^/}, '')
        result = false
        message = nil
        begin
          if options[:force] or bucket.as_tree(:prefix => path).children.count <= 1 # aws-sdk includes the folder itself as a child (like . is current dir), this needs revisited as <= 1 is scary
            bucket.objects.with_prefix(path).delete_all
            message = "File was deleted successfully"
            result = true
          else
            message = FOLDER_IS_NOT_EMPTY
          end
        rescue Exception => e
          result = false
          message = e
        end

        return result, message, is_directory
      end

      def exists?(path)
        begin
          path = path.sub(%r{^/}, '')
          return bucket.objects[path].exists?
        rescue AWS::S3::Errors::NoSuchKey
          return false
        end
      end

      def get_contents(path)
        contents = nil
        message = nil

        path = path.sub(%r{^/}, '')
        begin
          object = bucket.objects[path]
          contents = object.read
        rescue AWS::S3::Errors::NoSuchKey => error
          contents = ''
          message = FILE_DOES_NOT_EXIST
        end

        return contents, message
      end

      def build_tree(starting_path, options={})
        node_tree = find_node(starting_path, options)
        node_tree.nil? ? [] : node_tree
      end

      def find_node(path, options={})
        if options[:file_asset_holder]
          super
        else
          #remove proceeding slash for s3
          path.sub!(%r{^/}, '')

          parent = {:text => path.split('/').pop, :leaf => false, :id => path, :children => []}

          tree = bucket.as_tree(:prefix => path)
          tree.children.each do |node|
            if node.leaf?
              #ignore current path that comes as leaf from s3
              next if node.key == path

              parent[:children] << {
                  :text => node.key.split('/').pop,
                  :downloadPath => "/#{node.key}",
                  :id => "/#{node.key}",
                  :leaf => true
              }
            else
              #must prefix all paths with / to be consistent with file system
              parent[:children] << {
                  :iconCls => "icon-content",
                  :text => node.prefix.split('/').pop,
                  :id => "/#{node.prefix}".chop,
                  :leaf => false
              }
            end

          end

          parent
        end
      end

      def insert_folders(file_asset_nodes)
        file_asset_nodes.each do |child_asset_node|
          node = find_node(File.join(self.root,child_asset_node[:id]))
          unless node.nil?
            folders = node[:children].select{|item| !item[:leaf]}
            child_asset_node[:children] = [] if child_asset_node[:children].nil? && !folders.empty?
            folders.each do |folder|
              folder[:id].gsub!(self.root,'')
              child_asset_node[:children] << folder unless child_asset_node[:children].collect{|child_node| child_node[:text] }.include?(folder[:text])
            end
            #insert_folders(child_asset_node[:children])
          end
        end unless file_asset_nodes.nil?
      end

    end #S3Manager
  end #FileSupport
end #ErpTechSvcs