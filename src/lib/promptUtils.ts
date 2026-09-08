/**
 * Extract {{variable}} placeholders from a prompt template string.
 * Returns an array of unique variable names.
 */
export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const variables = new Set<string>()
  let match
  while ((match = regex.exec(content)) !== null) {
    variables.add(match[1].trim())
  }
  return Array.from(variables)
}

/**
 * Replace {{variable}} placeholders with actual values.
 */
export function fillVariables(content: string, values: Record<string, string>): string {
  let result = content
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`)
  }
  return result
}

/**
 * Check if a prompt template has any variables.
 */
export function hasVariables(content: string): boolean {
  return /\{\{([^}]+)\}\}/.test(content)
}
