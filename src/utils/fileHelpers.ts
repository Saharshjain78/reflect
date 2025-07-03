// Utility functions for file uploads and error handling

/**
 * Detailed file format validation
 */
export const validateFileFormat = (file: File): { 
  isValid: boolean;
  fileType: 'image' | 'video' | 'audio' | 'unknown';
  warnings: string[];
  recommendations: string[];
} => {
  // Identify file type
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  
  // Define supported formats
  const supportedImageFormats = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
    'image/bmp', 'image/svg+xml'
  ];
  
  const limitedSupportImageFormats = [
    'image/tiff', 'image/heic', 'image/heif', 'image/jfif', 'image/avif'
  ];
  
  const supportedVideoFormats = [
    'video/mp4', 'video/webm', 'video/quicktime'
  ];
  
  const limitedSupportVideoFormats = [
    'video/x-msvideo', 'video/x-ms-wmv', 'video/mpeg', 'video/3gpp', 
    'video/ogg', 'video/x-flv', 'video/x-matroska'
  ];
  
  const supportedAudioFormats = [
    'audio/mpeg', 'audio/mp4', 'audio/wav'
  ];
  
  const limitedSupportAudioFormats = [
    'audio/ogg', 'audio/webm', 'audio/flac', 'audio/aac'
  ];
  
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let fileType: 'image' | 'video' | 'audio' | 'unknown' = 'unknown';
  
  // Determine file type
  if (isImage) fileType = 'image';
  else if (isVideo) fileType = 'video';
  else if (isAudio) fileType = 'audio';
  
  // Get file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  // Check if format is fully supported
  const isFullySupported = 
    (isImage && supportedImageFormats.includes(file.type)) ||
    (isVideo && supportedVideoFormats.includes(file.type)) ||
    (isAudio && supportedAudioFormats.includes(file.type));
    
  // Check if format has limited support
  const hasLimitedSupport = 
    (isImage && limitedSupportImageFormats.includes(file.type)) ||
    (isVideo && limitedSupportVideoFormats.includes(file.type)) ||
    (isAudio && limitedSupportAudioFormats.includes(file.type));
  
  // Add warnings for potentially problematic files
  if (!isFullySupported && !hasLimitedSupport && (isImage || isVideo || isAudio)) {
    warnings.push(`Format "${file.type}" may not be fully supported by all browsers.`);
    
    if (isImage) {
      recommendations.push("Convert to JPG or PNG for best compatibility.");
    } else if (isVideo) {
      recommendations.push("Convert to MP4 (H.264) format for best compatibility.");
    } else if (isAudio) {
      recommendations.push("Convert to MP3 format for best compatibility.");
    }
  }
  
  // Add specific format warnings
  if (isImage) {
    if (file.type === 'image/heic' || file.type === 'image/heif' || 
        extension === 'heic' || extension === 'heif') {
      warnings.push("HEIC/HEIF format has very limited browser support.");
      recommendations.push("Convert to JPG for better compatibility.");
    } else if (file.type === 'image/tiff' || extension === 'tiff' || extension === 'tif') {
      warnings.push("TIFF format has limited browser support.");
      recommendations.push("Convert to PNG for better compatibility.");
    } else if (file.type === 'image/svg+xml') {
      warnings.push("SVG may render differently across browsers.");
    }
  } else if (isVideo) {
    if (file.size > 100 * 1024 * 1024) {
      warnings.push("Video file is very large (>100MB).");
      recommendations.push("Compress video or reduce resolution for better performance.");
    }
    
    if (!file.type.includes('mp4') && !extension.includes('mp4')) {
      recommendations.push("MP4 format with H.264 encoding is recommended for best compatibility.");
    }
  } else if (isAudio) {
    if (!file.type.includes('mpeg') && !file.type.includes('mp3') && 
        !extension.includes('mp3')) {
      recommendations.push("MP3 format is recommended for best compatibility.");
    }
  }
  
  // Check file size based on type
  const sizeMB = Math.round(file.size / (1024 * 1024));
  const sizeWarningThreshold = isImage ? 10 : isVideo ? 50 : 20; // MB
  
  if (sizeMB > sizeWarningThreshold) {
    warnings.push(`File size (${sizeMB}MB) may cause performance issues.`);
    
    if (isImage) {
      recommendations.push("Resize to around 1200px width/height for optimal quality.");
    } else if (isVideo) {
      recommendations.push("Consider reducing video resolution or duration.");
    }
  }
  
  return {
    isValid: isImage || isVideo || isAudio,
    fileType,
    warnings,
    recommendations
  };
};

/**
 * Diagnose upload errors and provide helpful advice
 */
