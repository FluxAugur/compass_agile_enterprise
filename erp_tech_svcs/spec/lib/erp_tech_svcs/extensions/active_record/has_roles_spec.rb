require 'spec_helper'

describe ErpTechSvcs::Extensions::ActiveRecord::HasSecurityRoles do
  before(:all) do
    @user = FactoryGirl.create(:user)
    @user_2 = FactoryGirl.create(:user)

    @admin_role = SecurityRole.find_or_create_by_description_and_internal_identifier(:description => 'Admin', :internal_identifier => 'admin')
    @employee_role = SecurityRole.find_or_create_by_description_and_internal_identifier(:description => 'Employee', :internal_identifier => 'employee')
    @manager_role = SecurityRole.find_or_create_by_description_and_internal_identifier(:description => 'Manager', :internal_identifier => 'manager')
  end
  
  it "should allow you to add a role" do
    @user.add_role(@admin_role)
    @user.remove_all_roles
  end

  it "should allow you to add multiple roles by Role instance or iid" do
    @user.add_roles(@admin_role, 'manager')
    @user.remove_all_roles
  end

  it "should allow you to add multiple roles by array or arguments" do
    @user.add_roles(@employee_role, 'manager')
    @user.has_role?(@employee_role).should eq true
    @user.has_role?('manager').should eq true
    @user.remove_all_roles
    @user.add_roles([@employee_role, 'manager'])
    @user.has_role?(@employee_role).should eq true
    @user.has_role?('manager').should eq true
    @user.remove_all_roles
  end

  it "should allow you to check for roles by Role instance or iid" do
    @user.add_roles(@admin_role, 'manager')
    @user.has_role?(@admin_role, 'employee').should eq true
    @user.remove_all_roles
  end

  it "should allow you to remove a role" do
    @user.add_role(@admin_role)
    @user.remove_role(@admin_role)
    @user.has_role?(@admin_role).should eq false
  end

  it "should allow you to remove multiple roles by Role instance or iid" do
    @user.add_roles(@admin_role, 'manager')
    @user.remove_roles(@employee_role, 'manager')
    @user.has_role?(@employee_role).should eq false
    @user.has_role?('manager').should eq false
  end

  it "should allow you to remove all roles at once" do
    @user.add_roles(@admin_role, @manager_role)
    @user.remove_all_roles
    @user.roles.count.should eq 0
  end

  it "should allow you to check access for user on model" do
    @user.add_roles(@admin_role)
    @user_2.add_roles(@admin_role)
    @user.remove_all_roles
    @user_2.remove_all_roles
  end

  after(:all) do
    User.destroy_all
    SecurityRole.destroy_all
  end

  
end