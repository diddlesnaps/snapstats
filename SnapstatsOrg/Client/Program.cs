using Ganss.XSS;
using GraphQL.Client.Abstractions;
using GraphQL.Client.Http;
using GraphQL.Client.Serializer.SystemTextJson;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Toolbelt.Blazor.Extensions.DependencyInjection;

namespace SnapstatsOrg.Client
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);

            builder.Services.AddScoped<IGraphQLClient>(provider => {
                var navman = provider.GetService<NavigationManager>();
                var graphQlEndpoint = navman?.ToAbsoluteUri("/graphql");
                
                if (graphQlEndpoint is null) throw new Exception("Fatal: No GraphQL Endpoint!");

                var graphQlOptions = new GraphQLHttpClientOptions
                {
                    EndPoint = graphQlEndpoint
                };
                var graphQlClient = new GraphQLHttpClient(graphQlOptions, new SystemTextJsonSerializer());
                return graphQlClient;
            });

            builder.Services.AddScoped<IHtmlSanitizer, HtmlSanitizer>(x =>
            {
                var sanitizer = new HtmlSanitizer();
                //sanitizer.AllowedAttributes.Add("class");
                return sanitizer;
            });

            builder.Services.AddHeadElementHelper();

            await builder.Build().RunAsync();
        }

    }
}
