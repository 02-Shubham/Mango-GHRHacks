import * as piexif from "piexifjs";

/**
 * Strips EXIF metadata from JPEG images to preserve whistleblower anonymity.
 * Returns the original buffer if the file format is not supported or parsing fails.
 */
export function stripImageMetadata(buffer: Buffer, mimeType: string): Buffer {
  // EXIF scrubbing is strictly supported for JPEGs currently via piexifjs
  // For PNGs/PDFs, advanced binary manipulation is required, but this covers 
  // the majority of mobile photos which embed GPS/Device data in the EXIF.
  if (mimeType !== "image/jpeg" && mimeType !== "image/jpg") {
    console.warn(`[Security] Metadata stripper bypassed: Unsupported mime type ${mimeType}. Only JPEG supported.`);
    return buffer;
  }

  try {
    const dataStr = buffer.toString("binary");
    
    // Check if it has EXIF data
    if (dataStr.startsWith("\xff\xd8")) { 
      // We load the structural representation of the JPEG as a base64 Data URI
      // because piexifjs expects either a Data URI or a Node Buffer (in some versions, string)
      // The safest way is converting to base64 Data URI for standard usage.
      const base64Str = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      
      // Remove all EXIF segments entirely
      const scrubbedDataUri = piexif.remove(base64Str);
      
      // Convert back to Buffer
      const base64Data = scrubbedDataUri.replace(/^data:image\/jpeg;base64,/, "");
      return Buffer.from(base64Data, "base64");
    }
  } catch (error) {
    console.error("[Security] Warning: Failed to parse/strip EXIF data, returning original buffer.", error);
  }

  return buffer;
}
