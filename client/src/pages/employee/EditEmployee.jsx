import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../components/authentication";
import { useNavigate } from "react-router-dom";

const EditEmployeePage = () => {
  const { userId } = useAuth(); // Assuming userId is the logged-in employee's ID
  const [employeeData, setEmployeeData] = useState({
    first_name: "",
    middle_initial: "",
    last_name: "",
    department_id: 0,
    salary: "",
    ssn: "",
    hire_date: "",
    start_date: "",
  });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saveMessage, setSaveMessage] = useState(""); // State for success message
  const navigate = useNavigate();

  // Fetch employee data
  const fetchEmployeeData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/employee/${userId}`);
      setEmployeeData(res.data);
    } catch (err) {
      console.log("Error fetching employee data:", err);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [userId]);

  const handleEditClick = () => {
    setEditingEmployee({ ...employeeData });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/employee/${userId}`, editingEmployee);
      setEditingEmployee(null);
      fetchEmployeeData();

      // Set success message and hide it after 3 seconds
      setSaveMessage("Profile Updates Saved");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.log("Error updating employee data:", err);
    }
  };

  const handleCancelClick = () => {
    setEditingEmployee(null);
  };

  return (
    <>

      <h1 className="text-4xl md:text-3xl font-bold text-black mb-4 text-center">Edit Your Profile</h1>

      {/* Success Message */}
      {saveMessage && (
        <div className="text-green-600 font-semibold text-center mb-4">
          {saveMessage}
        </div>
      )}

      <div className="flex flex-col items-center space-y-6">
        {!editingEmployee ? (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 w-full md:w-3/4 lg:w-1/2">
            <h2 className="text-base text-black">First Name: {employeeData.first_name}</h2>
            <p className="text-base text-black">M.I: {employeeData.middle_initial}</p>
            <p className="text-base text-black">Last Name: {employeeData.last_name}</p>
            <p className="text-base text-black">Department ID: {employeeData.department_id}</p>
            <p className="text-base text-black">Salary: ${employeeData.salary}</p>
            <p className="text-base text-black">SSN: {employeeData.ssn}</p>
            <div className="flex flex-col items-center space-y-4 mt-4">
              <button
                onClick={handleEditClick}
                className="bg-gray-900 text-white px-6 py-3 rounded-md w-full md:w-1/2 lg:w-1/3 hover:bg-black transition duration-200"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 w-full md:w-3/4 lg:w-1/2">
            <h2 className="text-xl font-medium text-black">Edit Profile</h2>

            <label className="text-base text-gray-900">First Name</label>
            <input
              type="text"
              name="first_name"
              value={editingEmployee.first_name}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-4 py-2 mb-2 w-full"
            />

            <label className="text-base text-gray-900">M.I (optional)</label>
            <input
              type="text"
              name="middle_initial"
              maxLength="1"
              value={editingEmployee.middle_initial}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-4 py-2 mb-2 w-full"
            />

            <label className="text-base text-gray-900">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={editingEmployee.last_name}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-4 py-2 mb-2 w-full"
            />

            <label className="text-base text-gray-900">Department ID</label>
            <input
              type="number"
              name="department_id"
              value={editingEmployee.department_id}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-4 py-2 mb-2 w-full"
            />

            <label className="text-base text-gray-900">Salary</label>
            <input
              type="number"
              name="salary"
              value={editingEmployee.salary}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-4 py-2 mb-2 w-full"
            />

            <label className="text-base text-gray-900">SSN</label>
            <input
              type="text"
              name="ssn"
              value={editingEmployee.ssn}
              onChange={handleInputChange}
              className="border border-gray-300 rounded px-4 py-2 mb-2 w-full"
            />

            <div className="flex flex-col items-center space-y-4 mt-4">
              <button
                onClick={handleSaveClick}
                className="bg-gray-900 text-white px-6 py-3 rounded-md w-full md:w-1/2 lg:w-1/3 hover:bg-black transition duration-200"
              >
                Save
              </button>
              <button
                onClick={handleCancelClick}
                className="bg-gray-400 text-white px-6 py-3 rounded-md w-full md:w-1/2 lg:w-1/3 hover:bg-gray-500 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EditEmployeePage;
