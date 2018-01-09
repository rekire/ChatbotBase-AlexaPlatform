"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chatbotbase_1 = require("chatbotbase");
/**
 * A platform implementation for Amazon Alexa.
 */
class Alexa extends chatbotbase_1.VoicePlatform {
    platformId() {
        return 'Alexa';
    }
    parse(body) {
        const data = {};
        if (body.session.attributes) {
            Object.keys(body.session.attributes).forEach(key => {
                data[key] = body.session.attributes[key];
            });
        }
        let platform, intent;
        platform = "Unexpected Alexa Device";
        if (body.context.System.device.supportedInterfaces.Display) {
            platform = "EchoShow";
        }
        else if (body.context.System.device.supportedInterfaces.AudioPlayer) {
            platform = "Alexa";
        }
        else if (body.context.System.device.supportedInterfaces.VideoApp) {
            platform = "FireTV";
        }
        if (body.request.type === 'IntentRequest') {
            intent = body.request.intent.name;
        }
        else if (body.request.type === 'SessionEndedRequest') {
            if (body.request.reason === 'ERROR') {
                //input = request.request.error.message;
            }
            else {
                //input = request.request.reason;
            }
        }
        else if (body.request.type === 'LaunchRequest') {
            //input = 'Intent: LaunchRequest';
            intent = 'LaunchRequest';
            if (body.request.intent) {
                intent = body.request.intent.name;
            }
        }
        return new chatbotbase_1.Input(body.request.requestId, body.session.user.userId, body.session.sessionId, body.request.locale, platform, new Date(body.request.timestamp), intent, chatbotbase_1.InputMethod.voice, intent, data, body.session.user.accessToken);
    }
    render(reply) {
        let plainReply, formattedReply;
        const directives = [];
        let card = undefined;
        reply.replies.forEach(msg => {
            if (msg.platform === '*') {
                if (msg.type === 'plain') {
                    plainReply = msg.render();
                }
                else if (msg.type === 'formatted') {
                    formattedReply = msg.render();
                }
            }
            else if (msg.platform === 'Alexa') {
                if (msg.type === 'directory' && reply.platform === 'EchoShow') {
                    directives.push({
                        type: 'Display.RenderTemplate',
                        template: msg.render()
                    });
                }
                else if (msg.type === 'card') {
                    card = msg.render();
                }
            }
        });
        formattedReply = formattedReply || plainReply;
        return {
            version: '1.0',
            sessionAttributes: reply.context,
            response: {
                outputSpeech: {
                    type: "PlainText",
                    text: plainReply,
                    ssml: `<speak>${formattedReply}</speak>`
                },
                card: card,
                reprompt: {
                    outputSpeech: {
                        type: "PlainText",
                        text: reply.retentionMessage,
                        ssml: `<speak>${reply.retentionMessage}</speak>`
                    }
                },
                directives: directives,
                shouldEndSession: !reply.expectAnswer
            }
        };
    }
    isSupported(json) {
        return json.hasOwnProperty('session'); // request, context
    }
    /**
     * Create a reply containing a simple card optional with an image, this will be rendered on the Alexa App and the FireTV (Stick). This will just display the last card.
     * @param {string} title The title of the card.
     * @param {string} message The message of the card.
     * @param {string | undefined} imageUrlSmall The small version of the image. It will be used also as large image if no imageUrlLarge is set.
     * @param {string | undefined} imageUrlLarge The large version of the image.
     * @returns {Reply} a card for the Alexa App and FireTV (Stick).
     */
    static simpleCard(title, message, imageUrlSmall = undefined, imageUrlLarge = undefined) {
        return {
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
                };
            },
            debug: () => title + ": " + message
        };
    }
    /**
     * Displays a simple screen optional with an image.
     * @param {string} title Title of the screen.
     * @param {string} token Used to track selectable elements in the skill service code. The value can be any user-defined string.
     * @param {EchoShowImage} background Background image of the screen.
     * @param {boolean} backVisible Set to true to show the back button.
     * @param {EchoShowTextContent} text The text which should be displayed.
     * @param {EchoShowImage | null} image The optional image which should be shown.
     * @param {ImageAlignment} alignment The optional alignment of the image, by default right.
     * @returns {Reply} a screen with an optional image.
     * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate1-for-simple-text-and-image-views
     * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate2-for-image-views-and-limited-centered-text
     * @see https://developer.amazon.com/de/docs/custom-skills/display-interface-reference.html#bodytemplate3-for-image-views-and-limited-left-aligned-text
     */
    static displaySimpleScreen(title, token, background, backVisible, text, image = null, alignment = ImageAlignment.Right) {
        return {
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
                    textContent: text
                };
            },
            debug: () => title + ": " + text.primaryText.text
        };
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
    static displayListing(title, token, background, backVisible, items, alignment = ListAlignment.Horizontal) {
        return {
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
                };
            },
            debug: () => `Screen with title "${title}" and with ${items.length} items`
        };
    }
}
exports.Alexa = Alexa;
// needs to been put in a empty object with the key "image"
/**
 * References and describes the image. Multiple sources for the image can be provided.
 */
