const Notifications = {
  request: async () => {
    if (!("Notification" in window)) { alert("This browser does not support notifications."); return; }
    
    if (Notification.permission === "granted") {
      Notifications.send();
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      document.getElementById('notifToggle').classList.add('on');
      Notifications.send();
    }
  },
  send: () => {
    new Notification("DeGirob VIP", {
      body: "🔔 Notifications are now active! You will receive alerts for new Golden Picks.",
      icon: "https://cdn-icons-png.flaticon.com/512/8146/8146904.png"
    });
  }
};
