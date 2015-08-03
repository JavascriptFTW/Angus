var viewerPerms = {
  "GigabyteGiant": {
    "permissions": {
      "owner": true,
      "admin": true,
      "moderator": true,
      "vip": true
    },
    "ban": {
      "isBanned": false,
      "reason": ""
    },
    "stats": {
      "first_join": null
    },
    "greeting": "I have arrived.",
  },
  "Lokio27": {
    "permissions": {
      "owner": false,
      "admin": true,
      "moderator": true,
      "vip": true
    },
    "ban": {
      "isBanned": false,
      "reason": ""
    },
    "stats": {
      "first_join": null
    },
    "greeting": "<Sp00k>",
    "farewell": "</Sp00k>"
  },
  "drmjg": {
    "permissions": {
      "owner": false,
      "admin": true,
      "moderator": true,
      "vip": true
    },
    "ban": {
      "isBanned": false,
      "reason": ""
    },
    "stats": {
      "first_join": null
    },
    "greeting": "An admin is upon us!",
    "farewell": "DUN BAN ME {username}!"
  },
  "kristian": {
    "permissions": {
      "owner": false,
      "admin": true,
      "moderator": true,
      "vip": true
    },
    "ban": {
      "isBanned": false,
      "reason": ""
    },
    "stats": {
      "first_join": null
    },
    "greeting": "Get back to work {username} :D"
  }
};

localStorage.setItem("viewers", JSON.stringify(viewerPerms));