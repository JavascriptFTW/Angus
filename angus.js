window.candyChatroom = (function() {
  return Candy.Core.getOptions().autojoin[0].toLowerCase();
})();

window.sendMessage = function(messageData) {
  Candy.Core.Action.Jabber.Room.Message(candyChatroom, messageData);
};

window.ChatbotSpec = {
  name: "Angus",
  version: "2.0",
  label: "{Angus} ",
  author: "GigabyteGiant",
  commandInitializer: "!",
  viewers: (JSON.parse(localStorage.getItem("viewers") || {
    "GigabyteGiant": {
      "permissions": {
        "owner": true,
        "admin": true,
        "moderator": true,
        "vip": true
      },
      "greeting": "I have arrived."
    }
  })),
  events: {
    "viewerLeave": function(data) {
      if (ChatbotSpec.viewers.hasOwnProperty(data.name)) {
        if (ChatbotSpec.viewers[data.name].hasOwnProperty("farewell")) {
          var parsedFarewell = ChatbotSpec.viewers[data.name].farewell.replace("{username}", data.name);
          sendMessage(ChatbotSpec.label + parsedFarewell);
          return;
        }
      }
      sendMessage(ChatbotSpec.label + "Thanks for stopping by @" + data.name);
    },
    "viewerJoin": function(data) {
      if (ChatbotSpec.viewers.hasOwnProperty(data.name)) {
        if (ChatbotSpec.viewers[data.name].hasOwnProperty("greeting")) {
          var parsedGreeting = ChatbotSpec.viewers[data.name].greeting.replace("{username}", data.name);
          sendMessage(ChatbotSpec.label + parsedGreeting);
          return;
        }
      } else {
        ChatbotSpec.viewers[data.name] = {
          "permissions": {
            "owner": false,
            "admin": false,
            "moderator": false,
            "vip": false
          },
          "online": true
        };
          
        localStorage.setItem("viewers", JSON.stringify(ChatbotSpec.viewers));
        ChatbotSpec.viewers = JSON.parse(localStorage.getItem("viewers"));
      }
      sendMessage(ChatbotSpec.label + "Welcome to the channel @" + data.name);
    }
  },
  commands: {
    "bot": {
      "sendsChatMessage": true,
      "messages": [
        "Hello, {sender}!"
      ],
      "exec": function(data) {
        sendMessage("\"" + ChatbotSpec.name + "\" Version " + ChatbotSpec.version + " by " + ChatbotSpec.author);
        sendMessage("Find \"" + ChatbotSpec.name + "\" on GitHub: https://github.com/Gigabyte-Giant/Angus");
      },
      "desc": "Displays information about the bot."
    },
    "help": {
      "sendsChatMessage": true,
      "exec": function(data) {
        var toSend = ".\n";
        if (data.parameters) {
          var cmd = data.parameters[0].replace(ChatbotSpec.commandInitializer, "");
          
          if (ChatbotSpec.commands[cmd] === undefined) {
            sendMessage(ChatbotSpec.label + "Unknown command \"" + cmd + "\" @" + data.name + "!");
          } else {
            sendMessage(ChatbotSpec.label + ChatbotSpec.commandInitializer + cmd + ": " + (ChatbotSpec.commands[cmd].desc || "No information provided."));
          }
        } else {
          toSend += ChatbotSpec.label + "@" + data.name + " Here is a list of the commands:\n";
          for (var i in ChatbotSpec.commands) {
            toSend += ChatbotSpec.commandInitializer + i + "\n";
          }
          toSend += "Type \"" + ChatbotSpec.commandInitializer + "help <command>\" for more information about a specific command.";
        }
        sendMessage(toSend);
      },
      "desc": "Displays help about a specific command"
    },
    "kick": {
      "requiresParams": true,
      "requiresPermission": true,
      "sendsChatMessage": true,
      "exec": function(data) {
        var onlineUsers = Candy.Core.getRoom(candyChatroom).roster.getAll();
        
        data.who = data.parameters[0].replace("@", "");
        data.parameters.shift();
        console.log(data.parameters);
        data.reason = (data.parameters.join(" ") || "No reason provided.");
        
        if (ChatbotSpec.viewers.hasOwnProperty(data.who)) {
          if (!ChatbotSpec.viewers[data.who].permissions.admin) {
            Candy.Core.Action.Jabber.Room.Admin.UserAction(candyChatroom, candyChatroom + "/" + data.who, "kick", data.reason);
          } else {
            if (ChatbotSpec.viewers[data.name].permissions.owner) {
              Candy.Core.Action.Jabber.Room.Admin.UserAction(candyChatroom, candyChatroom + "/" + data.who, "kick", data.reason);
            } else {
              sendMessage(ChatbotSpec.label + "@" + data.who + " is an admin!");
            }
          }
        } else {
          if (onlineUsers.hasOwnProperty(candyChatroom + "/" + data.who)) {
            Candy.Core.Action.Jabber.Room.Admin.UserAction(candyChatroom, candyChatroom + "/" + data.who, "kick", data.reason);
          } else {
            sendMessage(ChatbotSpec.label + "I don't know who @" + data.who + " is! :'(");
          }
        }
      },
      "desc": "Kicks desired user from chat"
    },
    "admins": {
      "sendsChatMessage": true,
      "exec": function(data) {
        var toSend = ".\n";
        var val = (data.parameters === undefined ? undefined : data.parameters[0]);
        var roster = Candy.Core.getRoom(candyChatroom).roster.items;
        var online = [];
        
        for (var user in roster) {
          online.push(roster[user].data.nick);
        }
        
        if (val === undefined) {
          toSend += "Online Chat Admins:\n";
          for (var i in ChatbotSpec.viewers) {
            if (online.indexOf(i) !== -1 && ChatbotSpec.viewers[i].permissions.admin) {
              toSend += "@" + i + "\n";
            }
          }
          toSend += "Type \"" + ChatbotSpec.commandInitializer + "admins all \" to see a list of all admins.";
        } else if (val === "all") {
          toSend += "My Chat Admins:\n";
          for (var i in ChatbotSpec.viewers) {
            if (ChatbotSpec.viewers[i].permissions.admin) {
              toSend += ("[" + (online.indexOf(i) === -1 ? "Offline" : "Online") + "] @" + i + "\n");
            }
          }
        }
        sendMessage(toSend);
      },
      "desc": "Lists all the admins for this chat."
    },
    "promote": {
      "requiresParams": true,
      "requiresPermission": true,
      "sendsChatMessage": true,
      "exec": function(data) {
        var user = data.parameters[0].replace("@", "");
        var rank = data.parameters[1];
        
        if (ChatbotSpec.viewers[data.name].permissions.owner) {
          if (ChatbotSpec.viewers.hasOwnProperty(user)) {
            if (ChatbotSpec.viewers[user].permissions.hasOwnProperty(rank)) {
              ChatbotSpec.viewers[user].permissions[rank] = true;
              localStorage.setItem("viewers", JSON.stringify(ChatbotSpec.viewers));
              ChatbotSpec.viewers = JSON.parse(localStorage.getItem("viewers"));
              sendMessage(ChatbotSpec.label + "@" + user + " has been promoted to " + rank + "!");
            } else {
              sendMessage(ChatbotSpec.label + "Unknown rank \"" + rank + "\" @" + data.name + "!");
            }
          }
        } else {
          sendMessage(ChatbotSpec.label + "Only owners can promote people!");
        }
      }
    },
    "demote": {
      "requiresParams": true,
      "requiresPermission": true,
      "sendsChatMessage": true,
      "exec": function(data) {
        var user = data.parameters[0].replace("@", "");
        var rank = data.parameters[1];
        
        if (ChatbotSpec.viewers[data.name].permissions.owner) {
          if (ChatbotSpec.viewers.hasOwnProperty(user)) {
            if (ChatbotSpec.viewers[user].permissions.hasOwnProperty(rank)) {
              ChatbotSpec.viewers[user].permissions[rank] = false;
              localStorage.setItem("viewers", JSON.stringify(ChatbotSpec.viewers));
              ChatbotSpec.viewers = JSON.parse(localStorage.getItem("viewers"));
              sendMessage(ChatbotSpec.label + "@" + user + " has been demoted from " + rank + "!");
            } else {
              sendMessage(ChatbotSpec.label + "Unknown rank \"" + rank + "\" @" + data.name + "!");
            }
          }
        } else {
          sendMessage(ChatbotSpec.label + "Only owners can demote people!");
        }
      }
    }
  }
};

