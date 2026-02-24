// Cache for Google Maps API loading
let googleMapsPromise = null;
let isPreloading = false;
let preloadTimeout = null;
let componentsPromise = null;

// Preload Google Maps API immediately when this module is imported
const preloadGoogleMaps = () => {
    if (typeof window === 'undefined') return; // SSR check
    
    const apiKey = import.meta.env.VITE_APP_MAP_API;
    if (!apiKey) {
        console.warn('Google Maps API key not found in environment variables');
        return;
    }

    // Start preloading immediately
    if (!isPreloading && !googleMapsPromise) {
        isPreloading = true;
        loadGoogleMaps(apiKey).catch(() => {
            // Silent fail for preloading
            isPreloading = false;
        });
    }
};

// Preload React Google Maps components
export const preloadReactGoogleMapsComponents = async () => {
    if (componentsPromise) {
        return componentsPromise;
    }

    componentsPromise = new Promise(async (resolve, reject) => {
        try {
            // Ensure Google Maps API is loaded first
            await loadGoogleMaps(import.meta.env.VITE_APP_MAP_API);
            
            // Preload React Google Maps components
            const { GoogleMap, StandaloneSearchBox, MarkerF } = await import('@react-google-maps/api');
            
            console.log('React Google Maps components preloaded successfully');
            resolve({ GoogleMap, StandaloneSearchBox, MarkerF });
        } catch (error) {
            console.error('Failed to preload React Google Maps components:', error);
            reject(error);
        }
    });

    return componentsPromise;
};

// Optimized Google Maps loading with instant fallback
export const loadGoogleMaps = (apiKey) => {
    if (googleMapsPromise) {
        return googleMapsPromise;
    }

    // If already loaded, resolve immediately
    if (window.google && window.google.maps) {
        console.log('Google Maps API already loaded');
        return Promise.resolve();
    }

    googleMapsPromise = new Promise((resolve, reject) => {
        // Check for existing script first
        const existingScript = document.querySelector(
            `script[src*="maps.googleapis.com/maps/api/js"]`
        );

        if (existingScript) {
            console.log('Google Maps script already exists, waiting for load');
            
            // If script is already loaded
            if (window.google && window.google.maps) {
                resolve();
                return;
            }

            // Wait for existing script to load
            const checkLoaded = () => {
                if (window.google && window.google.maps) {
                    console.log('Existing Google Maps script loaded');
                    resolve();
                } else {
                    setTimeout(checkLoaded, 50); // Check every 50ms
                }
            };
            
            checkLoaded();
            return;
        }

        // Create new script with optimized loading
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;

        // Set up global callback for instant loading
        window.initGoogleMaps = () => {
            console.log('Google Maps API loaded successfully via callback');
            resolve();
            delete window.initGoogleMaps;
        };

        // Fallback timeout
        const timeoutId = setTimeout(() => {
            if (window.google && window.google.maps) {
                console.log('Google Maps loaded after timeout');
                resolve();
            } else {
                console.error('Google Maps API loading timeout');
                reject(new Error('Google Maps API loading timeout'));
            }
        }, 10000); // 10 second timeout

        script.onload = () => {
            clearTimeout(timeoutId);
            if (window.google && window.google.maps) {
                console.log('Google Maps API loaded successfully');
                resolve();
            } else {
                // Wait a bit more for initialization
                setTimeout(() => {
                    if (window.google && window.google.maps) {
                        resolve();
                    } else {
                        reject(new Error('Google Maps API failed to initialize'));
                    }
                }, 100);
            }
        };

        script.onerror = () => {
            clearTimeout(timeoutId);
            console.error('Google Maps API script failed to load');
            reject(new Error('Failed to load Google Maps API'));
        };

        console.log('Appending Google Maps script to document');
        document.head.appendChild(script);
    });

    return googleMapsPromise;
};

// Enhanced check for Google Maps availability
export const isGoogleMapsLoaded = () => {
    return !!(window.google && window.google.maps && window.google.maps.places);
};

// Check if Google Maps is currently loading
export const isGoogleMapsLoading = () => {
    return !!googleMapsPromise && !isGoogleMapsLoaded();
};

// Force reload Google Maps (useful for debugging)
export const reloadGoogleMaps = (apiKey) => {
    googleMapsPromise = null;
    isPreloading = false;
    componentsPromise = null;
    
    // Remove existing script
    const existingScript = document.querySelector(
        `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    if (existingScript) {
        existingScript.remove();
    }
    
    return loadGoogleMaps(apiKey);
};

// Initialize preloading
preloadGoogleMaps();

// Also preload on window load for better performance
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadGoogleMaps);
    } else {
        preloadGoogleMaps();
    }
}
