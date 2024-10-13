// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("updateBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Get the confirm button
var confirmBtn = document.getElementById("confirmBtn");

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks on cancel button, close the modal
document.getElementById("cancelBtn").onclick = function() {
  modal.style.display = "none";
}

// When the user clicks on confirm button, do something
confirmBtn.onclick = function() {
  // Perform your download or redirect logic here
  window.open("https://downloadurl.com", "_blank");
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
