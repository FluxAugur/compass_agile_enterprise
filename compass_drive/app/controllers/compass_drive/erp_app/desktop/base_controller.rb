module CompassDrive
  module ErpApp
    module Desktop
      class BaseController < ::ErpApp::Desktop::BaseController

        def index
          tree = CompassDriveAsset.all.collect do |compass_drive_asset|
            compass_drive_asset.to_hash(:only => [:id => :modelId, :name => :text],
              :additional_values => {
                :iconCls => compass_drive_asset.checked_out? ? 'icon-document_down' : 'icon-document',
                :leaf => true,
                :children => [],
                :checkedOut => compass_drive_asset.checked_out?,
                :checkedOutBy => (compass_drive_asset.checked_out_by.username if compass_drive_asset.checked_out_by),
                :lastCheckoutOut => compass_drive_asset.last_checkout_at
              })
          end

          render :json => tree
        end

        def add_category
          
        end

        def add_asset
          begin
          compass_drive_asset = CompassDriveAsset.new(:name => params[:asset_data].original_filename)
          compass_drive_asset.add_file(params[:asset_data], params[:comment], current_user)

          render :inline => {:success => true}.to_json
          rescue Exception=>ex
            render :inline => {:success => false, :msg => ex.message}.to_json
          end
        end

        def delete_asset
          if CompassDriveAsset.destroy(params[:id])
            render :json => {:success => true}
          else
            render :json => {:success => false}
          end
        end

        def checkout
          compass_drive_asset = CompassDriveAsset.find(params[:id])
          unless compass_drive_asset.checked_out?
            compass_drive_asset_version = compass_drive_asset.checkout(current_user)
          
            send_file compass_drive_asset_version.file_asset.data.path,
              :type => compass_drive_asset_version.file_asset.class.content_type,
              :filename => compass_drive_asset.name
          else
            render :inline => "Already checked out by #{compass_drive_asset.checked_out_by.username}"
          end
        end

        def checkin
          compass_drive_asset = CompassDriveAsset.find(params[:id])
          begin
            compass_drive_asset.checkin(current_user, params[:asset_data], params[:comment])
            render :inline => {:success => true}.to_json
          rescue CompassDriveAssetError::CheckedOutBySomeoneElseError => ex
            render :inline => {:success => false, :message => ex.message}.to_json
          end
        end

        def versions
          compass_drive_asset = CompassDriveAsset.find(params[:id])
          versions = compass_drive_asset.compass_drive_asset_versions.ordered.collect do |version|
            version.to_hash(:only => [:id, :version, :created_at],
              :additional_values => {
                :checked_in_by => (version.checked_in_by.username),
                :comment => (version.comment.nil? ? '' : "#{version.comment[0..10]}...")
              })
          end

          render :json => {:success => true, :versions => versions, :totalCount => versions.count}
        end

        def view_comment
          compass_drive_asset_version = CompassDriveAssetVersion.find(params[:id])

          render :inline => (compass_drive_asset_version.comment.nil? ? 'No Comment' : compass_drive_asset_version.comment)
        end

        def download_version
          compass_drive_asset_version = CompassDriveAssetVersion.find(params[:id])
          send_file compass_drive_asset_version.file_asset.data.path,
            :type => compass_drive_asset_version.file_asset.class.content_type,
            :filename => compass_drive_asset_version.compass_drive_asset.name
        end

      end
    end#Desktop
  end#ErpApp
end#CompassDrive