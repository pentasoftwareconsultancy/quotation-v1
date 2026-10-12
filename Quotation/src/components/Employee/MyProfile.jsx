import React, { useEffect, useState } from 'react';




const MyProfile = () => {

  const fileInputRef = React.useRef(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState({ type: '', text: '' });
  const [isFocusedOnNewPassword, setIsFocusedOnNewPassword] = useState(false);

  const handlePhotoClick = () => {
  fileInputRef.current.click();
};
const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/employee/profile/photo/${empId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photo: reader.result }),
        }
      );

      if (!res.ok) throw new Error("Photo update failed");

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
    } catch (err) {
      alert(err.message);
    }
  };

  reader.readAsDataURL(file); // converts image to Base64
};


  const handleSave = async () => {
  try {
    const res = await 
      fetch(`http://localhost:8080/api/employee/profile/update/${empId}`,

      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    if (!res.ok) throw new Error("Update failed");

    const updatedProfile = await res.json();
    setProfile(updatedProfile);
    setIsEditing(false);
  } catch (err) {
    alert(err.message);
  }
};

// ✅ HANDLE PASSWORD CHANGE
const handleChangePassword = async () => {
  setPasswordChangeMessage({ type: '', text: '' });

  // Validation
  if (!changePasswordData.currentPassword) {
    setPasswordChangeMessage({ type: 'error', text: 'Please enter your current password' });
    return;
  }

  if (!changePasswordData.newPassword) {
    setPasswordChangeMessage({ type: 'error', text: 'Please enter a new password' });
    return;
  }

  if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
    setPasswordChangeMessage({ type: 'error', text: 'New password and confirmation do not match' });
    return;
  }

  if (!isNewPasswordValid) {
    setPasswordChangeMessage({ type: 'error', text: 'New password must meet all requirements' });
    return;
  }

  if (changePasswordData.currentPassword === changePasswordData.newPassword) {
    setPasswordChangeMessage({ type: 'error', text: 'New password must be different from current password' });
    return;
  }

  setPasswordChangeLoading(true);

  try {
    const res = await fetch(
      `http://localhost:8080/api/employee/profile/change-password/${empId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setPasswordChangeMessage({ type: 'error', text: data.message || 'Failed to change password' });
      return;
    }

    setPasswordChangeMessage({ type: 'success', text: 'Password changed successfully! ✅' });
    setChangePasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    setTimeout(() => {
      setShowChangePassword(false);
      setPasswordChangeMessage({ type: '', text: '' });
    }, 2000);
  } catch (err) {
    setPasswordChangeMessage({ type: 'error', text: 'Error changing password: ' + err.message });
  } finally {
    setPasswordChangeLoading(false);
  }
};


  // 🔹 profile state (same fields as before)
  const [profile, setProfile] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: ""
})

  // 🔹 logged-in employee id (saved during login)
  const empId = localStorage.getItem("empId");

  // 🔹 fetch profile from backend
  useEffect(() => {
    if (!empId) return;

    fetch(`http://localhost:8080/api/employee/profile/${empId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Profile not found");
        }
        return res.json();
      })
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, [empId]);

  useEffect(() => {
  if (profile) {
    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || ""
    });
  }
}, [profile]);



  // � Password Validation for new password
  const newPassword = changePasswordData.newPassword || "";

  const passwordRules = {
    length: newPassword.length >= 8,
    capital: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  };

  const validCount = Object.values(passwordRules).filter(Boolean).length;
  const isNewPasswordValid = validCount === 4;

  // �🔹 loading state
  if (!profile) {
    return <p className="p-6">Loading profile...</p>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">My Profile</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            View your personal information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* LEFT CARD */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-8">
          <div className="text-center">
           <div onClick={handlePhotoClick} className="w-40 h-40 sm:w-46 sm:h-46 rounded-full mx-auto mb-4 overflow-hidden bg-gray-200 flex items-center justify-center">
            {profile.photo ? (
             <img
              src={profile.photo}
              alt="Profile"
              className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-white text-2xl sm:text-3xl font-bold bg-green-500 w-full h-full flex items-center justify-center">
      {profile.name?.charAt(0)}
    </span>
  )}
</div>

<input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  onChange={handlePhotoChange}
  style={{ display: "none" }}
/>

            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              {profile.name}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {profile.department}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Employee ID: {profile.empId}
            </p>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
  <h3 className="text-lg font-semibold text-gray-800">
    Personal Information
  </h3>

  <div className="flex gap-2">
    {!isEditing ? (
      <>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          Update
        </button>
        <button
          onClick={() => setShowChangePassword(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          🔐 Change Password
        </button>
      </>
    ) : (
      <div className="space-x-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
            });
          }}
          className="px-4 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
        >
          Cancel
        </button>
      </div>
    )}
  </div>
