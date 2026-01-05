/**
 * Image optimization utilities for better performance and SEO
 */

/**
 * Generate responsive image srcset for better performance
 * @param baseUrl - Base image URL
 * @param sizes - Array of sizes in pixels (width)
 * @returns srcset string
 */
export function generateSrcSet(baseUrl: string, sizes: number[] = [400, 800, 1200, 1600]): string {
  // Agar Supabase URL bo'lsa, transform qilish mumkin
  // Hozircha oddiy srcset qaytaramiz
  return sizes.map(size => `${baseUrl}?width=${size} ${size}w`).join(', ');
}

/**
 * Generate sizes attribute for responsive images
 * @param breakpoints - Breakpoint sizes
 * @returns sizes string
 */
export function generateSizes(breakpoints: { [key: string]: string } = {
  '(max-width: 640px)': '100vw',
  '(max-width: 1024px)': '50vw',
  'default': '33vw'
}): string {
  return Object.entries(breakpoints)
    .map(([query, size]) => query === 'default' ? size : `${query} ${size}`)
    .join(', ');
}

/**
 * Optimize image URL for Supabase Storage
 * Adds width, quality, and format parameters
 * @param url - Original image URL
 * @param options - Optimization options
 * @returns Optimized URL
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string {
  if (!url) return url;
  
  // Supabase Storage URL format
  if (url.includes('supabase.co') || url.includes('supabase')) {
    const params = new URLSearchParams();
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }
  
  return url;
}

/**
 * Generate optimized image attributes for SEO and performance
 * @param src - Image source URL
 * @param alt - Alt text (required for SEO)
 * @param options - Additional options
 * @returns Image attributes object
 */
export function getOptimizedImageAttributes(
  src: string,
  alt: string,
  options: {
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    fetchPriority?: 'high' | 'low' | 'auto';
    sizes?: string;
    srcset?: string;
  } = {}
) {
  return {
    src: options.width ? optimizeImageUrl(src, { width: options.width }) : src,
    alt: alt || 'Image', // SEO uchun alt text majburiy
    loading: options.loading || 'lazy',
    decoding: 'async' as const,
    fetchPriority: options.fetchPriority || 'auto' as const,
    ...(options.sizes && { sizes: options.sizes }),
    ...(options.srcset && { srcSet: options.srcset }),
    ...(options.width && { width: options.width }),
    ...(options.height && { height: options.height }),
  };
}

/**
 * Check if image format is supported (WebP, AVIF, etc.)
 * @returns Supported formats
 */
export function getSupportedImageFormats(): string[] {
  const formats: string[] = ['jpeg', 'png', 'gif'];
  
  // WebP support check (browser-based)
  if (typeof window !== 'undefined') {
    const canvas = document.createElement('canvas');
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      formats.push('webp');
    }
  }
  
  return formats;
}

