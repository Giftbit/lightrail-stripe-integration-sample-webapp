require 'bundler/setup'
require 'dotenv'
require 'sinatra'
require 'lightrail_client'
require 'lightrail_stripe'
require 'mustache'
require 'oj'
require 'stripe'
require 'httplog'

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

# Configure Lightrail and Stripe.
Lightrail::api_key = ENV['LIGHTRAIL_API_KEY']
Lightrail::shared_secret = ENV['LIGHTRAIL_SHARED_SECRET']
Stripe.api_key = ENV['STRIPE_API_KEY']

# Configuration for the demo.
static_params = {
    title: ENV['TITLE'],
    orderTotal: ENV['ORDER_TOTAL'].to_i,
    orderTotalDisplay: '%.2f' % (ENV['ORDER_TOTAL'].to_i / 100),
    currency: 'USD',
    stripePublicKey: ENV['STRIPE_PUBLISHABLE_KEY'],
    shopperId: ENV['SHOPPER_ID'],
    shopperToken: Lightrail::ShopperTokenFactory.generate({shopper_id: ENV['SHOPPER_ID']})
}

# Configure Sinatra.
set :port, 3000
Mustache.template_path = File.join(__dir__, '..', '..', 'shared', 'views')
Mustache.template_extension = 'html'

post '/rest/simulate' do
  request.body.rewind
  request_payload = JSON.parse request.body.read

  split_tender_params = {
      userSuppliedId: SecureRandom.uuid,
      nsf: false,
      shopperId: request_payload['shopperId'],
      currency: request_payload['currency'],
      amount: request_payload['amount']
  }

  # Try to charge the whole thing to lightrail, and we'll use the amount that would actually get
  # charged when we do the real transaction.
  lightrail_share = split_tender_params[:amount]

  split_tender_charge = Lightrail::StripeLightrailSplitTenderCharge.simulate(split_tender_params, lightrail_share)

  # json split_tender_charge.lightrail_charge
  content_type :json
  Oj::dump split_tender_charge.lightrail_charge
end

post '/rest/charge' do
  split_tender_params = {
      amount: static_params[:orderTotal],
      currency: static_params[:currency],
      source: params[:source],
      shopperId: static_params[:shopperId],
      userSuppliedId: SecureRandom.uuid
  }

  # The amount to actually charge to Lightrail, as determined in the simulation.
  lightrail_share = params[:'lightrail-amount']
  if lightrail_share < 0
    halt 400, 'Invalid value for Lightrail\'s share of the transaction'
  end

  split_tender_charge = Lightrail::StripeLightrailSplitTenderCharge.create(split_tender_params, lightrail_share)

  Mustache.render_file('checkoutComplete', {
      lightrailTransactionValue: '%.2f' % (split_tender_charge.payment_summary.lightrail_amount / -100),
      stripeChargeValue: '%.2f' % (split_tender_charge.payment_summary.stripe_amount / 100)
  })
end

post '/rest/createAccount' do
  request.body.rewind
  request_payload = JSON.parse request.body.read
  shopper_id = request_payload['shopperId']

  Lightrail::Account.create({
    shopperId: shopper_id,
    userSuppliedId: "accountcard-#{shopper_id}-#{static_params[:currency]}",
    currency: static_params[:currency]
  })

  "account created (or already exists) for shopperId #{static_params[:shopperId]}"
end

post '/rest/creditAccount' do
  request.body.rewind
  request_payload = JSON.parse request.body.read
  shopper_id = request_payload['shopperId']
  value = request_payload['value'].to_i

  Lightrail::Account.charge({ value: value, currency: static_params[:currency], shopperId: shopper_id })

  "account for shopperId #{shopper_id} funded by #{value}"
end

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
