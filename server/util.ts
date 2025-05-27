/**
 * Utility functies voor de server
 */

/**
 * Log een bericht met tijdstempel en bron
 */
export function log(message: string, source: string = 'express') {
  const formattedTime = new Date().toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
} 