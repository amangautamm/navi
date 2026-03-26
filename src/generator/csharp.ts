import { ProjectConfig } from '../types';

export function getCsharpProgram(config: ProjectConfig): string {
  return `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => new { status = "ok", message = "🧭 Navi ASP.NET Core is running!" });

app.Run();
`;
}

export function getCsharpCsproj(config: ProjectConfig): string {
  return `<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RootNamespace>${config.projectName.replace(/[\\s-]/g, "")}</RootNamespace>
  </PropertyGroup>

</Project>
`;
}
