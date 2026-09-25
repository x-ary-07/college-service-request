// This is the base URL of our FastAPI backend.
// Both pages use this same address.
const API_URL = "http://127.0.0.1:8000";

// ---------- CODE FOR index.html (the request form) ----------
const requestForm = document.getElementById("requestForm");

if (requestForm) {
  requestForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // stop the page from reloading (default form behavior)

    // Collect data from the form fields
    const requestData = {
      name: document.getElementById("name").value,
      id_number: document.getElementById("id_number").value,
      email: document.getElementById("email").value,
      role: document.getElementById("role").value,
      service_type: document.getElementById("service_type").value,
      description: document.getElementById("description").value
    };

    const resultBox = document.getElementById("resultBox");
    const errorBox = document.getElementById("errorBox");
    resultBox.classList.add("hidden");
    errorBox.classList.add("hidden");

    try {
      // Send a POST request to FastAPI with the form data as JSON
      const response = await fetch(`${API_URL}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error("Server rejected the request. Check all fields are filled correctly.");
      }

      const data = await response.json();

      // Show the success box with the returned Request ID and status
      document.getElementById("resultId").textContent = data.request_id;
      document.getElementById("resultStatus").textContent = data.status;
      resultBox.classList.remove("hidden");

      requestForm.reset();

    } catch (error) {
      errorBox.textContent = "Error: " + error.message;
      errorBox.classList.remove("hidden");
    }
  });
}


// ---------- CODE FOR admin.html (the dashboard) ----------
const requestsTableBody = document.getElementById("requestsTableBody");

if (requestsTableBody) {

  // Fetches all requests from FastAPI and draws them into the table
  async function loadRequests() {
    try {
      const response = await fetch(`${API_URL}/requests`);
      const requests = await response.json();

      requestsTableBody.innerHTML = ""; // clear existing rows

      const noDataMsg = document.getElementById("noDataMsg");
      if (requests.length === 0) {
        noDataMsg.classList.remove("hidden");
        return;
      } else {
        noDataMsg.classList.add("hidden");
      }

      requests.forEach((req) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${req.request_id}</td>
          <td>${req.name}</td>
          <td>${req.id_number}</td>
          <td>${req.role}</td>
          <td>${req.service_type}</td>
          <td>${req.description}</td>
          <td class="${statusClass(req.status)}">${req.status}</td>
          <td>
            <select class="status-select" data-id="${req.request_id}">
              <option value="Pending" ${req.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="In Progress" ${req.status === "In Progress" ? "selected" : ""}>In Progress</option>
              <option value="Completed" ${req.status === "Completed" ? "selected" : ""}>Completed</option>
            </select>
          </td>
        `;

        requestsTableBody.appendChild(row);
      });

      // Attach a "change" listener to every status dropdown just created
      document.querySelectorAll(".status-select").forEach((select) => {
        select.addEventListener("change", async function () {
          const requestId = this.getAttribute("data-id");
          const newStatus = this.value;
          await updateStatus(requestId, newStatus);
        });
      });

    } catch (error) {
      alert("Failed to load requests: " + error.message);
    }
  }

  // Sends a PUT request to FastAPI to update a request's status
  async function updateStatus(requestId, newStatus) {
    try {
      const response = await fetch(`${API_URL}/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      loadRequests(); // reload the table to reflect the change
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  function statusClass(status) {
    if (status === "Pending") return "status-pending";
    if (status === "In Progress") return "status-inprogress";
    if (status === "Completed") return "status-completed";
    return "";
  }

  // Load requests as soon as the admin page opens
  loadRequests();

  // Also reload when the Refresh button is clicked
  document.getElementById("refreshBtn").addEventListener("click", loadRequests);
}