window.Chatbot = function(spec) {
  this.spec = spec;
  
  console.log("New chatbot created. Name: " + this.spec.name + " Version: " + this.spec.version);
};

Chatbot.prototype.onViewerJoin = function(evtInfo) {
  if (!ChatbotSpec.viewers[evtInfo.name].online) {
    if (this.spec.events.viewerJoin === undefined) {
      return (function(data) {
        console.log(data.name + " joined!");
      })(evtInfo);
    } else {
      return this.spec.events.viewerJoin(evtInfo);
    }
  }
  ChatbotSpec.viewers[evtInfo.name].online = true;
};
Chatbot.prototype.onViewerLeave = function(evtInfo) {
  if (this.spec.events.viewerLeave === undefined) {
    return (function(data) {
      console.log(data.name + " left!");
    })(evtInfo);
  } else {
    return this.spec.events.viewerLeave(evtInfo);
  }
  ChatbotSpec.viewers[evtInfo.name].online = false;
};
Chatbot.prototype.looksLikeCommand = function(msgData) {
  return msgData.message[0] === ChatbotSpec.commandInitializer;
};
Chatbot.prototype.onCommand = function(msgData) {
  var command = msgData.message.split(" ")[0].replace(ChatbotSpec.commandInitializer, "").toLowerCase();
  
  var parameters = [];
  
  for (var i = 1; i < msgData.message.split(" ").length; i++) {
    parameters.push(msgData.message.split(" ")[i]);
  }
  
  if (parameters.length > 0) {
    msgData.parameters = parameters;
  }
  
  if (ChatbotSpec.commands[command] === undefined) {
    sendMessage(ChatbotSpec.label + "\"" + command + "\" is not a valid command @" + msgData.name + "!");
  } else {
    if (ChatbotSpec.commands[command].requiresParams && parameters.length < 1) {
      return;
    }
    if (ChatbotSpec.commands[command].sendsChatMessage) {
      if (ChatbotSpec.commands[command].exec === undefined) {
        var response = ChatbotSpec.commands[command].messages;
        for (var i = 0; i < response.length; i++) {
          if (Array.isArray(response[i])) {
            var pickedIndex = Math.floor(Math.random(response[i].length + 1));
            
            sendMessage(ChatbotSpec.label + response[i][pickedIndex].replace("{sender}", msgData.name));
          } else {
            sendMessage(ChatbotSpec.label + response[i].replace("{sender}", msgData.name));
          }
        } 
      } else {
        if (ChatbotSpec.commands[command].requiresPermission) {
          if (ChatbotSpec.viewers.hasOwnProperty(msgData.name) && ChatbotSpec.viewers[msgData.name].permissions.admin) {
            ChatbotSpec.commands[command].exec(msgData);
          } else {
            sendMessage(ChatbotSpec.label + "That's an admin-only command @" + msgData.name);
          }
        } else {
          ChatbotSpec.commands[command].exec(msgData);
        }
      }
    }
  }
};

var chatbot = new Chatbot(ChatbotSpec);

/* Upon presence update */
$(Candy).on("candy:core.presence.room", function(evt, args) {
  try {
    var who = args.user.data.nick;
    switch (args.action) {
      case "join":
        chatbot.onViewerJoin({ name: who });
        break;
      case "leave":
        chatbot.onViewerLeave({ name: who });
        break;
    }
  } catch (err) {
    console.warn("Oh No! Something 'sploded.");
  }
});

$(Candy).on('candy:view.message.before-show', function(evt, args) {
  console.log(evt);
  console.log(args);
  
  if (chatbot.looksLikeCommand({name: args.name, message: args.message})) {
    chatbot.onCommand({name: args.name, message: args.message});
  }
  
  if (ChatbotSpec.vipMode) {
    if (ChatbotSpec.vips.indexOf(args.name) === -1) {
      args.message = "-";
    }
  }
  var bobCheckMsg = args.message.toLowerCase();
  if (bobCheckMsg.indexOf("bob the bot") !== -1) {
    ChatbotSpec.commands.kick.exec({ parameters: [ args.name, "We don't talk about Bob the bot." ], name: "GigabyteGiant" });
  }
});