#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["SnapstatsOrg/Server/SnapstatsOrg.Server.csproj", "SnapstatsOrg/Server/"]
COPY ["SnapstatsOrg/Client/SnapstatsOrg.Client.csproj", "SnapstatsOrg/Client/"]
COPY ["SnapstatsOrg/Shared/SnapstatsOrg.Shared.csproj", "SnapstatsOrg/Shared/"]
RUN dotnet restore "SnapstatsOrg/Server/SnapstatsOrg.Server.csproj"
COPY . .
WORKDIR "/src/SnapstatsOrg/Server"
RUN dotnet build "SnapstatsOrg.Server.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SnapstatsOrg.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:5001/
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SnapstatsOrg.Server.dll"]