const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const complaintService = {
  async getComplaints() {
    const response = await fetch(`${API_BASE_URL}/complaints`);
    if (!response.ok) {
      throw new Error("Failed to fetch complaints");
    }
    return response.json();
  },

  async createComplaint(complaintData) {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(complaintData),
    });

    if (!response.ok) {
      throw new Error("Failed to create complaint");
    }
    return response.json();
  },

  async getComplaintById(id) {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch complaint details");
    }
    return response.json();
  },

  async updateComplaintStatus(id, updateData) {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error("Failed to update complaint status");
    }
    return response.json();
  },

  async deleteComplaint(id, userId) {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete complaint");
    }
    return response.json();
  },
};
