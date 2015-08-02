var viewerPerms = {
  "GigabyteGiant": {
    "permissions": {
      "owner": true,
      "admin": true,
      "moderator": true,
      "vip": true
    },
    "greeting": "I have arrived.",
    "online": false
  },
  "Lokio27": {
    "permissions": {
      "owner": false,
      "admin": true,
      "moderator": true,
      "vip": true
    },
    "greeting": "<Sp00k>",
    "farewell": "</Sp00k>",
    "online": false
  },
  "drmjg": {
    "permissions": {
      "owner": false,
      "admin": true,
      "moderator": true,
      "vip": true
    },
    "greeting": "An admin is upon us!",
    "farewell": "DUN BAN ME {username}!",
    "online": false
  },
  "kristian": {
    "permissions": {
      "owner": false,
      "admin": true,
      "moderator": true,
      "vip": true
    },
    "greeting": "Get back to work {username} :D",
    "online": false
  }
};

localStorage.setItem("viewers", JSON.stringify(viewerPerms));