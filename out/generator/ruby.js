"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRubyAppRb = getRubyAppRb;
exports.getRubyGemfile = getRubyGemfile;
function getRubyAppRb(config) {
    const { backendFramework } = config;
    if (backendFramework === 'Sinatra') {
        return `require 'sinatra'
require 'json'

set :port, 4567

get '/health' do
  content_type :json
  { status: 'ok', message: '🧭 Navi Sinatra is running!' }.to_json
end
`;
    }
    // Ruby on Rails (simplified fallback since Rails has CLI generation)
    return `# Rails requires: rails new ${config.projectName}
def health_check
  render json: { status: 'ok', message: '🧭 Navi Rails project generated via instructions!' }
end
`;
}
function getRubyGemfile(config) {
    const { backendFramework } = config;
    if (backendFramework === 'Sinatra') {
        return `source 'https://rubygems.org'

gem 'sinatra'
gem 'puma'
`;
    }
    return `source 'https://rubygems.org'

gem 'rails', '~> 7.1.0'
`;
}
//# sourceMappingURL=ruby.js.map