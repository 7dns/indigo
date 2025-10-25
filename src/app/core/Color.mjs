// Represents the colors in rgba
export class Color extends Float32Array {

    static RED      = new Color(1.0, 0.0, 0.0, 1.0);
    static ORANGE   = new Color(1.0, 0.5, 0.0, 1.0);
    static YELLOW   = new Color(1.0, 1.0, 0.0, 1.0);
    static GREEN    = new Color(0.0, 1.0, 0.0, 1.0);
    static CYAN     = new Color(0.0, 1.0, 1.0, 1.0);
    static BLUE     = new Color(0.0, 0.0, 1.0, 1.0);
    static PURPLE   = new Color(0.5, 0.0, 0.5, 1.0);
    static MAGENTA  = new Color(1.0, 0.0, 1.0, 1.0);
    static WHITE    = new Color(1.0, 1.0, 1.0, 1.0);
    static BLACK    = new Color(0.0, 0.0, 0.0, 1.0);

    #r;
    #g;
    #b;
    #a;

    constructor(r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
        console.assert(typeof r === 'number', 'Color constructor(): r must be a number');
        console.assert(typeof g === 'number', 'Color constructor(): g must be a number');
        console.assert(typeof b === 'number', 'Color constructor(): b must be a number');
        console.assert(typeof a === 'number', 'Color constructor(): a must be a number');

        super(4);

        this[0] = r;
        this[1] = g;
        this[2] = b;
        this[3] = a;
    }

}