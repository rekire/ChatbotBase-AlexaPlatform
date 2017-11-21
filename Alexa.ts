import {Input, InputMethod, Message, VoicePlatform, Context, Output} from 'chatbotbase';

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
        if(body.context.System.device.supportedInterfaces.AudioPlayer) {
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
            body.session.user.userId,
            body.session.sessionId,
            body.request.locale,
            platform,
            new Date(body.request.timestamp),
            intent,
            InputMethod.voice,
            intent,
            data);
    }

    render(reply: Output): any {
        let plainReply, formattedReply;
        reply.messages.forEach(msg => {
            if(msg.platform === '*') {
                if(msg.type === 'plain') {
                    plainReply = msg.render();
                } else if(msg.type === 'formatted') {
                    formattedReply = msg.render();
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
                //card: {
                //    type: "Standard",
                //    title: "Title of the card",
                //    content: "Content of a simple card",
                //    text: "Text content for a standard card",
                //    image: {
                //        smallImageUrl: "https://url-to-small-card-image...",
                //        largeImageUrl: "https://url-to-large-card-image..."
                //    }
                //},
                reprompt: {
                    outputSpeech: {
                        type: "PlainText",
                        text: reply.retentionMessage,
                        ssml: `<speak>${reply.retentionMessage}</speak>`
                    }
                },
                //directives: [
                //    {
                //        type: "InterfaceName.Directive"
                //    }
                //],
                shouldEndSession: !reply.expectAnswer
            }
        };
    }

    isSupported(json: any) {
        return json.hasOwnProperty('session')// request, context
    }

    static basicCard(message: string): Message {
        return <Message>{
            platform: 'Alexa',
            render: () => {
                return {
                    type: 'basic_card',
                    formattedText: message,
                }
            },
            debug: () => message
        };
    }
}