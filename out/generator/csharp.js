"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCsharpProgram = getCsharpProgram;
exports.getCsharpCsproj = getCsharpCsproj;
function getCsharpProgram(config) {
    return `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/health", () => new { status = "ok", message = "🧭 Navi ASP.NET Core is running!" });

app.Run();
`;
}
function getCsharpCsproj(config) {
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
//# sourceMappingURL=csharp.js.map