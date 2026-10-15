import React, { useEffect, useState } from "react";

const EditProfile = () => {

  // ✅ THIS MUST BE USERNAME (not password)
  const loggedInUsername = "admin"; // later store from JWT/localStorage

  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ LOAD ADMIN USERNAME
  useEffect(() => {
    fetch(`http://localhost:8080/api/admin/profile/${loggedInUsername}`)
      .then(res => {
        if (!res.ok) throw new Error("Admin not found");
        return res.json();
      })
      .then(data => {
        setUsername(data.username || "");
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const response = await fetch(
      `http://localhost:8080/api/admin/update-credentials/${loggedInUsername}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          currentPassword,
          newPassword
        })
      }
    );

    const msg = await response.text();
    alert(msg);

    if (response.ok) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };
return (
  <div >
    <h1 className="text-3xl font-bold mb-4">My Profile</h1>
    <p className="text-gray-500 mb-8"> update your personal information</p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* LEFT PROFILE CARD */}
      <div className="bg-white rounded-xl border p-12 flex flex-col items-center">
        <div className="w-34 h-34 rounded-full bg-green-600 flex items-center justify-center text-white text-6xl font-bold">
          {username?.charAt(0)?.toUpperCase()}
        </div>

        <h2 className="mt-9 text-xl font-semibold">{username}</h2>
        
      </div>

      {/* RIGHT EDIT FORM */}
      <div className="md:col-span-2 bg-white rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Username */}
          <div>
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          {/* Current Password */}
          <div>
            <label className="text-sm font-medium">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
);


};

export default EditProfile;
