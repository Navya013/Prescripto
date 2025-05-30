import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatesDoctors from '../components/RelatesDoctors'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'



const Appointment = () => {

  const { docId } = useParams()
  const { doctors, currencySymbol,backendUrl,token,getDoctorsData} = useContext(AppContext)
  const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  const fetchDocInfo = async () => {
    const doc = doctors.find(doc => doc._id === docId)
    setDocInfo(doc)
    console.log('Fetched docInfo:', doc)
  }

  const getAvailableSlots = async () => {
    let slotsArr = []
    let today = new Date()
    for (let i = 0; i < 7; i++) {
      // get current date plus i days
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      // set end time for the day 21:00
      let endTime = new Date(today)
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21, 0, 0, 0)

      // set starting time according to today or future day
      if (today.toDateString() === currentDate.toDateString()) {
        // if current hour > 10, start from next hour else from 10
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        // minutes to 30 if > 30 else 0
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        let day = currentDate.getDate()
        let month = currentDate.getMonth()+1
        let year = currentDate.getFullYear()

        const slotDate = day + "_" + month + "_" + year
        const slotTime = formattedTime

        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true

        if(isSlotAvailable)
        {
            timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }

        
        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }
      slotsArr.push(timeSlots)
    }
    setDocSlots(slotsArr)
    console.log('Slots generated:', slotsArr)
  }


  const bookAppointment = async () => {
    if(!token){
      toast.warn('Login to book appointment')
      return navigate('/login')
    }
    try{
      const date = docSlots[slotIndex][0].datetime

      let day = date.getDate()
      let month = date.getMonth()+1
      let year = date.getFullYear()

      const slotDate = day + "_" + month + "_" + year

      const {data} = await axios.post(backendUrl + '/api/user/book-appointment',{docId,slotDate,slotTime},{headers:{token}})
      if(data.success)
      {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      }
      else
      {
        toast.error(data.message)
      }
    }
    catch(error)
    {
       console.log(error)
       toast.error(error.message)
    }
  }


  useEffect(() => {
    fetchDocInfo()
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSlots()
    }
  }, [docInfo])

  useEffect(() => {
    console.log('docSlots updated:', docSlots)
  }, [docSlots])

  if (!docInfo) {
    return <p>Loading doctor info...</p>
  }

  return (
    <div>
      {/* ------- doctor details ---------*/}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-blue-500 w-full sm:max-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>
        <div className='flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0'>
          {/* ------ doc info : name,degree,experience-------- */}
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900'>
            {docInfo.name}
            <img className='w-5' src={assets.verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>{docInfo.experience}</button>
          </div>

          {/* ----------doctor about---------- */}
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3'>About <img src={assets.info_icon} alt="" /></p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>
      {/* --------booking slots-------- */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>
        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlots.length > 0 ? docSlots.map((item, index) => (
              <div
                onClick={() => setSlotIndex(index)}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-blue-500 text-white' : 'border border-gray-200'}`}
                key={index}
              >
                <p>{item[0] && dayOfWeek[item[0].datetime.getDay()]}</p>
                <p>{item[0] && item[0].datetime.getDate()}</p>
              </div>
            )) : <p>No slots available</p>
          }
        </div>
        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4'>
          {
            docSlots.length > 0 && docSlots[slotIndex] ? docSlots[slotIndex].map((item, index) => (
              <p onClick={()=>setSlotTime(item.time)}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-blue-500 text-white' : 'text-gray-400 border border-gray-300'}`}

                key={index}
              >
                {item.time.toLowerCase()}
              </p>
            )) : <p>No times to display</p>
          }
        </div>
        <button onClick={bookAppointment} className='bg-blue-500 text-white text-sm font-light px-14 py-3 rounded-full my-6'>Book an appointment</button>
      </div>
      {/* listing relating doctors */}
      <RelatesDoctors docId={docId} speciality={docInfo.speciality}/>
    </div>
  )
}

export default Appointment
