/*var option = {
  key : "Ctrl+Shift+A",
  active : function() {
    console.log("Global desktop keyboard shortcut: " + this.key + " active."); 
  },
  failed : function(msg) {
    // :(, fail to register the |key| or couldn't parse the |key|.
    console.log(msg);
  },
  key : "MediaPlayPause",
  active : function() {
    console.log("Pressed shortcut"); 
  },
};

// Create a shortcut with |option|.
var shortcut = new gui.Shortcut(option);

// Register global desktop shortcut, which can work without focus.
gui.App.registerGlobalHotKey(shortcut);*/