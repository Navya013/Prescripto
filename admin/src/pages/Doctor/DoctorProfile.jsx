import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData,backendUrl } = useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);

  const updateProfile = async () =>{
    
    try{
       const updateData = {
         address: profileData.address,
         fees : profileData.fees,
         available : profileData.available
       }
       const {data} = await axios.post(backendUrl + '/api/doctor/update-profile',updateData,{headers : {dToken}})

       if(data.success)
       {
         toast.success(data.message)
         setIsEdit(false)
         getProfileData()
       }
       else
       {
         toast.error(data.message)
       }
    }
    catch(error)
    {
       toast.error(error.message)
       console.log(error)
    }


  }

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  return profileData && (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row gap-8">
        <div className="sm:w-64 w-full">
          <img
            className="rounded-xl object-cover w-full border border-gray-300 shadow-md bg-blue-400"
            src={profileData.image}
            alt={profileData.name}
          />
        </div>
        <div className="flex-1 border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
          <div className="text-3xl font-semibold text-gray-800">{profileData.name}</div>
          <div className="text-lg text-gray-600">{profileData.degree} - {profileData.speciality}</div>
          <div className="text-sm text-gray-500">Experience: {profileData.experience} </div>
          
          <div className="mt-4">
            <p className="font-medium text-gray-700">About:</p>
            <p className="text-gray-600">{profileData.about}</p>
          </div>

          <div className="mt-2 text-gray-700">
            Appointment Fee: <span className="font-medium">{currency} {isEdit ? <input type="number" onChange={(e)=>setProfileData(prev => ({...prev,fees:e.target.value}))} value = {profileData.fees}/> : profileData.fees}</span>
          </div>

          <div className="mt-2">
            <p className="font-medium text-gray-700">Address:</p>
            <p className="text-gray-600">{isEdit? <input type="text" onChange={(e)=>setProfileData(prev => ({...prev,address:{...prev.address,line1:e.target.value}}))} value = {profileData.address.line1}/> :profileData.address.line1}</p>
            <p className="text-gray-600">{isEdit? <input type="text" onChange={(e)=>setProfileData(prev => ({...prev,address:{...prev.address,line2:e.target.value}}))} value = {profileData.address.line2}/> :profileData.address.line2}</p>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              onChange={()=>isEdit && setProfileData(prev => ({...prev,available: !prev.available}))}
              checked = {profileData.available}
              type="checkbox"
              className="w-5 h-5 text-blue-500 focus:ring-blue-500"
            />
            <label className="text-gray-700 font-medium">Available for Appointments</label>
          </div>

          {
             isEdit
             ? <button onClick={updateProfile} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition">
                 Save Profile
               </button>
            :  <button onClick={()=>setIsEdit(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition">
                Edit Profile
              </button>
          }

          
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
