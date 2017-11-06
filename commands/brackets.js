// brackets : 0-100-300     Number separated by dashes. This example creates two brackets, 0-100 and 100-300. Prices are always USD.

let permissionHelper = require('./../utils/permissionHelper'),
    codes = require('./../utils/codes'),
    messages = require('./../utils/messages'),
    infoLog = require('./../utils/logger').info,
    argParser = require('minimist-string'),
    hi = require('./../utils/highlight'),
    Settings = require('./../utils/settings');

module.exports = async function (client, message, messageText){
    let settings = Settings.instance(),
        args = argParser(messageText),
        isAdmin = await permissionHelper.isAdmin(client, message.author);

    if (!isAdmin){
        message.author.send(messages.permissionError);
        return codes.MESSAGE_REJECTED_PERMISSION;
    }

    if (args.b){
        let bracketParts = args.b.split('-').filter(function(part){ return part.length ? part : null; });
        if (bracketParts.length < 2){
            message.author.send(`You should specify at least one price range, ex, ${hi('brackets -b 0-100')}.`);
            return codes.MESSAGE_REJECTED_INVALIDBRACKET;
        }

        let brackets = [];
        for (let i = 0 ; i < bracketParts.length ; i ++){
            let bracket = bracketParts[i];

            if (isNaN(bracket)){
                message.author.send(`${hi(bracket)} is not number.`);
                return codes.MESSAGE_REJECTED_INVALIDBRACKET;
            }

            bracket = parseInt(bracket);
            if (brackets.length > 0)
                brackets[brackets.length - 1].max = bracket;
            if (i !== bracketParts.length - 1)
                brackets.push({min : bracket});
        }

        settings.values.brackets = brackets;
        settings.save();

        message.author.send(`${hi(brackets.length)} brackets were set.`);
        infoLog.info(`User ${message.author.username} set brackets to ${args.b}.`);
        return codes.MESSAGE_ACCEPTED;
    }

    if (args.h || args.help){
        message.author.send(
            `${hi('brackets')} divides games up into price groups.\n\n` +
            `If someone wins a game, they will not be allowed to enter another giveaway for ${settings.values.winningCooldownDays} days. `+
            `Brackets limits this lockout to only the price group they won in, allowing them to continue entering giveaways at other price points.\n\n` +
            `Expected : ${hi('brackets -b price-price..')} \n` +
            `Example ${hi('brackets -b 0-50-100-200')} creates 3 brackets 0-50, 50-100, & 100-200.`);

        return codes.MESSAGE_ACCEPTED_HELPRETURNED;
    }

    // fallthrough - return current bracket info
    let reply = '';

    if (!settings.values.brackets || !settings.values.brackets.length){
        reply = 'No brackets set.';
    } else {
        reply += 'The current price brackets are :\n';
        for (let bracket of settings.values.brackets)
            reply += `$${hi(bracket.min)} - $${hi(bracket.max)}\n`;
    }

    reply += `You can also try ${hi('brackets --help')} for more info.`;

    message.author.send(reply);
    return codes.MESSAGE_ACCEPTED_BRACKETSLIST;

};