import {Input, InputMethod, Reply, VoicePlatform, Context, Output, VerifyDataHolder} from 'chatbotbase';

/**
 * A platform implementation for Amazon Alexa.
 */
export class Alexa extends VoicePlatform {
    platformId(): string {
        return 'Alexa';
    }

    parse(body: any): Input {
        const data: Context = {};
        if(body.session.attributes) {
            Object.keys(body.session.attributes).forEach(key => {
                data[key] = body.session.attributes[key]
            });
        }
        let platform, intent;
        platform = "Unexpected Alexa Device";
        if(body.context.System.device.supportedInterfaces.Display) {
            platform = "EchoShow";
        } else if(body.context.System.device.supportedInterfaces.AudioPlayer) {
            platform = "Alexa";
        } else if(body.context.System.device.supportedInterfaces.VideoApp) {
            platform = "FireTV";
        }
        if(body.request.type === 'IntentRequest') { // normal alexa intent
            intent = body.request.intent.name;
        } else if(body.request.type === 'SessionEndedRequest') {
            if(body.request.reason === 'ERROR') { // alexa error logging
                //input = request.request.error.message;
            } else {
                //input = request.request.reason;
            }
        } else if(body.request.type === 'LaunchRequest') {
            //input = 'Intent: LaunchRequest';
            intent = 'LaunchRequest';
            if(body.request.intent) {
                intent = body.request.intent.name;
            }
        }
        return new Input(
            body.request.requestId,
            body.session.user.userId,
            body.session.sessionId,
            body.request.locale,
            platform,
            new Date(body.request.timestamp),
            intent,
            InputMethod.voice,
            intent,
            data,
            body.session.user.accessToken);
    }

    verify(request: VerifyDataHolder, response: any): Promise<boolean> | boolean {
        const verifier = require('alexa-verifier');
        return new Promise(function(resolve, reject) {
            verifier(request.header("SignatureCertChainUrl"), request.header("Signature"), request.rawRequest(), function(er) {
                if(er)
                    reject(er);
                else
                    resolve(true);
            })
        });
    }

    render(reply: Output): any {
        let plainReply, formattedReply;
        const directives: any = [];
        let card = undefined;
        reply.replies.forEach(msg => {
            if(msg.platform === '*') {
                if(msg.type === 'plain') {
                    plainReply = msg.render();
                } else if(msg.type === 'formatted') {
                    formattedReply = msg.render();
                }
            } else if(msg.platform === 'Alexa') {
                if(msg.type === 'directory' && reply.platform === 'EchoShow') {
                    directives.push({
                        type: 'Display.RenderTemplate',
                        template: msg.render()
                    });
                } else if(msg.type === 'card') {
                    card = msg.render();
                }
            }
        });
        const reprompt = reply.retentionMessage && reply.expectAnswer ? {
            outputSpeech: {
                type: "PlainText",
                text: reply.retentionMessage,
                ssml: `<speak>${reply.retentionMessage}</speak>`
            }
        } : undefined;
        formattedReply = formattedReply || plainReply;
        return {
            version: '1.0',
            sessionAttributes: reply.context,
            response: {
                outputSpeech: {
                    type: formattedReply.indexOf('<') >= 0 ? 'SSML' : 'PlainText',
                    text: plainReply,
                    ssml: `<speak>${formattedReply}</speak>`
                },
                card: card,
                reprompt: reprompt,
                directives: directives,
                shouldEndSession: !reply.expectAnswer
            }
        };
    }

    isSupported(json: any) {
        return json.hasOwnProperty('session')// request, context
    }

    /**
     * Create a reply containing a simple card optional with an image, this will be rendered on the Alexa App and the FireTV (Stick). This will just display the last card.
     * @param {string} title The title of the card.
     * @param {string} message The message of the card.
     * @param {string | undefined} imageUrlSmall The small version of the image. It will be used also as large image if no imageUrlLarge is set.
     * @param {string | undefined} imageUrlLarge The large version of the image.
     * @returns {Reply} a card for the Alexa App and FireTV (Stick).
     */
    static simpleCard(title: string, message: string, imageUrlSmall: string | undefined = undefined, imageUrlLarge: string | undefined = undefined): Reply {
        return <Reply>{
            platform: 'Alexa',
            type: 'card',
            render: () => {
                const image = imageUrlSmall === undefined ? undefined : {
                    smallImageUrl: imageUrlSmall,
                    largeImageUrl: imageUrlLarge || imageUrlSmall
                };
                return {
                    type: "Standard",
                    title: title,
                    text: message,
                    image: image
                }
            },
            debug: () => title + ": " + message
        };
    }