export const diagnoseUploadError = (error: any, file: File) => {
  const fileType = 
    file.type.startsWith('image/') ? 'image' :
    file.type.startsWith('video/') ? 'video' :
    file.type.startsWith('audio/') ? 'audio' : 'unknown';
  
  const sizeMB = Math.round(file.size / (1024 * 1024));
  const errorMessage = error?.message || 'Unknown error';
  
  let diagnosis = {
    title: 'Upload failed',
    cause: '',
    solution: '',
    isCommon: true
  };
  
  // Network connectivity issues
  if (!navigator.onLine) {
    diagnosis = {
      title: 'You appear to be offline',
      cause: 'Lost internet connection',
      solution: 'Check your internet connection and try again when online',
      isCommon: true
    };
  }
  // Browser storage quota issues
  else if (error.name === 'QuotaExceededError' || 
          (errorMessage.toLowerCase().includes('quota'))) {
    diagnosis = {
      title: 'Browser storage is full',
      cause: 'Your browser has reached its storage limit',
      solution: 'Clear your browser cache and data or use a smaller file',
      isCommon: true
    };
  }
  // File reading errors (corruption)
  else if (errorMessage.includes('Failed to read file') || 
          error.name === 'NotReadableError') {
    diagnosis = {
      title: 'File cannot be read',
      cause: 'The file appears to be corrupted or uses an unsupported format',
      solution: fileType === 'image' 
        ? 'Try re-saving the image as JPG or PNG using an image editor'
        : fileType === 'video'
          ? 'Try converting the video to MP4 using a video converter tool'
          : 'Try converting the audio to MP3 using an audio converter tool',
      isCommon: true
    };
  }
  // Security errors (CORS)
  else if (error.name === 'SecurityError' || 
          errorMessage.toLowerCase().includes('cross-origin')) {
    diagnosis = {
      title: 'Security restriction',
      cause: 'Browser security prevented access to the file',
      solution: 'If downloaded from another site, save to your computer first, then upload the local copy',
      isCommon: true
    };
  }
  // Format-specific issues
  else if (fileType === 'image' && 
          (file.name.toLowerCase().endsWith('.heic') || 
           file.name.toLowerCase().endsWith('.heif'))) {
    diagnosis = {
      title: 'HEIC/HEIF format issue',
      cause: 'This image format has limited browser support',
      solution: 'Convert the image to JPG format before uploading',
      isCommon: true
    };
  }
  // Timeout issues
  else if (errorMessage.toLowerCase().includes('timeout') || 
          errorMessage.toLowerCase().includes('timed out')) {
    diagnosis = {
      title: 'Upload timed out',
      cause: sizeMB > 50 
        ? 'The file is too large to upload quickly' 
        : 'Your connection may be slow or unstable',
      solution: sizeMB > 50
        ? 'Try uploading a smaller file or compress this one'
        : 'Check your internet connection and try again',
      isCommon: true
    };
  }
  // Memory issues with large files
  else if ((sizeMB > 100) && 
          (errorMessage.toLowerCase().includes('memory') || 
           error.name === 'OutOfMemoryError')) {
    diagnosis = {
      title: 'Not enough memory',
      cause: 'The file is too large for your browser to process',
      solution: 'Reduce the file size before uploading',
      isCommon: true
    };
  }
  // Default fallbacks by file type
  else {
    if (fileType === 'image') {
      diagnosis = {
        title: 'Image upload failed',
        cause: 'The image could not be processed',
        solution: 'Try using JPG format for photos or PNG for graphics with transparency',
        isCommon: false
      };
    } else if (fileType === 'video') {
      diagnosis = {
        title: 'Video upload failed',
        cause: 'The video could not be processed',
        solution: 'Try converting to MP4 (H.264) format, which is widely supported',
        isCommon: false
      };
    } else if (fileType === 'audio') {
      diagnosis = {
        title: 'Audio upload failed',
        cause: 'The audio file could not be processed',
        solution: 'Try using MP3 format, which is widely supported',
        isCommon: false
      };
    } else {
      diagnosis = {
        title: 'Upload failed',
        cause: 'The file could not be processed',
        solution: 'Please try a different file or format',
        isCommon: false
      };
    }
  }
  
  return {
    ...diagnosis,
    originalError: errorMessage,
    fileInfo: {
      name: file.name,
      type: file.type,
      size: sizeMB
    }
  };
};

/**
 * Format a nice user-friendly error message for file upload failures
 */
export const formatUploadErrorMessage = (error: any, file: File): string => {
  const diagnosis = diagnoseUploadError(error, file);
  
  return `${diagnosis.title}

ISSUE: ${diagnosis.cause}

SOLUTION: ${diagnosis.solution}

${diagnosis.isCommon ? 'This is a common issue that can be easily fixed.' : ''}

File details: ${diagnosis.fileInfo.name} (${diagnosis.fileInfo.type}, ${diagnosis.fileInfo.size}MB)`;
};
