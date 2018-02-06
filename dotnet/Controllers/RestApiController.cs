using Lightrail;
using Lightrail.Model;
using Lightrail.Params;
using Lightrail.Stripe;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Newtonsoft.Json;
using Nustache.Core;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dotnet.Controllers
{
    public class RestApiController : Controller
    {
        private readonly string _currency = "USD";
        private readonly LightrailClient _lightrail = new LightrailClient
        {
            ApiKey = Environment.GetEnvironmentVariable("LIGHTRAIL_API_KEY")
        };
        
        [HttpPost("/rest/simulate")]
        public async Task<IActionResult> Simulate([FromBody] SimulateBody body)
        {
            Console.WriteLine("simulate body=" + JsonConvert.SerializeObject(body));

            var service = new StripeLightrailSplitTenderService(_lightrail);
            var summary = await service.Simulate(new StripeLightrailSplitTenderSimulateOptions
            {
                UserSuppliedId = Guid.NewGuid().ToString(),
                Nsf = false,
                ShopperId = body.ShopperId,
                Currency = body.Currency,
                Amount = body.Amount,
                LightrailShare = body.Amount
            });

            return Json(summary.LightrailTransaction);
        }

        [HttpPost("/rest/charge")]
        public async Task<IActionResult> Charge([FromForm] ChargeBody body)
        {
            Console.WriteLine("charge body=" + JsonConvert.SerializeObject(body));

            var service = new StripeLightrailSplitTenderService(_lightrail);
            var summary = await service.Create(new StripeLightrailSplitTenderCreateOptions
            {
                Amount = body.Amount,
                Currency = body.Currency,
                Source = body.Source,
                ShopperId = body.ShopperId,
                UserSuppliedId = Guid.NewGuid().ToString(),
                LightrailShare = body.LightrailAmount
            });

            var viewPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "shared", "views", $"checkoutComplete.html");
            var viewData = new
            {
                lightrailTransactionValue = String.Format("{0:F2}", summary.LightrailAmount / -100.0),
                stripeChargeValue = String.Format("{0:F2}", summary.StripeAmount / 100.0)
            };
            return Content(Render.FileToString(viewPath, viewData), "text/html");
        }
        
        [HttpPost("/rest/createAccount")]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountBody body)
        {
            Console.WriteLine("createAccount body=" + JsonConvert.SerializeObject(body));

            var card = await _lightrail.Accounts.CreateAccount(
                new ContactIdentifier { ShopperId = body.ShopperId },
                new CreateAccountCardParams
                {
                    UserSuppliedId = $"accountcard-{body.ShopperId}-{_currency}",
                    Currency = _currency
                });

            return Content($"account created (or already exists) for shopperId {body.ShopperId}");
        }
        
        
        [HttpPost("/rest/creditAccount")]
        public async Task<IActionResult> CreditAccount([FromBody] CreditAccountBody body)
        {
            Console.WriteLine("creditAccount body=" + JsonConvert.SerializeObject(body));

            if (body.Value <= 0)
            {
                return new ContentResult
                {
                    ContentType = "text/plain",
                    Content = "value must be > 0",
                    StatusCode = 400
                };
            }

            var transaction = await _lightrail.Accounts.CreateTransaction(
                new ContactIdentifier { ShopperId = body.ShopperId },
                new CreateTransactionParams
                {
                    Value = body.Value,
                    Currency = _currency,
                    UserSuppliedId = Guid.NewGuid().ToString()

                }
            );
            return Content($"account for shopperId {body.ShopperId} funded by {body.Value}");
        }
    }

    public class SimulateBody
    {
        public string ShopperId { get; set; }
        public string Currency { get; set; }
        public long Amount { get; set; }
    }

    public class ChargeBody
    {
        public string ShopperId { get; set; }
        public string Currency { get; set; }
        public string Source { get; set; }
        public long Amount { get; set; }
        public long LightrailAmount { get; set; }
    }

    public class CreateAccountBody
    {
        public string ShopperId { get; set; }
    }

    public class CreditAccountBody
    {
        public string ShopperId { get; set; }
        public long Value { get; set; }
    }
}