    /**
     * Create an account binding card in the Alexa app.
     * @returns {Reply} a card for the Alexa App.
     */
    static linkAccount(): Reply {
        return <Reply>{
            platform: 'Alexa',
            type: 'card',
            render: () => {
                return {
                    type: "LinkAccount"
                }
            },
            debug: () => "Show account binding"
        };
    }

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
    static displayTextAndPicture(title: string, token: string, background: EchoShowImage, backVisible: boolean, text: EchoShowTextContent | string, image: EchoShowImage | null = null, alignment: ImageAlignment = ImageAlignment.Right): Reply {
        const textContent = typeof text === "string" ? new EchoShowTextContent(text) : text;
        return <Reply>{
            platform: 'Alexa',
            type: 'directory',
            render: () => {
                return {
                    type: "BodyTemplate" + (image === null ? 1 : alignment === ImageAlignment.Right ? 2 : 3),
                    token: token,
                    backButton: (backVisible ? "VISIBLE" : "HIDDEN"),
                    backgroundImage: background,
                    title: title,
                    image: image,
                    textContent: textContent
                }
            },
            debug: () => title + ": " + textContent.primaryText.text
        }
    }

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
    static displayText(title: string, token: string, background: EchoShowImage, backVisible: boolean, text: EchoShowTextContent | string, alignment: TextAlignment = TextAlignment.Top): Reply {
        const textContent = typeof text === "string" ? new EchoShowTextContent(text) : text;
        return <Reply>{
            platform: 'Alexa',
            type: 'directory',
            render: () => {
                return {
                    type: "BodyTemplate" + (alignment === TextAlignment.Bottom ? 6 : 1),
                    token: token,
                    backButton: (backVisible ? "VISIBLE" : "HIDDEN"),
                    backgroundImage: background,
                    title: title,
                    textContent: textContent
                }
            },
            debug: () => title + ": " + textContent.primaryText.text
        }
    }

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
    static displayPicture(title: string, token: string, background: EchoShowImage, backVisible: boolean, foreground: EchoShowImage | undefined = undefined): Reply {
        return <Reply>{
            platform: 'Alexa',
            type: 'directory',
            render: () => {
                return {
                    type: "BodyTemplate7",
                    token: token,
                    backButton: (backVisible ? "VISIBLE" : "HIDDEN"),
                    backgroundImage: background,
                    title: title,
                    image: foreground,
                }
            },
            debug: () => `Displaying a picture with caption ${title}`
        }
    }

    /**
     * Display a listing screen. You can choose between a horizontal (default) and vertical design.
     * @param {string} title Title of the screen.
     * @param {string} token Used to track selectable elements in the skill service code. The value can be any user-defined string.
     * @param {EchoShowImage} background Background image of the screen.
     * @param {boolean} backVisible Set to true to show the back button.
     * @param {EchoShowListItem[]} items The list items which should been shown.
     * @param {ListAlignment} alignment The optional alignment of the listing by default horizontal
     * @returns {Reply} a screen with a listing.
     * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#listtemplate1-for-text-lists-and-optional-images
     * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#listtemplate2-for-list-images-and-optional-text
     */
    static displayListing(title: string, token: string, background: EchoShowImage, backVisible: boolean, items: EchoShowListItem[], alignment: ListAlignment = ListAlignment.Horizontal): Reply {
        return <Reply>{
            platform: 'Alexa',
            type: 'directory',
            render: () => {
                return {
                    type: "ListTemplate" + (alignment === ListAlignment.Vertical ? 1 : 2),
                    token: token,
                    backButton: (backVisible ? "VISIBLE" : "HIDDEN"),
                    backgroundImage: background,
                    title: title,
                    listItems: items
                }
            },
            debug: () => `Screen with title "${title}" and with ${items.length} items`
        };
    }
}

// needs to been put in a empty object with the key "image"
/**
 * References and describes the image. Multiple sources for the image can be provided.
 */
export class EchoShowImage {
    /**
     * Created a new instance of EchoShowImage.
     * @param {string} description The description of the image.
     * @param {EchoShowImageSource} sources The image sources of the image you want to show.
     */
    constructor(description: string, ...sources: EchoShowImageSource[]) {
        this.contentDescription = description;
        this.sources = sources;
    }

