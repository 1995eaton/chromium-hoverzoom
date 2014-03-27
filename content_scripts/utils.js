Object.prototype.isInput = function() {
  return (
      (this.nodeName === "TEXTAREA" || this.nodeName === "INPUT") &&
      !/button|image|checkbox|submit/.test(this.getAttribute("type"))
  );
};

Event.prototype.modifiers = function() {
  return this.shiftKey || this.metaKey || this.altKey;
};
