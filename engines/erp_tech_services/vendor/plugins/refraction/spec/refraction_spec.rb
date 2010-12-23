require File.join(File.dirname(__FILE__), "spec_helper")
require File.join(File.dirname(__FILE__), "..", "lib", "refraction")

describe Refraction do

  describe "if no rules have been configured" do
    before do
      Refraction.configure
    end

    it "does nothing" do
      env = Rack::MockRequest.env_for('http://bar.com/about', :method => 'get')
      app = mock('app')
      app.should_receive(:call) { |resp|
        resp['rack.url_scheme'].should == 'http'
        resp['SERVER_NAME'].should == 'bar.com'
        resp['PATH_INFO'].should == '/about'
        [200, {}, ["body"]]
      }
      response = Refraction.new(app).call(env)
    end
  end

  describe "path" do
    before do
      Refraction.configure do |req|
        if req.path == '/'
          req.permanent! 'http://yes.com/'
        elsif req.path == ''
          req.permanent! 'http://no.com/'
        end
      end
    end

    it "should be set to / if empty" do
      env = Rack::MockRequest.env_for('http://bar.com', :method => 'get')
      env['PATH_INFO'] = '/'
      app = mock('app')
      response = Refraction.new(app).call(env)
      response[0].should == 301
      response[1]['Location'].should == "http://yes.com/"
    end
  end

  describe "permanent redirection" do

    describe "using string arguments" do
      before do
        Refraction.configure do |req|
          req.permanent! "http://foo.com/bar?baz"
        end
      end

      it "should redirect everything to foo.com" do
        env = Rack::MockRequest.env_for('http://bar.com', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should == "http://foo.com/bar?baz"
      end
    end

    describe "using hash arguments" do
      before do
        Refraction.configure do |req|
          req.permanent! :host => "foo.com", :path => "/bar", :query => "baz"
        end
      end

      it "should redirect http://bar.com to http://foo.com" do
        env = Rack::MockRequest.env_for('http://bar.com', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should == "http://foo.com/bar?baz"
      end

      it "should redirect https://bar.com to https://foo.com" do
        env = Rack::MockRequest.env_for('https://bar.com', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should == "https://foo.com/bar?baz"
      end

      it "should clear the port unless set explicitly" do
        env = Rack::MockRequest.env_for('http://bar.com:3000/', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should == "http://foo.com/bar?baz"
      end
    end

    describe "using hash arguments but not changing scheme, host, or port" do
      before do
        Refraction.configure do |req|
          req.permanent! :path => "/bar", :query => "baz"
        end
      end

      it "should not clear the port" do
        env = Rack::MockRequest.env_for('http://bar.com:3000/', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should == "http://bar.com:3000/bar?baz"
      end
    end

    describe "with or without port number" do
    before(:each) do
      Refraction.configure do |req|
        case req.host 
        when "asterix.example.com"
          req.permanent! :path => "/potion#{req.path}"
        when "obelix.example.com"
          req.permanent! :host => "menhir.example.com"
        when "getafix.example.com"
          req.permanent! :scheme => "https"
        when "dogmatix.example.com"
          req.permanent! :port => 3001
        end
      end
    end

      it "should include port in Location if request had a port and didn't change scheme, host, or port" do
        env = Rack::MockRequest.env_for('http://asterix.example.com:3000/1', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should include("asterix.example.com:3000")
      end

      it "should not include port in Location if request didn't specify a port" do
        env = Rack::MockRequest.env_for('http://asterix.example.com/1', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should include("asterix.example.com")
        response[1]['Location'].should_not include(":3000")
      end

      it "should remove port from Location if host was changed" do
        env = Rack::MockRequest.env_for('http://obelix.example.com:3000/1', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should include("menhir.example.com")
        response[1]['Location'].should_not include(":3000")
      end

      it "should remove port from Location if scheme was changed" do
        env = Rack::MockRequest.env_for('http://getafix.example.com:3000/1', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should include("getafix.example.com")
        response[1]['Location'].should_not include(":3000")
      end

      it "should change port in Location if port was changed" do
        env = Rack::MockRequest.env_for('http://dogmatix.example.com:3000/1', :method => 'get')
        app = mock('app')
        response = Refraction.new(app).call(env)
        response[0].should == 301
        response[1]['Location'].should include("dogmatix.example.com:3001")
      end
    end
  end

  describe "temporary redirect for found" do
    before(:each) do
      Refraction.configure do |req|
        if req.path =~ %r{^/users/(josh|edward)/blog\.(atom|rss)$}
          req.found! "http://feeds.pivotallabs.com/pivotallabs/#{$1}.#{$2}"
        end
      end
    end

    it "should temporarily redirect to feedburner.com" do
      env = Rack::MockRequest.env_for('http://bar.com/users/josh/blog.atom', :method => 'get')
      app = mock('app')
      response = Refraction.new(app).call(env)
      response[0].should == 302
      response[1]['Location'].should == "http://feeds.pivotallabs.com/pivotallabs/josh.atom"
    end

    it "should not redirect when no match" do
      env = Rack::MockRequest.env_for('http://bar.com/users/sam/blog.rss', :method => 'get')
      app = mock('app')
      app.should_receive(:call) { |resp|
        resp['rack.url_scheme'].should == 'http'
        resp['SERVER_NAME'].should == 'bar.com'
        resp['PATH_INFO'].should == '/users/sam/blog.rss'
        [200, {}, ["body"]]
      }
      response = Refraction.new(app).call(env)
    end
  end

  describe "rewrite url" do
    before(:each) do
      Refraction.configure do |req|
        if req.host =~ /(tweed|pockets)\.example\.com/
          req.rewrite! :host => 'example.com', :path => "/#{$1}#{req.path == '/' ? '' : req.path}"
        end
      end
    end

    it "should rewrite subdomain to scope the path for matching subdomains" do
      env = Rack::MockRequest.env_for('http://tweed.example.com', :method => 'get')
      app = mock('app')
      app.should_receive(:call) { |resp|
        resp['rack.url_scheme'].should == 'http'
        resp['SERVER_NAME'].should == 'example.com'
        resp['PATH_INFO'].should == '/tweed'
        [200, {}, ["body"]]
      }
      Refraction.new(app).call(env)
    end

    it "should not rewrite if the subdomain does not match" do
      env = Rack::MockRequest.env_for('http://foo.example.com', :method => 'get')
      app = mock('app')
      app.should_receive(:call) { |resp|
        resp['rack.url_scheme'].should == 'http'
        resp['SERVER_NAME'].should == 'foo.example.com'
        resp['PATH_INFO'].should == '/'
        [200, {}, ["body"]]
      }
      Refraction.new(app).call(env)
    end
  end

  describe "generate arbitrary response" do
    before(:each) do
      Refraction.configure do |req|
        req.respond!(503, {'Content-Type' => 'text/plain'}, "Site down for maintenance.")
      end
    end

    it "should respond with status, headers and content" do
      env = Rack::MockRequest.env_for('http://example.com', :method => 'get')
      app = mock('app')
      response = Refraction.new(app).call(env)
      response[0].should == 503
      response[1]['Content-Length'].to_i.should == "Site down for maintenance.".length
      response[1]['Content-Type'].should == "text/plain"
      response[2].should == ["Site down for maintenance."]
    end
  end

  describe "environment" do
    before(:each) do
      Refraction.configure do |req|
        if req.env['HTTP_USER_AGENT'] =~ /FeedBurner/
          req.permanent! "http://yes.com/"
        else
          req.permanent! "http://no.com/"
        end
      end
    end

    it "should expose environment settings" do
      env = Rack::MockRequest.env_for('http://foo.com/', :method => 'get')
      env['HTTP_USER_AGENT'] = 'FeedBurner'
      app = mock('app')
      response = Refraction.new(app).call(env)
      response[0].should == 301
      response[1]['Location'].should == "http://yes.com/"
    end
  end
end