</div>


          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Info
              label="Full Name"
              value={formData.name}
              editable={isEditing}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <Info
              label="Email"
              value={formData.email}
              editable={isEditing}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Info
              label="Phone"
              value={formData.phone}
              editable={isEditing}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />

            {/* READ ONLY */}
            <Info label="Department" value={profile.department} />
            <Info label="Employee ID" value={profile.empId} />
            <Info label="Join Date" value={profile.joinDate} />
          </div>

          </div>
        </div>
      </div>

      {/* ✅ CHANGE PASSWORD MODAL */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">🔐 Change Password</h3>
              <button 
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordChangeMessage({ type: '', text: '' });
                  setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Message Alert */}
            {passwordChangeMessage.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
                passwordChangeMessage.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {passwordChangeMessage.text}
              </div>
            )}

            <form className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={changePasswordData.currentPassword}
                  onChange={(e) => setChangePasswordData({
                    ...changePasswordData,
                    currentPassword: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Enter your current password"
                  disabled={passwordChangeLoading}
                />
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={changePasswordData.newPassword}
                  onChange={(e) => setChangePasswordData({
                    ...changePasswordData,
                    newPassword: e.target.value
                  })}
                  onFocus={() => setIsFocusedOnNewPassword(true)}
                  onBlur={() => setIsFocusedOnNewPassword(false)}
                  className={`w-full p-3 border rounded-lg text-sm transition-all duration-300 ${
                    isFocusedOnNewPassword && isNewPasswordValid
                      ? "border-green-500 bg-green-50 focus:ring-2 focus:ring-green-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                  }`}
                  placeholder="Enter new password"
                  disabled={passwordChangeLoading}
                />

                {isFocusedOnNewPassword && changePasswordData.newPassword.length > 0 && !isNewPasswordValid && (
                  <div className="absolute left-0 top-full mt-2 w-full z-20 
                       bg-red-50 border border-red-300 text-red-600 
                       text-xs px-3 py-2 rounded-lg shadow-lg flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-7.2 12.48A1 1 0 004 18h16a1 1 0 00.91-1.66l-7.2-12.48a1 1 0 00-1.72 0z" />
                    </svg>
                    <span>Password must be 8+ characters with uppercase, number, and special character.</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={changePasswordData.confirmPassword}
                  onChange={(e) => setChangePasswordData({
                    ...changePasswordData,
                    confirmPassword: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Confirm new password"
                  disabled={passwordChangeLoading}
                />
                {changePasswordData.confirmPassword && changePasswordData.newPassword !== changePasswordData.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={passwordChangeLoading || !changePasswordData.currentPassword || !changePasswordData.newPassword || !changePasswordData.confirmPassword}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium text-sm transition-all"
                >
                  {passwordChangeLoading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordChangeMessage({ type: '', text: '' });
                    setChangePasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  disabled={passwordChangeLoading}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white py-2 rounded-lg font-medium text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 🔹 helper component (no UI change)
const Info = ({ label, value, editable, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>

    {editable ? (
      <input
        value={value}
        onChange={onChange}
        className="w-full border p-2 sm:p-3 rounded-lg text-sm sm:text-base"
      />
    ) : (
      <div className="w-full border p-2 sm:p-3 rounded-lg bg-gray-50 text-sm sm:text-base text-gray-800">
        {value}
      </div>
    )}
  </div>
);

export default MyProfile;
