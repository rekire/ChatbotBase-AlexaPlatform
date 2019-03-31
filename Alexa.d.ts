import { Input, VoicePlatform, Output, VerifyDataHolder } from 'chatbotbase';
/**
 * A platform implementation for Amazon Alexa.
 */
export declare class Alexa extends VoicePlatform {
    platformId(): string;
    parse(body: any): Input;
    verify(request: VerifyDataHolder, response: any): Promise<boolean> | boolean;
    render(reply: Output): any;
    isSupported(json: any): any;
}
declare type ReplyBuilder<T = {}> = new (...args: any[]) => T;
export declare function AlexaReply<TBase extends ReplyBuilder>(Base: TBase): {
    new (...args: any[]): {
        requestPermission(reason: string, permissions: any): any;
        requestLogin(): boolean;
        /**
         * Create a reply containing a simple card optional with an image, this will be rendered on the Alexa App and the FireTV (Stick). This will just display the last card.
         * @param {string} title The title of the card.
         * @param {string} message The message of the card.
         * @param {string | undefined} imageUrlSmall The small version of the image. It will be used also as large image if no imageUrlLarge is set.
         * @param {string | undefined} imageUrlLarge The large version of the image.
         * @returns {Reply} a card for the Alexa App and FireTV (Stick).
         */
        simpleCard(title: string, message: string, imageUrlSmall?: string | undefined, imageUrlLarge?: string | undefined): any;
        /**
         * Create an account binding card in the Alexa app.
         * @returns {Reply} a card for the Alexa App.
         */
        linkAccount(): any;
        /**
         * Displays a simple screen with an image.
         * @param {string} title Title of the screen.
         * @param {string} token Used to track selectable elements in the skill service code. The value can be any user-defined string.
         * @param {EchoShowImage} background Background image of the screen.
         * @param {boolean} backVisible Set to true to show the back button.
         * @param {EchoShowTextContent | string} text The text which should be displayed.
         * @param {EchoShowImage} image The optional image which should be shown.
         * @param {ImageAlignment} alignment The optional alignment of the image, by default right.
         * @returns {Reply} a screen with an optional image.
         * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate1-for-simple-text-and-image-views
         * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate2-for-image-views-and-limited-centered-text
         * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate3-for-image-views-and-limited-left-aligned-text
         */
        displayTextAndPicture(title: string, token: string, background: EchoShowImage, backVisible: boolean, text: string | EchoShowTextContent, image?: EchoShowImage | null, alignment?: ImageAlignment): any;
        /**
         * Displays a screen with a text on it.
         * @param {string} title Title of the screen.
         * @param {string} token Used to track selectable elements in the skill service code. The value can be any user-defined string.
         * @param {EchoShowImage} background Background image of the screen.
         * @param {boolean} backVisible Set to true to show the back button.
         * @param {EchoShowTextContent | string} text The text which should be displayed.
         * @param {TextAlignment} alignment The optional vertical alignment of the text, by default top.
         * @returns {Reply} a screen with a text.
         * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate1-for-simple-text-and-image-views
         * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate2-for-image-views-and-limited-centered-text
         * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate3-for-image-views-and-limited-left-aligned-text
         */
        displayText(title: string, token: string, background: EchoShowImage, backVisible: boolean, text: string | EchoShowTextContent, alignment?: TextAlignment): any;
        /**
         * Displays a simple screen with an image.
         * @param {string} title Title of the screen.
         * @param {string} token Used to track selectable elements in the skill service code. The value can be any user-defined string.
         * @param {EchoShowImage} background Background image of the screen.
         * @param {boolean} backVisible Set to true to show the back button.
         * @param {EchoShowImage} foreground The optional image which should be shown in the foreground.
         * @returns {Reply} a screen with an optional image.
         * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate7-for-scalable-foreground-image-with-optional-background-image
         */
        displayPicture(title: string, token: string, background: EchoShowImage, backVisible: boolean, foreground?: EchoShowImage | undefined): any;
        /**
         * Display a listing screen. You can choose between a horizontal (default) and vertical design.
         * @param {string} title Title of the screen.
         * @param {string} token Used to track selectable elements in the skill service code. The value can be any user-defined string.
         * @param {EchoShowImage} background Background image of the screen.
         * @param {boolean} backVisible Set to true to show the back button.
         * @param {EchoShowListItem[]} listItems The list items which should been shown.
         * @param {ListAlignment} alignment The optional alignment of the listing by default horizontal
         * @returns {Reply} a screen with a listing.
         * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#listtemplate1-for-text-lists-and-optional-images
         * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#listtemplate2-for-list-images-and-optional-text
         */
        displayListing(title: string, token: string, background: EchoShowImage, backVisible: boolean, listItems: EchoShowListItem[], alignment?: ListAlignment): any;
    };
} & TBase;
/**
 * References and describes the image. Multiple sources for the image can be provided.
 */