    contentDescription: string;
    sources: EchoShowImageSource[]
}

/**
 * The list item of a listing screen.
 */
export class EchoShowListItem {
    /**
     * Creates a new list item of a listing screen.
     * @param {string} token Used to track selectable elements in the skill service code. The value can be any user-defined string.
     * @param {EchoShowImage | undefined} image The image you want to show or undefined if you want to omit the image.
     * @param {EchoShowTextContent | string} text The text you want to show, it can be a EchoShowTextContent if you want
     * full flexibility or a string which will be used as primary text. The rich text flag will be guessed based on the content.
     */
    constructor(token: string, image: EchoShowImage | undefined, text: EchoShowTextContent | string) {
        this.token = token;
        this.image = image;
        this.textContent = typeof text === "string" ? new EchoShowTextContent(text) : text;
    }

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
export class EchoShowImageSource {
    constructor(imageURL: string, width?: number, height?: number, size?: EchoShowImageSize) {
        this.url = imageURL;
        if(width != null) this.widthPixels = width;
        if(height != null) this.heightPixels = height;
        if(size != null) this.size = size;
    }

    url: string;
    size: EchoShowImageSize;
    widthPixels: number;
    heightPixels: number;
}

/**
 * The possible size of a image
 */
export enum EchoShowImageSize {
    /**
     * Displayed within extra small containers.
     * Pixel dimensions: 480 x 320
     */
    X_SMALL = 'X_SMALL',
    /**
     * Displayed within small containers.
     * Pixel dimensions: 720 x 480
     */
    SMALL = 'SMALL',
    /**
     * Displayed within medium containers.
     * Pixel dimensions: 960 x 640
     */
    MEDIUM = 'MEDIUM',
    /**
     * Displayed within large containers.
     * Pixel dimensions: 1200 x 800
     */
    LARGE = 'LARGE',
    /**
     * Displayed within extra large containers.
     * Pixel dimensions: 1920 x 1280
     */
    X_LARGE = 'X_LARGE',
}

/**
 * Holds the strings you want to display on a screen.
 */
export class EchoShowTextContent {
    /**
     * Created a new text content, the first param is mandatory. All arguments can be a string or a EchoShowText. If you
     * enter a string the rich text flag will be guessed.
     * @param {EchoShowText | string} primaryText The primary text, can be a string or a EchoShowText.
     * @param {EchoShowText | string} secondaryText The optional secondary text, can be a string or a EchoShowText.
     * @param {EchoShowText | string} tertiaryText The optional tertiary text, can be a string or a EchoShowText.
     */
    constructor(primaryText: EchoShowText | string, secondaryText?: EchoShowText | string, tertiaryText?: EchoShowText | string) {
        this.primaryText = typeof primaryText === "string" ? new EchoShowText(primaryText) : primaryText;
        this.secondaryText = typeof secondaryText === "string" ? new EchoShowText(secondaryText) : secondaryText;
        this.tertiaryText = typeof tertiaryText === "string" ? new EchoShowText(tertiaryText) : tertiaryText;
    }

    primaryText: EchoShowText;
    secondaryText?: EchoShowText;
    tertiaryText?: EchoShowText;
}

/**
 * A simple text which can be displayed with a flag for rich text
 */
export class EchoShowText {
    /**
     * Created a EchoShowText instance.
     * @param {string} text The text which should been displayed.
     * @param {EchoShowTextType} format The EchoShowTextType, if no format is set it will be guessed based on the content of the text.
     */
    constructor(text: string, format?: EchoShowTextType) {
        if(typeof format === 'undefined') {
            format = text.indexOf('<') >= 0 ? EchoShowTextType.RichText : EchoShowTextType.PlainText
        }
        this.text = text;
        this.type = format;
    }

    text: string;
    type: EchoShowTextType
}

/**
 * The type how the text should been displayed.
 */
export enum EchoShowTextType {
    PlainText = 'PlainText',
    RichText = 'RichText'
}

/**
 * The image alignment within the screen.
 */
export enum ImageAlignment {
    Right, Left
}

/**
 * The image alignment within the screen.
 */
export enum TextAlignment {
    Top, Bottom
}

/**
 * The list alignment on the screen.
 */
export enum ListAlignment {
    Horizontal, Vertical
}