class EchoShowImage {
    /**
     * Created a new instance of EchoShowImage.
     * @param {string} description The description of the image.
     * @param {EchoShowImageSource} sources The image sources of the image you want to show.
     */
    constructor(description, ...sources) {
        this.contentDescription = description;
        this.sources = sources;
    }
}
exports.EchoShowImage = EchoShowImage;
/**
 * The list item of a listing screen.
 */
class EchoShowListItem {
    /**
     * Creates a new list item of a listing screen.
     * @param {string} token Used to track selectable elements in the skill service code. The value can be any user-defined string.
     * @param {EchoShowImage | undefined} image The image you want to show or undefined if you want to omit the image.
     * @param {EchoShowTextContent | string} text The text you want to show, it can be a EchoShowTextContent if you want
     * full flexibility or a string which will be used as primary text. The rich text flag will be guessed based on the content.
     */
    constructor(token, image, text) {
        this.token = token;
        this.image = image;
        this.textContent = typeof text === "string" ? new EchoShowTextContent(text) : text;
    }
}
exports.EchoShowListItem = EchoShowListItem;
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
class EchoShowImageSource {
    constructor(imageURL, width, height, size) {
        this.url = imageURL;
        if (width != null)
            this.widthPixels = width;
        if (height != null)
            this.heightPixels = height;
        if (size != null)
            this.size = size;
    }
}
exports.EchoShowImageSource = EchoShowImageSource;
/**
 * The possible size of a image
 */
var EchoShowImageSize;
(function (EchoShowImageSize) {
    /**
     * Displayed within extra small containers.
     * Pixel dimensions: 480 x 320
     */
    EchoShowImageSize["X_SMALL"] = "X_SMALL";
    /**
     * Displayed within small containers.
     * Pixel dimensions: 720 x 480
     */
    EchoShowImageSize["SMALL"] = "SMALL";
    /**
     * Displayed within medium containers.
     * Pixel dimensions: 960 x 640
     */
    EchoShowImageSize["MEDIUM"] = "MEDIUM";
    /**
     * Displayed within large containers.
     * Pixel dimensions: 1200 x 800
     */
    EchoShowImageSize["LARGE"] = "LARGE";
    /**
     * Displayed within extra large containers.
     * Pixel dimensions: 1920 x 1280
     */
    EchoShowImageSize["X_LARGE"] = "X_LARGE";
})(EchoShowImageSize = exports.EchoShowImageSize || (exports.EchoShowImageSize = {}));
/**
 * Holds the strings you want to display on a screen.
 */
class EchoShowTextContent {
    /**
     * Created a new text content, the first param is mandatory. All arguments can be a string or a EchoShowText. If you
     * enter a string the rich text flag will be guessed.
     * @param {EchoShowText | string} primaryText The primary text, can be a string or a EchoShowText.
     * @param {EchoShowText | string} secondaryText The optional secondary text, can be a string or a EchoShowText.
     * @param {EchoShowText | string} tertiaryText The optional tertiary text, can be a string or a EchoShowText.
     */
    constructor(primaryText, secondaryText, tertiaryText) {
        this.primaryText = typeof primaryText === "string" ? new EchoShowText(primaryText) : primaryText;
        this.secondaryText = typeof secondaryText === "string" ? new EchoShowText(secondaryText) : secondaryText;
        this.tertiaryText = typeof tertiaryText === "string" ? new EchoShowText(tertiaryText) : tertiaryText;
    }
}
exports.EchoShowTextContent = EchoShowTextContent;
/**
 * A simple text which can be displayed with a flag for rich text
 */
class EchoShowText {
    /**
     * Created a EchoShowText instance.
     * @param {string} text The text which should been displayed.
     * @param {EchoShowTextType} format The EchoShowTextType, if no format is set it will be guessed based on the content of the text.
     */
    constructor(text, format) {
        if (typeof format === 'undefined') {
            format = text.indexOf('<') >= 0 ? EchoShowTextType.RichText : EchoShowTextType.PlainText;
        }
        this.text = text;
        this.type = format;
    }
}
exports.EchoShowText = EchoShowText;
/**
 * The type how the text should been displayed.
 */
var EchoShowTextType;
(function (EchoShowTextType) {
    EchoShowTextType["PlainText"] = "PlainText";
    EchoShowTextType["RichText"] = "RichText";
})(EchoShowTextType = exports.EchoShowTextType || (exports.EchoShowTextType = {}));
/**
 * The image alignment within the screen.
 */
var ImageAlignment;
(function (ImageAlignment) {
    ImageAlignment[ImageAlignment["Right"] = 0] = "Right";
    ImageAlignment[ImageAlignment["Left"] = 1] = "Left";
})(ImageAlignment = exports.ImageAlignment || (exports.ImageAlignment = {}));
/**
 * The list alignment on the screen.
 */
var ListAlignment;
(function (ListAlignment) {
    ListAlignment[ListAlignment["Horizontal"] = 0] = "Horizontal";
    ListAlignment[ListAlignment["Vertical"] = 1] = "Vertical";
})(ListAlignment = exports.ListAlignment || (exports.ListAlignment = {}));
//# sourceMappingURL=Alexa.js.map