export declare class EchoShowImage {
    /**
     * Created a new instance of EchoShowImage.
     * @param {string} description The description of the image.
     * @param {EchoShowImageSource} sources The image sources of the image you want to show.
     */
    constructor(description: string, ...sources: EchoShowImageSource[]);
    contentDescription: string;
    sources: EchoShowImageSource[];
}
/**
 * The list item of a listing screen.
 */
export declare class EchoShowListItem {
    /**
     * Creates a new list item of a listing screen.
     * @param {string} token Used to track selectable elements in the skill service code. The value can be any user-defined string.
     * @param {EchoShowImage | undefined} image The image you want to show or undefined if you want to omit the image.
     * @param {EchoShowTextContent | string} text The text you want to show, it can be a EchoShowTextContent if you want
     * full flexibility or a string which will be used as primary text. The rich text flag will be guessed based on the content.
     */
    constructor(token: string, image: EchoShowImage | undefined, text: EchoShowTextContent | string);
    token: string;
    image: EchoShowImage | undefined;
    textContent: EchoShowTextContent;
}
/**
 * The Image source of an image which should been shown on a echo show.
 * Height should be 280 pixels. Depending on the aspect ratio desired, the width should be between 192 and 498 pixels.
 * The following aspect ratios are supported (width x height):
 *
 * Portrait (192 x 280)
 * Square (280 x 280)
 * 4:3 (372 x 280)
 * 16:9 (498 x 280)
 *
 * Source: https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#image-size-and-format-allowed-by-display-templates
 */
export declare class EchoShowImageSource {
    constructor(imageURL: string, width?: number, height?: number, size?: EchoShowImageSize);
    url: string;
    size: EchoShowImageSize;
    widthPixels: number;
    heightPixels: number;
}
/**
 * The possible size of a image
 */
export declare enum EchoShowImageSize {
    /**
     * Displayed within extra small containers.
     * Pixel dimensions: 480 x 320
     */
    X_SMALL = "X_SMALL",
    /**
     * Displayed within small containers.
     * Pixel dimensions: 720 x 480
     */
    SMALL = "SMALL",
    /**
     * Displayed within medium containers.
     * Pixel dimensions: 960 x 640
     */
    MEDIUM = "MEDIUM",
    /**
     * Displayed within large containers.
     * Pixel dimensions: 1200 x 800
     */
    LARGE = "LARGE",
    /**
     * Displayed within extra large containers.
     * Pixel dimensions: 1920 x 1280
     */
    X_LARGE = "X_LARGE"
}
/**
 * Holds the strings you want to display on a screen.
 */
export declare class EchoShowTextContent {
    /**
     * Created a new text content, the first param is mandatory. All arguments can be a string or a EchoShowText. If you
     * enter a string the rich text flag will be guessed.
     * @param {EchoShowText | string} primaryText The primary text, can be a string or a EchoShowText.
     * @param {EchoShowText | string} secondaryText The optional secondary text, can be a string or a EchoShowText.
     * @param {EchoShowText | string} tertiaryText The optional tertiary text, can be a string or a EchoShowText.
     */
    constructor(primaryText: EchoShowText | string, secondaryText?: EchoShowText | string, tertiaryText?: EchoShowText | string);
    primaryText: EchoShowText;
    secondaryText?: EchoShowText;
    tertiaryText?: EchoShowText;
}
/**
 * A simple text which can be displayed with a flag for rich text
 */
export declare class EchoShowText {
    /**
     * Created a EchoShowText instance.
     * @param {string} text The text which should been displayed.
     * @param {EchoShowTextType} format The EchoShowTextType, if no format is set it will be guessed based on the content of the text.
     */
    constructor(text: string, format?: EchoShowTextType);
    text: string;
    type: EchoShowTextType;
}
/**
 * The type how the text should been displayed.
 */
export declare enum EchoShowTextType {
    PlainText = "PlainText",
    RichText = "RichText"
}
/**
 * The image alignment within the screen.
 */
export declare enum ImageAlignment {
    Right = 0,
    Left = 1
}
/**
 * The image alignment within the screen.
 */
export declare enum TextAlignment {
    Top = 0,
    Bottom = 1
}
/**
 * The list alignment on the screen.
 */
export declare enum ListAlignment {
    Horizontal = 0,
    Vertical = 1
}
export {};
