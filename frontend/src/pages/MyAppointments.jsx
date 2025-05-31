import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const getUserIdFromToken = (token) => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = JSON.parse(atob(base64));
    return decodedPayload.userId || decodedPayload.id || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [showPhoneModalFor, setShowPhoneModalFor] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');

  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const slotDateFormat = (slotDate) => {
    const [day, month, year] = slotDate.split('_');
    return `${day} ${months[Number(month)]} ${year}`;
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      } else {
        toast.error(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+?\d{10,15})$/;
    return phoneRegex.test(phone);
  };

  const normalizePhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length === 10 && !phone.startsWith('+')) {
      return '+91' + digitsOnly;
    }
    if (phone.startsWith('+')) {
      return phone;
    }
    return '+' + digitsOnly;
  };

  const handlePayClick = (appointment) => {
    if (appointment.customer_phone && validatePhone(appointment.customer_phone)) {
      const normalizedPhone = normalizePhone(appointment.customer_phone);
      payOnline(appointment, normalizedPhone);
    } else {
      setShowPhoneModalFor(appointment._id);
      setPhoneInput('');
    }
  };

  const payOnline = async (appointment, phone) => {
  const normalizedPhone = normalizePhone(phone);
  if (!validatePhone(normalizedPhone)) {
    toast.error('Please enter a valid phone number, e.g. +919090407368 or 9090407368');
    return;
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    toast.error('User authentication error. Please login again.');
    return;
  }

  try {
    console.log('Sending payment request...');
    const { data } = await axios.post(
      `${backendUrl}/api/user/create-cashfree-order`,
      { amount: appointment.amount, customer_phone: normalizedPhone, userId },
      { headers: { token } }
    );

    console.log('Payment response from backend:', data);

    // Check if order_token or payment_link is present to confirm success
    if (data.order_token || data.payment_link) {
      // Use payment_link if available, else build URL manually from order_token
      const paymentUrl = data.payment_link
        ? data.payment_link
        : `https://sandbox.cashfree.com/pg/payment/order/${data.order_token}`;

      window.open(paymentUrl, '_blank');
      setShowPhoneModalFor(null);
    } else {
      toast.error(data.message || 'Payment initiation failed');
    }
  } catch (error) {
    console.error('Payment request failed:', error);
    toast.error(error.response?.data?.message || error.message);
  }
};


  const handleModalConfirm = () => {
    const appointment = appointments.find((appt) => appt._id === showPhoneModalFor);
    if (!appointment) {
      toast.error('Appointment not found');
      setShowPhoneModalFor(null);
      return;
    }
    payOnline(appointment, phoneInput);
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My appointments</p>
      <div>
        {appointments.length === 0 && (
          <p className="text-center text-zinc-500 mt-4">No appointments found.</p>
        )}
        {appointments.map((item) => (
          <div key={item._id} className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b">
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={item.docData?.image || '/placeholder.jpg'}
                alt="Doctor"
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">{item.docData?.name}</p>
              <p>{item.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData?.address?.line1}</p>
              <p className="text-xs">{item.docData?.address?.line2}</p>
              <p className="text-sm mt-1">
                <span className="text-sm text-neutral-700 font-medium">Date & Time:</span>{' '}
                {slotDateFormat(item.slotDate)} | {item.slotTime}
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              {!item.cancelled ? (
                <>
                  <button
                    onClick={() => handlePayClick(item)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-blue-500 hover:text-white transition-all duration-300"
                  >
                    Pay Online
                  </button>
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-500 hover:text-white transition-all duration-300"
                  >
                    Cancel appointment
                  </button>
                </>
              ) : (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                  Appointment cancelled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showPhoneModalFor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-[320px] shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Enter Phone Number</h3>
            <input
              type="text"
              placeholder="e.g. +919090407368 or 9090407368"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
              maxLength={15}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPhoneModalFor(null)}
                className="px-4 py-2 border rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
