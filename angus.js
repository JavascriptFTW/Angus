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
  misc: {
    userJoinTimes: {}
  },
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
        localStorage.setItem("viewers", JSON.stringify(ChatbotSpec.viewers));
        ChatbotSpec.viewers = JSON.parse(localStorage.getItem("viewers"));
      }
      sendMessage(ChatbotSpec.label + "Welcome to the channel @" + data.name);
    },
    "viewerFollow": function(data) {
      sendMessage(ChatbotSpec.label + "@" + data.title + " followed! Welcome to the team!! ;D");
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
      "desc": "Displays information about the bot.",
      "usage": "<command>"
    },
    "help": {
      "sendsChatMessage": true,
      "exec": function(data) {
        if (data.parameters) {
          var cmd = data.parameters[0].replace(ChatbotSpec.commandInitializer, "");
          
          if (ChatbotSpec.commands[cmd] === undefined) {
            sendMessage(ChatbotSpec.label + "Unknown command \"" + cmd + "\" @" + data.name + "!");
          } else {
            sendMessage(ChatbotSpec.label + ChatbotSpec.commandInitializer + cmd + ": " + (ChatbotSpec.commands[cmd].desc || "No information provided."));
          }
        } else {
          var toSend = ".\n";
          toSend += ChatbotSpec.label + "@" + data.name + " Here is a list of the commands:\n";
          for (var i in ChatbotSpec.commands) {
            toSend += ChatbotSpec.commandInitializer + i + "\n";
          }
          toSend += "Type \"" + ChatbotSpec.commandInitializer + "help <command>\" for more information about a specific command.";
          sendMessage(toSend);
        }
      },
      "desc": "Displays help about a specific command",
      "usage": "<command> <cmd>"
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
      "desc": "Kicks desired user from chat",
      "usage": "<command> <user> <reason>"
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
              toSend += ("[" + (online.indexOf(i) !== -1 ? "Online" : "Offline") + "] @" + i + "\n");
            }
          }
        }
        sendMessage(toSend);
      },
      "desc": "Lists all the admins for this chat.",
      "usage": "<command> *all"
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
      },
      "desc": "Promotes desired used to desired rank.",
      "usage": "<command> <user> <rank>"
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
      },
      "desc": "Removes desired permission from desired user.",
      "usage": "<command> <user> <rank>"
    },
    "info": {
      "requiresParams": true,
      "requiresPermission": false,
      "sendsChatMessage": true,
      "exec": function(data) {
        var toSend = ".\n";
        var user = data.parameters[0] === undefined ? data.name : data.parameters[0].replace("@", "").replace(/^me/gi, data.name);
        
        if (ChatbotSpec.viewers.hasOwnProperty(user)) {
          var totalTime;
          if (ChatbotSpec.viewers[user].stats.first_join !== null) {
            totalTime = (((new Date()).getTime()) - ChatbotSpec.viewers[user].stats.first_join);
          } else {
            totalTime = 0;
          }
          toSend += "@" + user + "'s statistics:\n";
          toSend += "‌‌ - Total time in stream: " + totalTime + " milliseconds\n";
          toSend += "‌‌ - Permissions:\n";
          for (var i in ChatbotSpec.viewers[user].permissions) {
            toSend += "‌‌ ‌‌ • [" + i + "] " + (ChatbotSpec.viewers[user].permissions[i] === true ? "Yes." : "No.") + "\n";
          }
        } else {
          toSend += "Unknown user \"" + user + "\"!";
        }
        
        sendMessage(toSend);
      },
      "desc": "Displays statistics for a certain user.",
      "usage": "<command> <user>"
    },
    "ban": {
      "requiresParams": true,
      "requiresPermission": true,
      "sendsChatMessage": true,
      "exec": function(data) {
        data.who = data.parameters[0].replace("@", "");
        data.parameters.shift();
        
        data.reason = (data.parameters.join(" ") || "No reason provided.");
        data.reason += " | To appeal this ban, please send GigabyteGiant a message at https://www.livecoding.tv/{user}/settings/messages/?message=GigabyteGiant".replace("{user}", data.who);
        
        if (ChatbotSpec.viewers.hasOwnProperty(data.who)) {
          if (!ChatbotSpec.viewers[data.who].permissions.admin) {
            Candy.Core.Action.Jabber.Room.Admin.UserAction(candyChatroom, candyChatroom + "/" + data.who, "kick", data.reason);
            ChatbotSpec.viewers[data.who].ban = {
              isBanned: true,
              reason: data.reason
            };
          } else {
            if (ChatbotSpec.viewers[data.name].permissions.owner) {
              Candy.Core.Action.Jabber.Room.Admin.UserAction(candyChatroom, candyChatroom + "/" + data.who, "kick", data.reason);
              ChatbotSpec.viewers[data.who].ban = {
                isBanned: true,
                reason: data.reason
              };
            } else {
              sendMessage(ChatbotSpec.label + "@" + data.who + " is an admin.");
            }
          }
        } else {
          sendMessage(ChatbotSpec.label + "I don't know who @" + data.who + " is.");
        }
      },
      "desc": "Bans user from chat, until pardoned by admin.",
      "usage": "<command> <user> <reason>"
    },
    "pardon": {
      "requiresParams": true,
      "requiresPermission": true,
      "sendsChatMessage": true,
      "exec": function(data) {
        data.who = data.parameters[0].replace("@", "");
        
        if (ChatbotSpec.viewers.hasOwnProperty(data.who)) {
          if (ChatbotSpec.viewers[data.who].ban !== undefined && ChatbotSpec.viewers[data.who].ban.isBanned) {
            ChatbotSpec.viewers[data.who].ban.isBanned = false;
            ChatbotSpec.viewers[data.who].ban.reason = "";
            sendMessage(ChatbotSpec.label + "@" + data.who + " unbanned by " + data.name + ".");
          } else {
            sendMessage(ChatbotSpec.label + "@" + data.who + " is not currently banned.");
          }
        } else {
          sendMessage(ChatbotSpec.label + "I don't know who @" + data.who + " is.");
        }
      },
      "desc": "Unbans user from chat.",
      "usage": "<command> <user>"
    },
    "report": {
      "requiresParams": true,
      "requiresPermission": false,
      "sendsChatMessage": true,
      "exec": function(data) {
        data.who = data.parameters[0].replace("@", "");
        data.parameters.shift();
        data.reason = (data.parameters.join(" ") || "No reason provided.");
        
        new Notification(data.who + " was reported!", { body: data.reason });
      },
      "desc": "Publicly report people for doing bad things.",
      "usage": "<command> <user> <reason>"
    },
    "set_greeting": {
      "requiresParams": true,
      "requiresPermissions": true,
      "sendsChatMessage": true,
      "exec": function(data) {
        data.who = data.parameters[0].replace("@", "");
        data.parameters.shift();
        data.newMsg = (data.parameters.join(" ") || "");
        
        if (ChatbotSpec.viewers.hasOwnProperty(data.who)) {
          if (ChatbotSpec.viewers[data.name].permissions.owner) {
            ChatbotSpec.viewers[data.who].greeting = data.newMsg;
            localStorage.setItem("viewers", JSON.stringify(ChatbotSpec.viewers));
            sendMessage(ChatbotSpec.label + "@" + data.who + "'s greeting message was set to \"" + data.newMsg + "\"!");
          }
        } else {
          sendMessage(ChatbotSpec.label + "Well this is awkward, I haven't met @" + data.who + ".");
        }
      }
    },
    "set_farewell": {
      "requiresParams": true,
      "requiresPermissions": true,
      "sendsChatMessage": true,
      "exec": function(data) {
        data.who = data.parameters[0].replace("@", "");
        data.parameters.shift();
        data.newMsg = (data.parameters.join(" ") || "");
        
        if (ChatbotSpec.viewers.hasOwnProperty(data.who)) {
          if (ChatbotSpec.viewers[data.name].permissions.owner) {
            ChatbotSpec.viewers[data.who].farewell = data.newMsg;
            localStorage.setItem("viewers", JSON.stringify(ChatbotSpec.viewers));
            sendMessage(ChatbotSpec.label + "@" + data.who + "'s farewell message was set to \"" + data.newMsg + "\"!");
          }
        } else {
          sendMessage(ChatbotSpec.label + "Well this is awkward, I haven't met @" + data.who + ".");
        }
      }
    }
  }
};

