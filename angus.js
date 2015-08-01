window.candyChatroom = (function() {
  return (window.location.href.replace("https://www.livecoding.tv/chat/", "") || window.location.href.replace("https://www.livecoding.tv/", "")).replace("/", "@chat.livecoding.tv/");
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
  specialUsers: {
    "Sponge": {
      "exec": function(data) {
        sendMessage(ChatbotSpec.label + "@{username} *squish*".replace("{username}", data.name));
      }
    },
    "JPG2000": {
      "exec": function(data) {
        sendMessage(ChatbotSpec.label + "@{username} DOWN WITH BOB THE BOT!".replace("{username}", data.name));
      }
    },
    "Lokio27": {
      "exec": function(data) {
        sendMessage(ChatbotSpec.label + "@{username} YOU HAX0R".replace("{username}", data.name));
      }
    },
    "Retnuh": {
      "exec": function(data) {
        sendMessage(ChatbotSpec.label + "Alizee doe; right @{username}?".replace("{username}", data.name));
      }
    }
  },
  events: {
    "viewerLeave": function(data) {
      sendMessage(ChatbotSpec.label + "Thanks for stopping by @" + data.name);
    },
    "viewerJoin": function(data) {
      sendMessage(ChatbotSpec.label + "Welcome to the channel @" + data.name);
      
      if (ChatbotSpec.specialUsers.hasOwnProperty(data.name)) {
        ChatbotSpec.specialUsers[data.name].exec({name: data.name});
      }
    }
  },
  commands: {
    "bot": {
      "acceptsParameters": false,
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
      "acceptsParameters": true,
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
          sendMessage(ChatbotSpec.label + "@" + data.name + " Here is a list of the commands:");
          for (var i in ChatbotSpec.commands) {
            sendMessage(ChatbotSpec.label + ChatbotSpec.commandInitializer + i);
          }
          sendMessage(ChatbotSpec.label + "Type \"" + ChatbotSpec.commandInitializer + "help <command>\" for more information about a specific command.");
        }
      },
      "desc": "Displays help about a specific command"
    }
  }
};

window.Chatbot = function(spec) {
  this.spec = spec;
  
  console.log("New chatbot created. Name: " + this.spec.name + " Version: " + this.spec.version);
};

Chatbot.prototype.onViewerJoin = function(evtInfo) {
  if (this.spec.events.viewerJoin === undefined) {
    return (function(data) {
      console.log(data.name + " joined!");
    })(evtInfo);
  } else {
    return this.spec.events.viewerJoin(evtInfo);
  }
};
Chatbot.prototype.onViewerLeave = function(evtInfo) {
  if (this.spec.events.viewerLeave === undefined) {
    return (function(data) {
      console.log(data.name + " left!");
    })(evtInfo);
  } else {
    return this.spec.events.viewerLeave(evtInfo);
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
        ChatbotSpec.commands[command].exec(msgData);
      }
    }
  }
};

var chatbot = new Chatbot(ChatbotSpec);

/* Upon presence update */
$(Candy).on("candy:core.presence.room", function(evt, args) {
  var who = args.user.data.nick;
  switch (args.action) {
    case "join":
      chatbot.onViewerJoin({ name: who });
      break;
    case "leave":
      chatbot.onViewerLeave({ name: who });
      break;
  }
});

$(Candy).on('candy:view.message.before-show', function(evt, args) {
  if (chatbot.looksLikeCommand({name: args.name, message: args.message})) {
    chatbot.onCommand({name: args.name, message: args.message});
  }
});