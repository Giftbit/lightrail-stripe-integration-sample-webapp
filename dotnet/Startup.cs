using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Nustache.Core;

namespace dotnet
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
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

            // Similar to app.UseStaticFiles() and app.UseDefaultFiles()
            app.UseFileServer(new FileServerOptions()
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "..", "shared", "static")),
                EnableDirectoryBrowsing = false
            });

            app.UseMvc(routes =>
            {
                routes.MapGet("manageAccount", GenerateMustacheRequestDelegate("manageAccount"));
                routes.MapGet("buyCards", GenerateMustacheRequestDelegate("buyCards"));
                routes.MapGet("redeem", GenerateMustacheRequestDelegate("redeem"));
                routes.MapGet("checkout", GenerateMustacheRequestDelegate("checkout"));

                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");
            });
        }

        private RequestDelegate GenerateMustacheRequestDelegate(string viewName) {
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
                    shopperToken = "TODO"   // TODO
                };
                await context.Response.WriteAsync(Render.FileToString(filePath, data));
            };
        }
    }
}
