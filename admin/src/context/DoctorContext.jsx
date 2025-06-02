import { createContext, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios';

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(
    localStorage.getItem('dToken') ? localStorage.getItem('dToken') : ''
  );

  const [appointments, setAppointments] = useState([]);
  const [dashData,setDashData] = useState([])
  const [profileData,setProfileData] = useState(false) 

  // For getAppointments (GET request, only token needed)
const getAppointments = async () => {
  try {
    const { data } = await axios.get(
      backendUrl + '/api/doctor/appointments',
      { headers: { dtoken: dToken } }
    );
    if (data.success) {
      setAppointments(data.appointments.reverse());
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
}

// For completeAppointment (POST request, send appointment id only)
const completeAppointment = async (appointmentId) => {
  try {
    const { data } = await axios.post(
      backendUrl + '/api/doctor/complete-appointment',
      { appointment: appointmentId },
      { headers: { dtoken: dToken } }
    );
    if (data.success) {
      toast.success(data.message);
      getAppointments();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
}

// Similar for cancelAppointment
const cancelAppointment = async (appointmentId) => {
  try {
    const { data } = await axios.post(
      backendUrl + '/api/doctor/cancel-appointment',
      { appointment: appointmentId },
      { headers: { dtoken: dToken } }
    );
    if (data.success) {
      toast.success(data.message);
      getAppointments();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
}

const getDashData = async () => {
  try {
    const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', {
      headers: {dToken}
    });
    if (data.success) {
      setDashData(data.dashData);
      console.log(data.dashData);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message);
  }
};

const getProfileData = async () => {
   try{
      const {data} = await axios.get(backendUrl + '/api/doctor/profile',{headers:{dToken}})
      if(data.success)
      {
         setProfileData(data.profileData)
         console.log(data.profileData);
      }

   }
   catch (error) {
    console.log(error);
    toast.error(error.message);
  }
   
}



  const value = {
    dToken, setDToken,
    backendUrl, appointments, setAppointments,
    getAppointments,completeAppointment,cancelAppointment,
    dashData,setDashData,getDashData,
    profileData,setProfileData,getProfileData
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
