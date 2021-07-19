using GraphQL;
using GraphQL.Client.Abstractions;
using GraphQL.Client.Http;
using GraphQL.Client.Serializer.SystemTextJson;
using GraphQL.DataLoader;
using GraphQL.Execution;
using GraphQL.Server;
using GraphQL.SystemTextJson;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SnapstatsOrg.Shared.GraphQL;
using System;
using System.Data.Common;
using System.Reflection;
using Toolbelt.Blazor.Extensions.DependencyInjection;

namespace SnapstatsOrg.Server
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(environment.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{environment.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            if (environment.IsDevelopment())
            {
                builder.AddUserSecrets<Startup>();
            }

            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Environment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddScoped<IGraphQLClient>(provider => {
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

            services.AddScoped<SnapstatsSchema>();
            services.AddSingleton<IDataLoaderContextAccessor, DataLoaderContextAccessor>();
            services.AddSingleton<IDocumentExecuter>(new DocumentExecuter());
            services.AddSingleton<IDocumentWriter>(new DocumentWriter());
            services.AddSingleton<IErrorInfoProvider>(services =>
                {
                    return new ErrorInfoProvider(new ErrorInfoProviderOptions { ExposeExceptionStackTrace = true });
                });

            services.AddGraphQL(options => {
                    options.EnableMetrics = true;
                })
                .AddGraphTypes(Assembly.GetAssembly(typeof(SnapstatsSchema)), ServiceLifetime.Scoped)
                .AddSystemTextJson()
                .AddErrorInfoProvider(opt => opt.ExposeExceptionStackTrace = Environment.IsDevelopment())
                .AddDataLoader()
                .AddWebSockets();

            var builder = new DbConnectionStringBuilder()
            {
                ConnectionString = Configuration["ConnectionStrings"]
            };
            string? AuthKey = null;
            Uri? ServiceEndpoint = null;
            if (builder.TryGetValue("AccountKey", out object? key))
            {
                AuthKey = key.ToString();
            }
            if (builder.TryGetValue("AccountEndpoint", out object? uri))
            {
                if (uri is not null)
                {
                    ServiceEndpoint = new Uri(uri.ToString() ?? "");
                }
            }
            if (AuthKey is not null && ServiceEndpoint is not null)
            {
                services.AddSingleton<IDocumentClient>(new DocumentClient(ServiceEndpoint, AuthKey));
            }

            services.AddHeadElementHelper();

            services.AddRazorPages();
            services.AddControllersWithViews();
            services.AddCors(options =>
                options.AddPolicy("AllowAll", p => p.AllowAnyOrigin()
                                                    .AllowAnyMethod()
                                                    .AllowAnyHeader()));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app)
        {
            app.UseCors("AllowAll");

            if (Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebAssemblyDebugging();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();

            app.UseWebSockets();
            
            app.UseGraphQLWebSockets<SnapstatsSchema>();
            app.UseGraphQL<SnapstatsSchema>();
            app.UseGraphQLPlayground("/ui/playground");

            app.UseHeadElementServerPrerendering();

            app.UseBlazorFrameworkFiles();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
                endpoints.MapControllers();
                endpoints.MapFallbackToPage("/_Host");
            });
        }
    }
}
