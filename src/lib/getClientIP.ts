/**
 * Gets the client's IP address for view tracking
 * Uses a free IP detection service
 */
export async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
  } catch (error) {
    console.warn('Failed to get client IP:', error);
  }
  return null;
}