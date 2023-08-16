// POST method implementation:
async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST", headers: {
      "Content-Type": "application/json",
    }, body: JSON.stringify(data),
  });
  return response.json();
}

sendButton.addEventListener("click", async () => {
  questionInput = document.getElementById("questionInput").value;
  document.getElementById("questionInput").value = "";
  document.querySelector(".right2").style.display = "block"
  document.querySelector(".right").style.display = "none"

  question1.innerHTML = questionInput;
  question2.innerHTML = questionInput;

  // Get the answer and populate it
  let result = await postData("/api", { "question": questionInput })
  solution.innerHTML = result.answer
})


function toggleSidebar() {
  var sidebarContainer = document.getElementById('sidebarContainer');
  var openSidebarButtonContainer = document.getElementById('openSidebar');
  var currentState = sidebarContainer.getAttribute('data-state');

  if (currentState === 'closed') {
    // Hide the sidebar
    sidebarContainer.style.display = 'none';
    sidebarContainer.setAttribute('data-state', 'open');

    // Show the "Open sidebar" button
    openSidebarButtonContainer.style.display = 'block';
  } else {
    // Show the sidebar
    sidebarContainer.style.display = 'block';
    sidebarContainer.setAttribute('data-state', 'closed');

    // Hide the "Open sidebar" button
    openSidebar.style.display = 'none';
  }
}

function editChat(chatId, question) {
  const updatedQuestion = prompt("Edit your question:", question);
  if (updatedQuestion !== null && updatedQuestion.trim() !== "") {
    const data = { question: updatedQuestion };
    fetch(`/api/edit/${chatId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        location.reload(); // Refresh the page to see the updated chat
      })
      .catch((error) => {
        console.error("Error updating chat:", error);
      });
  }
}

function deleteChat(chatId) {
  if (confirm("Are you sure you want to delete this chat?")) {
    fetch(`/api/delete/${chatId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        location.reload(); // Refresh the page to see the updated chat list
      })
      .catch((error) => {
        console.error("Error deleting chat:", error);
      });
  }
}

// chat functionality for right2
document.addEventListener('DOMContentLoaded', () => {
  const questionInput = document.getElementById('questionInput');
  const sendButton = document.getElementById('sendButton');
  const questionInput2 = document.getElementById('questionInput2');
  const sendButton2 = document.getElementById('sendButton2');
  const question1 = document.getElementById('question1');
  const question2 = document.getElementById('question2');
  const solution = document.getElementById('solution');

  // Function to load chat history when the page loads
  function loadChatHistory() {
    fetch('/api')
      .then((response) => response.json())
      .then((data) => {
        question1.textContent = data.question;
        question2.textContent = data.question; // Update the previous question with the new one
        solution.textContent = data.answer;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  // Call the function to load chat history
  loadChatHistory();

  function sendUserQuestion(question) {
    const formData = { question };
    fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        question1.textContent = data.question; // Update the chatbot's question
        question2.textContent = data.question; // Update the previous question with the new one
        solution.textContent = data.answer;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function toggleChatSections() {
    const right = document.querySelector('.right');
    const right2 = document.querySelector('.right2');
    right.style.display = right.style.display === 'none' ? 'block' : 'none';
    right2.style.display = right2.style.display === 'none' ? 'none' : 'block';
  }

  sendButton.addEventListener('click', () => {
    const userQuestion = questionInput.value.trim();
    if (userQuestion !== '') {
      sendUserQuestion(userQuestion);
      questionInput.value = '';
      toggleChatSections();
    }
  });

  questionInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const userQuestion = questionInput.value.trim();
      if (userQuestion !== '') {
        sendUserQuestion(userQuestion);
        questionInput.value = '';
        toggleChatSections();
      }
    }
  });

  sendButton2.addEventListener('click', () => {
    const userQuestion = questionInput2.value.trim();
    if (userQuestion !== '') {
      sendUserQuestion(userQuestion);
      questionInput2.value = '';
    }
  });

  questionInput2.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const userQuestion = questionInput2.value.trim();
      if (userQuestion !== '') {
        sendUserQuestion(userQuestion);
        questionInput2.value = '';
      }
    }
  });
});



// Function to handle the loading state of the button
function setButtonLoading(loading) {
  const regenerateButton = document.getElementById('regenerateButton');
  regenerateButton.disabled = loading;

  if (loading) {
    regenerateButton.innerHTML = '<span class="loading-dot"></span> Generating...';
  } else {
    regenerateButton.innerHTML = '<svg stroke="currentColor" fill="none" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 flex-shrink-0" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"> <polyline points="1 4 1 10 7 10"></polyline> <polyline points="23 20 23 14 17 14"></polyline> <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg> <span class="RR" style="margin-left: 10px ">Regenerate Response</span>';
  }
}

// Function to regenerate the response
async function regenerateResponse() {
  const inputQuestion = document.getElementById('questionInput2').value;
  const chatbotResponse = document.getElementById('question1');

  try {
    // Set the button to the loading state while waiting for the response
    setButtonLoading(true);

    // Make a POST request to the Flask server's /api/regenerate endpoint
    const response = await fetch('/api/regenerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: inputQuestion })
    });

    const data = await response.json();

    if (data.answer) {
      // If a new response is available, update the chatbot's response display
      const newResponse = data.answer;
      chatbotResponse.textContent = newResponse;
    } else {
      // If no more responses are available, disable the "Regenerate Response" button and display feedback
      setButtonLoading(false);
      chatbotResponse.textContent = "No more responses available.";
    }
  } catch (error) {
    console.error('Error generating response:', error);
  } finally {
    // Reset the button to the default state after the response is received
    setButtonLoading(false);
  }
}

// Event listener for the "Regenerate Response" button
document.getElementById('regenerateButton').addEventListener('click', regenerateResponse);



document.addEventListener("DOMContentLoaded", function () {
  var typed = new Typed("#names", {
    strings: ['Kunal', 'Pratham', 'Nishant', 'Aaswit'],
    typeSpeed: 60,
  });
});