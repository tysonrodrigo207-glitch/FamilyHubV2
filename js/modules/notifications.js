const NotificationModule = {

  notifications: [

    {
      id: 1,
      text: "Welcome to Family Hub 🎉",
      time: "Just now",
      read: false
    }

  ],

  add(text) {

    this.notifications.unshift({

      id: Date.now(),

      text,

      time: "Just now",

      read: false

    });

  }

};