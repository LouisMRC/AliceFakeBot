const prompts = require("prompts");
const Discord = require("discord.js");
const page = require("./page");
const client = new Discord.Client();
const MESSAGE_PAGES_SIZE = 20;
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
                    client.channels.forEach(channel=>console.log((channel.type === "group" ? "" : channel.guild + ": ") + channel.name + " " + channel.id));
                    console.log("**********************************************");
                    break;
                case "messages":
                    if(currentChannel === null)
                    {
                        console.log("Error: you must select a channel first");
                        break;
                    }
                    console.log("Messages:\n**********************************************");
                    let pageIndex = allnumeric(args[2]) ? parseInt(args[2], 10) : -1;
                    let pages = new page(MESSAGE_PAGES_SIZE);
                    currentChannel.messages.forEach(message=>{
                        if(pages.length -1 >= pageIndex && pageIndex != -1)return;
                        pages.push(message);
                    });
                    let messages = [];
                    if(pageIndex === -1)messages = pages.getLatestPage();
                    else messages = pages.getPage(pageIndex);
                    messages.forEach(message=>{
                        console.log("\n\n==============================================");
                        let author =  message.author;
                        console.log(author.username + "#" + author.discriminator + "(" + author.id + "):");
                        console.log("sent on:" + message.createdAt.toISOString())
                        console.log("==============================================");
                    });
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
            if(message.length > 0)currentChannel.send(message);
            break;
        case "sendAs":
            if(currentChannel === null)
            {
                console.log("Error: you must select a channel first");
                break;
            }
            let target;
            currentServer.members.forEach(member => {if(args[1] === member.id || args[1] === member.user.username || args[1] === member.nickname)target = member;});
            // if(target.id === client.user.id)
            // {
            //     console.log("Error: you must select a channel first");
            //     break;
            // }
            let troll = await messageInput();
            if(troll.length > 0)currentChannel.createWebhook(target.displayName, target.user.avatarURL).then(webHook => webHook.send(troll));
            break;
            
    }
    prompts({
        type: "text",
        name: "command",
        message: "[" + client.user.username + "@" + (currentChannel != null ? currentChannel.name : "nullChannel") + "]: "
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
      var numbers = /^[0-9]+$/;
      if(str.value.match(numbers))return true;
      else return false;
   } 
