using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;

namespace dotnet.Controllers
{
    public class RestApiController : Controller
    {
        [HttpGet("/rest/charge")]
        public string Charge()
        {
            throw new NotImplementedException();
        }
        
        [HttpGet("/rest/simulate")]
        public string Simulate()
        {
            throw new NotImplementedException();
        }
        
        
        [HttpGet("/rest/createAccount")]
        public string CreateAccount()
        {
            throw new NotImplementedException();
        }
        
        
        [HttpGet("/rest/creditAccount")]
        public string CreditAccount()
        {
            throw new NotImplementedException();
        }
    }
}
