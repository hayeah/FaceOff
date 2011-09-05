require "sinatra"
require 'erb'

configure(:development) do |c|
  require "sinatra/reloader"
  # c.also_reload "*.rb"
end

get "/" do
  "hello world 2"
end

get "/test/sdk" do
  erb :test_sdk
end

get "/test/iframe" do
  erb :test_iframe
end
