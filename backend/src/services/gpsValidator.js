import exifr from 'exifr';

// Haversine formula to calculate the distance between two lat/lon points in meters
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); 
}

/**
 * Validates the GPS data from an image against the provided device coordinates.
 * @param {string} base64Image The base64 data URL from the client
 * @param {number} deviceLat The latitude provided by the device
 * @param {number} deviceLon The longitude provided by the device
 * @returns {Promise<Object>} The validation result with heuristics
 */
export const validateGPSData = async (base64Image, deviceLat, deviceLon) => {
  const result = {
    isValid: true,
    distanceMeters: null,
    timeDifferenceHours: null,
    reason: null
  };

  try {
    // 1. Validate inputs
    if (!base64Image || deviceLat == null || deviceLon == null) {
      result.isValid = false;
      result.reason = "Missing device GPS data or image";
      return result;
    }

    // Attempt to read just the base64 payload
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");  
    const buffer = Buffer.from(base64Data, 'base64'); // converts the text-based base64 string into raw binary data
    
    // 2. Parse EXIF data using exifr
    // EXIF (Exchangeable Image File Format) is a standard for storing metadata in image files, 
    // including camera settings, date/time, and GPS coordinates.
    // parse() returns null if no valid metadata is found
    const exifData = await exifr.parse(buffer, { gps: true, tiff: true });
    
    // 3. Strict Check: If no GPS EXIF Data found
    if (!exifData || exifData.latitude == null || exifData.longitude == null) {
      result.isValid = false;
      result.reason = "No EXIF(GPS) Data Found";
      return result;
    }

    const { latitude: exifLat, longitude: exifLon, DateTimeOriginal } = exifData;

    // 4. Calculate Distance Mismatch
    const distanceMeters = calculateDistanceMeters(deviceLat, deviceLon, exifLat, exifLon);
    result.distanceMeters = distanceMeters;

    const reasons = [];

    if (distanceMeters > 500) {
      result.isValid = false;
      reasons.push(`Distance mismatch: ${distanceMeters}m (Limit: 500m)`);
    }

    // 5. Calculate Time Mismatch
    if (DateTimeOriginal) {
       const photoDate = new Date(DateTimeOriginal);
       const now = new Date();
       const ageMilli = now - photoDate;
       const ageHours = ageMilli / (1000 * 60 * 60);
       
       result.timeDifferenceHours = parseFloat(ageHours.toFixed(2));

       if (ageHours > 48) {
         result.isValid = false;
         reasons.push(`Photo is ${result.timeDifferenceHours} hours old (Limit: 48h)`);
       }
    } else {
       // Strict check: if photo has GPS but no timestamp, fail validation
       result.isValid = false;
       reasons.push("Photo missing EXIF timestamp");
    }

    if (reasons.length > 0) {
      result.reason = reasons.join(' | ');
    } else {
      result.reason = "Valid EXIF(GPS) Data";
    }

    return result;

  } catch (error) {
    console.error("EXIF Parsing error:", error);
    result.isValid = false;
    result.reason = "Invalid image format or No EXIF(GPS) Data Found";
    return result;
  }
};
