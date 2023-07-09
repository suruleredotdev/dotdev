export function logError(msg) {
  document.getElementById("settings-error").style.display = "block";
  document.getElementById("settings-error-msg").innerHTML = msg + "</br>";
}

export function hideError() {
  document.getElementById("settings-error").style.display = "none";
  document.getElementById("settings-error-msg").textContent = "";
}
