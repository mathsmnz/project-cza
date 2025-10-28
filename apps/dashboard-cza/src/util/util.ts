/**
 * Formats bytes into a human-readable string (KB, MB, GB, etc.).
 * @param bytes - The number of bytes.
 * @param decimals - The number of decimal places.
 */
export const formatBytes = (bytes : number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * A JavaScript function to format ISO-like date strings.
 *
 * @param dateString The ISO or ISO-like date string from the API.
 * @returns A formatted date string for the 'pt-BR' locale or a fallback message.
 */
export const formatDisplayDate = (dateString: string | null): string => {
  // 1. Guard against null, undefined, or empty values
  if (!dateString) {
    return 'Data não disponível';
  }

  // 2. Attempt to create a date object. The 'new Date()' constructor is the
  //    source of the problem, but it's our only tool without libraries.
  //    We must validate its output immediately.
  const date = new Date(dateString);

  // 3. THE CRITICAL CHECK: Verify if the date is valid.
  //    'Invalid Date' returns NaN for its time value.
  if (isNaN(date.getTime())) {
    // If parsing fails, log an error and return a safe message.
    console.error(`Failed to parse invalid date string: "${dateString}"`);
    return 'Data inválida';
  }

  // 4. If the date is valid, proceed with the original formatting logic.
  //    This part of your code was always correct.
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    // It's good practice to specify the time zone for consistency
    timeZone: 'America/Sao_Paulo',
  };

  try {
    return date.toLocaleString('pt-BR', options);
  } catch (error) {
    console.error(`Error formatting date for locale 'pt-BR':`, error);
    return 'Erro de formatação';
  }
}
