const prompts = require("prompts");
const Discord = require("discord.js");
const colors = require("colors");
const page = require("./page");
const client = new Discord.Client();
const MESSAGE_PAGE_SIZE = 20;
let currentServer = null;
let currentChannel = null;





client.once("ready", () => {
    console.log("Connected!");
    prompts({
        type: "text",
        name: "command",
        message: "[" + client.user.username + "@" + (currentChannel != null ? currentChannel.name : "nullChannel") + "]: "
    }).then(answer=>cli(answer.command));
});

client.on("message", message => {
});



(async () => {
    const answer = await prompts({
        type: "text",
        name: "token",
        message: "Bot Token: "
    });
    client.login(answer.token);
})();

async function cli(line)
{
    const args = line.split(' ');
    switch(args[0])
    {
        case "help":
            console.log("commands:\nhelp: show this help message\nquit: exit and disconnect\nbye: say goodbye");
            break;
        case "quit":
            process.exit(0);
        case "bye":
            console.log("bye!!");
            process.exit(0);
        case "show":
            if(args.length === 1)
            {
                console.log("Error: you must specify the list to show");
                break;
            }
            switch(args[1])
            {
                case "users":
                    console.log("Users:\n**********************************************");
                    client.users.forEach(user=>console.log(user.username + " " + user.id));
                    console.log("**********************************************");
                    break;
                case "servers":
                    console.log("Servers:\n**********************************************");
                    client.guilds.forEach(guild=>console.log(guild.name + " " + guild.id));
                    console.log("**********************************************");
                    break;
                case "channels":
                    console.log("Channels:\n**********************************************");
                    client.channels.forEach(channel=>{if(args[2] === undefined || args[2] === channel.type)console.log((channel.type === "dm" ? "DM".bold : channel.type.replace(channel.type.charAt(0), channel.type.charAt(0).toUpperCase()).bold) + ((channel.type === "dm" || channel.type === "group") ? "" : " " + channel.guild.name.blue) + " " + getChannelName(channel).red + " " + channel.id.yellow);});
                    console.log("**********************************************");
                    break;
                case "messages":
                    if(currentChannel === null)
                    {
                        console.log("Error: you must select a channel first");
                        break;
                    }
                    let pageIndex = allnumeric(args[2]) ? parseInt(args[2], 10) : 0;
                    let pages = new page(MESSAGE_PAGE_SIZE);
                    // console.log((pages.latestIndex < pageIndex && pages.full(pages.latestIndex)));
                    for(let msg = (await currentChannel.fetchMessages({limit: 1})).first(); (pages.latestIndex < pageIndex || !pages.full(pages.latestIndex)) && msg !== undefined; msg = (await currentChannel.fetchMessages({limit: 1, before: msg.id})).first())
                    {
                        // console.log(msg);
                        pages.push(msg);
                    }

                    let msgPage = pages.getPage(pageIndex).reverse();
                    // console.log(msgPage);
                    console.log("Messages:\n**********************************************");
                    for(let message of msgPage)
                    {
                        console.log("\n\n==============================================");
                        let author =  message.author;
                        console.log(author.username + "#" + author.discriminator + " " + (author.bot ? "Bot " : "") + "(" + author.id + "):");
                        console.log("sent on: " + message.createdAt.toISOString() + (message.editedAt ? "   edited on: " + message.editedAt.toISOString() : ""));
                        console.log("----------------------------------------------");
                        console.log(message.content);
                        console.log("----------------------------------------------");
                        console.log(message.id);
                        console.log("==============================================");
                    }
                    console.log("**********************************************");
                    break;
            }

        case "select":
            client.guilds.forEach(guild => {
                if(guild.id === args[1] || guild.name === args[1]) 
                {
                    currentServer = guild;
                    currentChannel = guild.systemChannel;
                }
            });
            client.channels.forEach(channel => {
                // console.log(channel.name + (channel.type !== "dm" && channel.type !== "group") && (channel.id === args[1] || channel.name === args[1]));
                if(channel.id === args[1] || channel.name === args[1])
                {
                    currentChannel = channel;
                    if(channel.type !== "group")currentServer = channel.guild;
                }
            });
            break;
        case "send":
            if(currentChannel === null)
            {
                console.log("Error: you must select a channel first");
                break;
            }
            let message = await messageInput();
            if(message.length > 0)await currentChannel.send(message);
            break;
        case "sendAs":
            if(currentChannel === null)
            {
                console.log("Error: you must select a channel first");
                break;
            }
            let anonyMessage = await messageInput();
            let username, userAvatarURL;
            if(anonyMessage.length < 0)break;
            switch(args.length)
            {
                case 2:
                    currentServer.members.forEach(member => {
                        if(args[1] === member.id || args[1] === member.user.username || args[1] === member.nickname)
                        {
                            username = member.displayName;
                            userAvatarURL = member.user.avatarURL;
                            console.log(username + "\n" + userAvatarURL);
                        }
                    });
                    break;
                case 3:
                    username = args[1];
                    userAvatarURL = args[2];
                    break;
            }
            await currentChannel.createWebhook(username, userAvatarURL).then(wh=>{
                wh.send(anonyMessage);
                wh.delete();
            });

            break;
            
    }
    prompts({
        type: "text",
        name: "command",
        message: "[" + client.user.username + "@" + getChannelName(currentChannel) + "]: "
    }).then(answer=>cli(answer.command));
}

async function messageInput()
{
    const answer = await prompts({
        type: "text",
        name: "line",
        message: "->"
    });
    if(answer.line.length === 0)return "";
    else return answer.line + "\n" + await messageInput();
}
function allnumeric(str)
{
    if(str === null || str === undefined)return false;
    let numbers = new RegExp('^\\d+$');
    return numbers.test(str);
}
function getChannelName(channel)
{
    if(channel === null)return "nullChannel";
    switch(channel.type)
    {
        case "dm":
            return channel.recipient.username;
        case "group":
            if(channel.name !== null)return channel.name;
            let name = "";
            let usrCounter = 0;
            if(channel.name === null)channel.recipients.forEach(user=>{
                name+=(name.length!==0?",":"")+user.username;
                usrCounter++;
                if(usrCounter === 3)return;
            });
            return name;
        default:            
            return channel.name;
    }
}
