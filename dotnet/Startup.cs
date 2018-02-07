using Lightrail;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Nustache.Core;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace dotnet
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            // Route static files.
            app.UseFileServer(new FileServerOptions()
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "..", "shared", "static")),
                EnableDirectoryBrowsing = false
            });

            app.UseMvc(routes =>
            {
                // Route Mustache views.
                routes.MapGet("manageAccount", GenerateMustacheRequestDelegate("manageAccount"));
                routes.MapGet("buyCards", GenerateMustacheRequestDelegate("buyCards"));
                routes.MapGet("redeem", GenerateMustacheRequestDelegate("redeem"));
                routes.MapGet("checkout", GenerateMustacheRequestDelegate("checkout"));

                // Route controllers (ie: the REST API).
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }

        /// <summary>
        /// Generate a RequestDelegate that renders a Mustache view.
        /// </summary>
        private RequestDelegate GenerateMustacheRequestDelegate(string viewName) {
            var lightrail = new LightrailClient
            {
                ApiKey = Environment.GetEnvironmentVariable("LIGHTRAIL_API_KEY"),
                SharedSecret = Environment.GetEnvironmentVariable("LIGHTRAIL_SHARED_SECRET")
            };

            return async (context) =>
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "shared", "views", $"{viewName}.html");
                var data = new {
                    title = Environment.GetEnvironmentVariable("TITLE"),
                    orderTotal = int.Parse(Environment.GetEnvironmentVariable("ORDER_TOTAL")),
                    orderTotalDisplay = int.Parse(Environment.GetEnvironmentVariable("ORDER_TOTAL")) / 100.0,
                    currency = "USD",
                    stripePublicKey = Environment.GetEnvironmentVariable("STRIPE_PUBLISHABLE_KEY"),
                    shopperId = Environment.GetEnvironmentVariable("SHOPPER_ID"),
                    shopperToken = lightrail.GenerateShopperToken(new Lightrail.Model.ContactIdentifier { ShopperId = Environment.GetEnvironmentVariable("SHOPPER_ID")})
                };
                await context.Response.WriteAsync(Render.FileToString(filePath, data));
            };
        }
    }
}
