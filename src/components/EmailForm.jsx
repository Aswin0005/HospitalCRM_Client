import { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaHistory } from 'react-icons/fa';

export default function EmailForm() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [patients, setPatients] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [emailLog, setEmailLog] = useState([]);
  const [isLogVisible, setIsLogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateGroup, setUpdateGroup] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const patientGroups = [
    { id: 'cancer', name: 'Cancer Patients' },
    { id: 'diabetes', name: 'Diabetes Patients' },
    { id: 'wellness', name: 'General Wellness' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailData = {
      subject,
      message,
      patients,
      schedule: schedule ? schedule.toISOString() : null, // Convert date to ISO string
      status: schedule ? 'scheduled' : 'pending', // Set status based on scheduling
    };

    try {
      setLoading(true);
      await axios.post(
        'https://hospitalcrmserver-production.up.railway.app/api/send-email',
        emailData
      ); // Backend should handle scheduling
      toast.success('Email sent or scheduled successfully!');
      setEmailLog((prevLog) => [
        ...prevLog,
        { ...emailData, status: schedule ? 'scheduled' : 'success' },
      ]);
      setLoading(false);
      setSubject('');
      setMessage('');
      setPatients([]);
      setSchedule(null);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error('Error sending email!');
      setEmailLog((prevLog) => [
        ...prevLog,
        { ...emailData, status: 'failed' },
      ]);
    }
  };

  const handleSelectGroup = (groupId) => {
    if (patients.includes(groupId)) {
      setPatients(patients.filter((id) => id !== groupId));
    } else {
      setPatients([...patients, groupId]);
    }
  };

  const handleRemoveTag = (groupId) => {
    setPatients(patients.filter((id) => id !== groupId));
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'https://hospitalcrmserver-production.up.railway.app/api/update-group',
        {
          groupId: updateGroup,
          email: newEmail,
        }
      );
      toast.success('Email added to group successfully!');
      setNewEmail('');
      setShowUpdateForm(false);
    } catch (error) {
      console.error(error);
      toast.error('Error updating group email!');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl shadow-md relative">
      <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl">
        Send Email Announcement
      </h1>

      {/* View Log Button */}
      <button
        className="absolute top-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg hover:bg-blue-700 transition border flex items-center gap-2 justify-center"
        onClick={() => setIsLogVisible(true)}
      >
        <FaHistory />
        View Log
      </button>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <label className="block text-blue-700 font-semibold">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold">
            Select Patient Groups
          </label>
          {patientGroups.map((group) => (
            <div key={group.id}>
              <input
                type="checkbox"
                value={group.id}
                checked={patients.includes(group.id)}
                onChange={() => handleSelectGroup(group.id)}
              />
              <label className="ml-2">{group.name}</label>
            </div>
          ))}

          {/* Display selected groups as tags */}
          <div className="mt-4 space-x-2">
            {patients.map((groupId) => {
              const group = patientGroups.find((g) => g.id === groupId);
              return (
                <span
                  key={groupId}
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-2"
                >
                  {group.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(groupId)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-blue-700 font-semibold">
            Schedule Email
          </label>
          <DatePicker
            selected={schedule}
            onChange={(date) => setSchedule(date)}
            showTimeSelect
            dateFormat="Pp"
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg hover:bg-blue-600 hover:scale-105 duration-200 transition-transform flex justify-center items-center"
        >
          {loading ? (
            <div role="status">
              <svg
                aria-hidden="true"
                class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="white"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.6758 1.05197C51.7663 0.367361 46.7971 0.446049 41.9111 1.27842C39.4622 1.69427 37.9909 4.19778 38.628 6.62326C39.2652 9.04874 41.7502 10.4515 44.2095 10.1071C48.319 9.49234 52.4891 9.48949 56.6094 10.0966C61.949 10.8842 66.9958 12.8281 71.4545 15.8264C75.9132 18.8247 79.6821 22.791 82.5536 27.5051C84.9175 31.0124 86.6878 34.8424 87.7995 38.8755C88.5771 41.2381 91.5421 41.678 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
          ) : (
            'Send Email'
          )}
        </button>
        <button
          type="button"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg my-4 w-full hover:bg-blue-700 transition"
          onClick={() => setShowUpdateForm(true)}
        >
          Update Patient Group Emails
        </button>
      </form>

      {/* Update Patient Group Form */}
      {showUpdateForm && (
        <form onSubmit={handleUpdateGroup} className="p-6">
          <div className="mb-4">
            <label className="block text-blue-700 font-semibold">
              Select Group
            </label>
            <select
              value={updateGroup}
              onChange={(e) => setUpdateGroup(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            >
              <option value="">Select a group</option>
              {patientGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-blue-700 font-semibold">
              New Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg"
          >
            Add Email to Group
          </button>
        </form>
      )}

      {isLogVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-end">
          <div className="w-1/3 bg-white shadow-lg h-full p-6 overflow-y-auto">
            <button
              className="text-gray-600 hover:text-gray-800 font-bold mb-4"
              onClick={() => setIsLogVisible(false)}
            >
              Close
            </button>
            <h2 className="text-xl font-bold mb-4">Email Log</h2>
            {emailLog.length === 0 ? (
              <p className="text-gray-700">No emails sent yet.</p>
            ) : (
              <ul className="space-y-4">
                {emailLog.map((email, index) => (
                  <li
                    key={index}
                    className={`p-4 rounded-lg shadow ${
                      email.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <h3 className="font-bold text-lg">{email.subject}</h3>
                    <p className="text-sm">{email.message}</p>
                    <p className="text-sm">
                      <strong>Patient Groups:</strong>{' '}
                      {email.patients
                        .map(
                          (id) =>
                            patientGroups.find((group) => group.id === id)?.name
                        )
                        .join(', ')}
                    </p>
                    {email.schedule && (
                      <p className="text-sm">
                        <strong>Scheduled:</strong> {email.schedule.toString()}
                      </p>
                    )}
                    <p className="text-sm">
                      <strong>Status:</strong>{' '}
                      {email.status === 'success' ? 'Sent' : 'Failed'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
