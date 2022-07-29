using Blazorise;
using Blazorise.Bootstrap;
using Blazorise.Icons.FontAwesome;
using Ganss.XSS;
using GraphQL;
using GraphQL.Client.Abstractions;
using GraphQL.Client.Http;
using GraphQL.Client.Serializer.SystemTextJson;
using GraphQL.DataLoader;
using GraphQL.MicrosoftDI;
using GraphQL.Server;
using GraphQL.SystemTextJson;
using GraphQL.Types;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using SnapstatsOrg.Server.GraphQL;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

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

builder.Services.AddScoped<SnapstatsSchema>();
var mongoUrl = builder.Configuration["MongoUrl"];
builder.Services.AddSingleton(new MongoClient(mongoUrl).GetDatabase("snapstats"));

builder.Services.AddGraphQL(builder => builder
    .AddHttpMiddleware<SnapstatsSchema>()
    .AddSystemTextJson()
    .AddErrorInfoProvider(opt => opt.ExposeExceptionStackTrace = true)
    .AddApolloTracing()
    .AddSchema<SnapstatsSchema>()
    .AddGraphTypes(typeof(SnapstatsSchema).Assembly));

builder.Services.AddBlazorise()
                .AddBootstrapProviders()
                .AddFontAwesomeIcons();

builder.Services.AddScoped<IHtmlSanitizer, HtmlSanitizer>(x =>
{
    var sanitizer = new HtmlSanitizer();
    //sanitizer.AllowedAttributes.Add("class");
    return sanitizer;
});

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

builder.Services.AddLogging(builder => builder.AddConsole());

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    //app.UseWebAssemblyDebugging();
}
else
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseWebSockets();
app.UseGraphQL<SnapstatsSchema>();
app.UseGraphQLPlayground("/ui/playground");

app.UseBlazorFrameworkFiles();
app.UseStaticFiles();

app.UseRouting();


app.MapRazorPages();
app.MapControllers();
app.MapFallbackToPage("/_Host");

app.Run();
