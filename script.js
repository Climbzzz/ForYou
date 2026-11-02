// Show or hide the extra message when the button is clicked.
const noteButton = document.querySelector("#note-button");
const extraNote = document.querySelector("#extra-note");

noteButton.addEventListener("click", function () {
  extraNote.hidden = !extraNote.hidden;

  if (extraNote.hidden) {
    noteButton.textContent = "Read one more thing";
  } else {
    noteButton.textContent = "Hide the message";
  }
});
