using Blazorise;
using Blazorise.Bootstrap;
using Blazorise.Icons.FontAwesome;
using Ganss.XSS;
using GraphQL.Client.Abstractions;
using GraphQL.Client.Http;
using GraphQL.Client.Serializer.SystemTextJson;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Net.Http;

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

builder.Services.AddBlazorise()
                .AddBootstrapProviders()
                .AddFontAwesomeIcons();

builder.Services.AddEmptyProviders();

builder.Services.AddScoped<IHtmlSanitizer, HtmlSanitizer>(x =>
{
    var sanitizer = new HtmlSanitizer();
    //sanitizer.AllowedAttributes.Add("class");
    return sanitizer;
});

builder.Services.AddSingleton(new HttpClient
{
    BaseAddress = new Uri(builder.HostEnvironment.BaseAddress)
});

await builder.Build().RunAsync();
