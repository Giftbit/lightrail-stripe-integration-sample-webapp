require 'dotenv'
require 'sinatra'
require 'mustache'

# Load and check config.
Dotenv.load(File.join(File.dirname(__FILE__), '..', '..', 'shared', '.env'))
if !ENV['LIGHTRAIL_API_KEY'] ||
  !ENV['LIGHTRAIL_SHARED_SECRET'] ||
  !ENV['STRIPE_API_KEY'] ||
  !ENV['STRIPE_PUBLISHABLE_KEY'] ||
  !ENV['TITLE'] ||
  !ENV['SHOPPER_ID'] ||
  !ENV['ORDER_TOTAL']
  puts 'One or more environment variables necessary to run this demo is/are not set.  See README.md on setting these values.'
end

# Configure Sinatra.
set :port, 3000
Mustache.template_path = File.join(__dir__, '..', '..', 'shared', 'views')
Mustache.template_extension = 'html'

# Configuration for the demo.
static_params = {
    title: ENV['TITLE'],
    orderTotal: ENV['ORDER_TOTAL'].to_i,
    orderTotalDisplay: '%.2f' % (ENV['ORDER_TOTAL'].to_i / 100),
    currency: 'USD',
    stripePublicKey: ENV['STRIPE_PUBLISHABLE_KEY'],
    shopperId: ENV['SHOPPER_ID'],
    shopperToken: 'TODO'
}

get '/checkout' do
  Mustache.render_file('checkout', static_params)
end

get '/manageAccount' do
  Mustache.render_file('manageAccount', static_params)
end

get '/redeem' do
  Mustache.render_file('redeem', static_params)
end

get '/buyCards' do
  Mustache.render_file('buyCards', static_params)
end

# Serve static files
set :public_folder, File.join(File.dirname(__FILE__), '..', '..', 'shared', 'static')
get '/' do
  File.read(File.join(File.dirname(__FILE__), '..', '..', 'shared', 'static', 'index.html'))
end
