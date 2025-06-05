// Centralized client configuration
export interface ClientConfig {
  name: string
  subdomain: string
  primaryColor?: string
  logo?: string
  customGreeting?: string
  features?: {
    emailNotifications?: boolean
    fileUploads?: boolean
    analytics?: boolean
  }
}

// Client subdomain to configuration mapping
export const CLIENT_CONFIGS: Record<string, ClientConfig> = {
  'acme': {
    name: 'ACME Corporation',
    subdomain: 'acme',
    primaryColor: 'blue',
    customGreeting: 'Share your innovative ideas with the ACME team!',
    features: {
      emailNotifications: true,
      analytics: true
    }
  },
  'techstart': {
    name: 'TechStart Inc',
    subdomain: 'techstart',
    primaryColor: 'green',
    customGreeting: 'Got a tech breakthrough? We want to hear it!',
    features: {
      emailNotifications: true,
      fileUploads: true,
      analytics: true
    }
  },
  'localcafe': {
    name: 'Local Café',
    subdomain: 'localcafe',
    primaryColor: 'amber',
    customGreeting: 'Brewing up new ideas? Share them with us!',
    features: {
      emailNotifications: false,
      analytics: false
    }
  },
  'drsmith': {
    name: 'Dr. Smith Dental Practice',
    subdomain: 'drsmith',
    primaryColor: 'teal',
    customGreeting: 'Your practice improvement ideas are valuable to us!',
    features: {
      emailNotifications: true,
      analytics: false
    }
  },
  'demo': {
    name: 'Demo Client',
    subdomain: 'demo',
    primaryColor: 'indigo',
    customGreeting: 'This is a demo of the Local Bzz Ideas Portal!',
    features: {
      emailNotifications: false,
      fileUploads: false,
      analytics: false
    }
  }
}

// Helper functions
export function getClientConfig(subdomain: string): ClientConfig {
  const config = CLIENT_CONFIGS[subdomain.toLowerCase()]
  
  if (!config) {
    // Return default config for unknown clients
    return {
      name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Client`,
      subdomain: subdomain,
      primaryColor: 'gray',
      customGreeting: 'Share your creative ideas with us!',
      features: {
        emailNotifications: false,
        fileUploads: false,
        analytics: false
      }
    }
  }
  
  return config
}

export function getClientName(subdomain: string): string {
  return getClientConfig(subdomain).name
}

export function getAllClients(): ClientConfig[] {
  return Object.values(CLIENT_CONFIGS)
}

export function isValidClient(subdomain: string): boolean {
  return subdomain.toLowerCase() in CLIENT_CONFIGS
}

// Simple mapping for backwards compatibility
export const CLIENT_MAPPING: Record<string, string> = Object.fromEntries(
  Object.entries(CLIENT_CONFIGS).map(([key, config]) => [key, config.name])
) 