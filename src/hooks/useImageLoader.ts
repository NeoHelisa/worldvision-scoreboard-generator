import { useState, useEffect } from 'react';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

export const useImageLoader = (basePath: string | null): string | null => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    useEffect(() => {
        if (!basePath) {
            setImageSrc(null);
            return;
        }

        let index = 0;
        let cancelled = false;

        const tryNext = () => {
            if (cancelled || index >= IMAGE_EXTENSIONS.length) {
                if (!cancelled) setImageSrc(null);
                return;
            }

            const img = new Image();
            const src = `${basePath}.${IMAGE_EXTENSIONS[index]}`;

            img.onload = () => {
                if (!cancelled) setImageSrc(src);
            };

            img.onerror = () => {
                index++;
                tryNext();
            };

            img.src = src;
        };

        tryNext();

        return () => {
            cancelled = true;
        };
    }, [basePath]);

    return imageSrc;
};

export const formatCountryForPath = (country: string): string => {
    return country.toUpperCase();
};