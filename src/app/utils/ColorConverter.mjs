// Converts a HSV to a RGB color
export function HSVtoRGB(hue, saturation, value) {
    let h = Math.floor(hue / 60);
    let f = (hue / 60 - h);

    let p = value * (1 - saturation);
    let q = value * (1 - saturation * f);
    let t = value * (1 - saturation * (1 - f));

    switch (h) {
        case 1:
            return [q, value, p];
        case 2:
            return [p, value, t];
        case 3:
            return [p, q, value];
        case 4:
            return [t, p, value];
        case 5:
            return [value, p, q];
        default:
            return [value, t, p];
    }
}

// Converts a hex color to a RGB color
export function hexToRGB(hex) {
    let temp = [
        parseInt(hex.substring(0, 2), 16) / 0xff,
        parseInt(hex.substring(2, 4), 16) / 0xff,
        parseInt(hex.substring(4, 6), 16) / 0xff
    ];

    return temp;
}