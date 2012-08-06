$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "knitkit/version"

# Provide a simple gemspec so you can easily use your
# project in your rails apps through git.
Gem::Specification.new do |s|
  s.platform    = Gem::Platform::RUBY
  s.name        = "knitkit"
  s.version     = Knitkit::VERSION::STRING
  s.summary     = "CMS built for the Compass AE framework"
  s.description = "Knitkit is CompassAE's content and digital asset management application. It is based on ideas and code adapted from Mephisto and adva_cms, with significant changes to integrate with the CompassAE object-relational layer and to harmonize the user interface with the rest of CompassAE."
  s.authors     = ["Rick Koloski, Russell Holmes"]
  s.email       = ["russonrails@gmail.com"]
  s.homepage    = "http://development.compassagile.com"

  s.files = Dir["{public,app,config,db,lib,tasks}/**/*"] + ["GPL-3-LICENSE", "Rakefile", "README.md"]
  s.test_files = Dir["spec/**/*"]

  #compass dependencies
  s.add_dependency 'erp_forms', "~> 2.1"
  s.add_development_dependency 'erp_dev_svcs', "~> 3.1"

  s.add_dependency('routing-filter','0.3.1')
  s.add_dependency('nokogiri','~> 1.5.0')
  s.add_dependency('rubyzip','0.9.8')
#  s.add_dependency('permalink_fu','1.0.0')

  s.add_dependency('acts-as-taggable-on','2.3.1')
end
