/**
 * Returns a color based on the school rating
 * @param rating School rating (0-5)
 * @returns Hex color code
 */
export function getRatingColor(rating: number | undefined): string {
  if (!rating) return '#808080'; // Gray for no rating
  
  if (rating >= 4.5) return '#4CAF50'; // Green for excellent
  if (rating >= 4.0) return '#8BC34A'; // Light green for very good
  if (rating >= 3.5) return '#CDDC39'; // Lime for good
  if (rating >= 3.0) return '#FFEB3B'; // Yellow for average
  if (rating >= 2.5) return '#FFC107'; // Amber for below average
  if (rating >= 2.0) return '#FF9800'; // Orange for poor
  return '#F44336'; // Red for very poor
}

/**
 * Returns a contrasting text color (black or white) based on background color
 * @param hexColor Hex color code
 * @returns '#ffffff' or '#000000'
 */
export function getContrastColor(hexColor: string): string {
  // Remove the hash if it exists
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance - human eye favors green color
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
}