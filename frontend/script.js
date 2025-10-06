const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#fileInput");
const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");
const sharingContainer = document.querySelector(".sharing-container");
const fileURLinput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");
const emailForm = document.querySelector("#emailForm");

const host = "https://inshare-backend-sdxe.onrender.com";
const uploadURL = `${host}/api/files`;
const emailURL = `${host}/api/files/send`;

// Drag events
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
    uploadFile();
  }
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

copyBtn.addEventListener("click", () => {
  fileURLinput.select();
  document.execCommand("copy");
  // Optional: Show feedback
  copyBtn.innerText = "Copied!";
  setTimeout(() => {
    copyBtn.innerText = "Copy";
  }, 2000);
});

const uploadFile = () => {
  progressContainer.style.display = "block";
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("myfile", file);

  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      try {
        if (xhr.status === 200) {
          const jsonResponse = JSON.parse(xhr.responseText);
          onUploadSuccess(jsonResponse);
        } else {
          console.error("Upload failed with status:", xhr.status);
          console.error("Response:", xhr.responseText);
          alert(`Upload failed: ${xhr.status}. Please try again.`);
          progressContainer.style.display = "none";
        }
      } catch (err) {
        console.error("Failed to parse JSON response:", xhr.responseText);
        alert("Upload failed. Please try again.");
        progressContainer.style.display = "none";
      }
    }
  };

  xhr.upload.onprogress = updateProgress;
  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const updateProgress = (e) => {
  const percent = Math.round((e.loaded / e.total) * 100);
  bgProgress.style.width = `${percent}%`;
  percentDiv.innerText = percent;
  progressBar.style.transform = `scaleX(${percent / 100})`;
};

const onUploadSuccess = ({ file: url }) => {
  fileInput.value = "";
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURLinput.value = url;
};

// Email form submission with proper error handling
emailForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = fileURLinput.value;
  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  console.log("Sending email with data:", formData);

  // Disable submit button
  const submitBtn = emailForm.querySelector('button[type="submit"]');
  submitBtn.setAttribute("disabled", "true");
  submitBtn.innerText = "Sending...";

  try {
    const response = await fetch(emailURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    console.log("Response status:", response.status);

    // Parse response
    const data = await response.json();
    console.log("Response data:", data);

    if (response.ok && data.success) {
      // Success
      alert("Email sent successfully!");
      sharingContainer.style.display = "none";
      // Reset form
      emailForm.reset();
    } else {
      // Server returned an error
      console.error("Email send failed:", data);
      alert(
        data.error || data.message || "Failed to send email. Please try again.",
      );
      submitBtn.removeAttribute("disabled");
      submitBtn.innerText = "Send";
    }
  } catch (error) {
    // Network or parsing error
    console.error("Email send error:", error);
    alert("Failed to send email. Please check your connection and try again.");
    submitBtn.removeAttribute("disabled");
    submitBtn.innerText = "Send";
  }
});
