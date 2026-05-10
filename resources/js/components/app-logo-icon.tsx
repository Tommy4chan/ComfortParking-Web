import { type ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    alt,
    ...rest
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/brand/logo-dark.png"
            alt={alt ?? 'ComfortParking'}
            className={className}
            {...rest}
        />
    );
}