window.Chatbot = function(spec) {
  this.spec = spec;
  this.knownUsers = [ ];
  
  console.log("New chatbot created. Name: " + this.spec.name + " Version: " + this.spec.version);
  Notification.requestPermission();
};

Chatbot.prototype.onViewerJoin = function(evtInfo) {
  if (!ChatbotSpec.viewers.hasOwnProperty(evtInfo.name)) {
    ChatbotSpec.viewers[evtInfo.name] = {
      "permissions": {
        "owner": false,
        "admin": false,
        "moderator": false,
        "vip": false
      },
      "ban": {
        "isBanned": false,
        "reason": ""
      },
      "stats": {
        "first_join": (new Date()).getTime()
      }
    };
    localStorage.setItem("viewers", JSON.stringify(ChatbotSpec.viewers));
  } else {
    if (ChatbotSpec.viewers[evtInfo.name].stats.first_join === null) {
      ChatbotSpec.viewers[evtInfo.name].stats.first_join = (new Date()).getTime();
    }
  }
  if (this.knownUsers.indexOf(evtInfo.name) === -1) {
    if (!ChatbotSpec.misc.userJoinTimes.hasOwnProperty(evtInfo.name)) {
      ChatbotSpec.misc.userJoinTimes[evtInfo.name] = (new Date()).getTime();
    }
    if (ChatbotSpec.viewers[evtInfo.name].ban === undefined || !ChatbotSpec.viewers[evtInfo.name].ban.isBanned) {
      this.knownUsers.push(evtInfo.name);
      if (this.spec.events.viewerJoin === undefined) {
        return (function(data) {
          console.log(data.name + " joined!");
        })(evtInfo);
      } else {
        return this.spec.events.viewerJoin(evtInfo);
      }
    } else {
      ChatbotSpec.commands.kick.exec({ parameters: [ evtInfo.name, ChatbotSpec.viewers[evtInfo.name].ban.reason ], name: "GigabyteGiant" });
    }
  }
};
Chatbot.prototype.onViewerLeave = function(evtInfo) {
  this.knownUsers.splice(this.knownUsers.indexOf(evtInfo.name), 1);
  if (this.spec.events.viewerLeave === undefined) {
    return (function(data) {
      console.log(data.name + " left!");
    })(evtInfo);
  } else {
    return this.spec.events.viewerLeave(evtInfo);
  }
};
Chatbot.prototype.onViewerKick = function(evtInfo) {
  this.knownUsers.splice(this.knownUsers.indexOf(evtInfo.name), 1);
};
Chatbot.prototype.onViewerFollow = function(evtInfo) {
  if (this.spec.events.viewerFollow) {
    return this.spec.events.viewerFollow(evtInfo);
  }
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
      sendMessage(ChatbotSpec.label + "Command usage:\n");
      sendMessage(ChatbotSpec.commands[command].usage.replace("<command>", ChatbotSpec.label + "\"" + ChatbotSpec.commandInitializer + command) + "\"");
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

/*
 * LCTV Follow Event Dispatcher generously provided by @kristian (https://www.livecoding.tv/kristian/)
 * GitHub: https://github.com/kristianheljas/LCTVFollowEventDispatcher
 */
$.getScript("https://cdn.rawgit.com/kristianheljas/LCTVFollowEventDispatcher/e2ff64af52d373205377cf59c7f74ccf7017a7c9/LCTVFollowEventDispatcher.js", function() {
  console.log("LCTVFollowEventDispatcher loaded!");
});

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
      case "kick":
        chatbot.onViewerKick({ name: who });
        break;
    }
  } catch (err) {
    console.warn("Oh No! Something 'sploded.");
    console.log(err);
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
});

$(window).on("LCTV:follow", function(evt, index, followerObj) {
  chatbot.onViewerFollow(followerObj);
});