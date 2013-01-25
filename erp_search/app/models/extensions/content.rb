if ErpSearch::Engine::USE_SOLR_FOR_CONTENT

  Content.class_eval do
    after_save :sunspot_commit
    after_destroy :sunspot_commit

    searchable do
      text :title
      text :excerpt_html    
      text :body_html
      string :website_section_id do
        # index website_section_id so solr does not need reindexed when section title/permalink changes
        website_sections.first.id rescue 0
      end
      string :type do
        website_sections.first.type rescue '' 
      end
      string :website_id do
        website_sections.first.website_id rescue 0
      end
    end

    # alias_method :search, :solr_search unless method_defined? :search
    # the above line in sunspot plugin doesn't allow you to overwrite the search method in content base model.
    # add this to force overwriting it.
    def self.search(options = {}, &block)
      self.solr_search(options = {}, &block)
    end

    # overwrite and add solr functionality.
    def self.do_search(options = {})

      if options[:section_permalink].nil? or options[:section_permalink].blank?
        website_section_id = nil
      else
        website_section_id = WebsiteSection.find_by_permalink_and_website_id(options[:section_permalink], options[:website_id]).id rescue nil
      end

      @results = Content.search do
        unless options[:query].empty?
          keywords options[:query]
        end

        unless options[:content_type].nil? or options[:content_type].empty?
          with(:type, options[:content_type])
        end

        unless website_section_id.nil?
          with(:website_section_id, website_section_id)
        end

        with(:website_id, options[:website_id])
        paginate :page => options[:page], :per_page => options[:per_page]
      end

      @search_results = build_search_results(@results.results) 

      @page_results = WillPaginate::Collection.create(options[:page], options[:per_page], @results.results.total_entries) do |pager|
         pager.replace(@search_results)
      end

      return @page_results
    end

    def total_pages
      page_count
    end
    
    def sunspot_commit
      Sunspot.commit    
    end
      
  end

end
