require 'dotenv'
require 'sinatra'

Dotenv.load('../shared/.env')

set :port, 3000

get '/' do
  "shopperId = #{ENV['SHOPPER_ID']}"
end
