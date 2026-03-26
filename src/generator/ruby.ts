import { ProjectConfig } from '../types';

export function getRubyAppRb(config: ProjectConfig): string {
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

export function getRubyGemfile(config: ProjectConfig): string {
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
