import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import {toast} from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {

  const [docImg,setDocImg] = useState(false)
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [experience,setExperience] = useState('1')
  const [about,setAbout] = useState('')
  const [fees,setFees] = useState('')
  const [speciality,setSpeciality] = useState('General physician')
  const [degree,setDegree] = useState('')
  const [address1,setAddress1] = useState('')
  const [address2,setAddress2] = useState('')

  const {backendUrl, aToken} = useContext(AdminContext)


  const onSubmitHandler = async(event) =>{
    event.preventDefault()
    try{
       if(!docImg)
       {
          return toast.error('Image not selected')
       }

       const formData = new FormData()
       formData.append('image',docImg)
       formData.append('name',name)
       formData.append('email',email)
       formData.append('password',password)
       formData.append('experience',experience)
       formData.append('fees',Number(fees))
       formData.append('about',about)
       formData.append('speciality',speciality)
       formData.append('degree',degree)
       formData.append('address',JSON.stringify({line1:address1,line2:address2}))

    //    console log formdata
       formData.forEach((value,key)=>{
        console.log(`${key} : ${value}`);

       })

       const {data} = await axios.post(backendUrl + '/api/admin/add-doctor',formData,{headers:{aToken}}) 

       if(data.success)
       {
         toast.success(data.message)
         setDocImg(false)
         setName('')
         setEmail('')
         setPassword('')
         setAddress1('')
         setAddress2('')
         setDegree('')
         setAbout('')
         setFees('')
       }
       else
       {
        toast.error(data.message)
       }
    }
    catch(error){
       toast.error(error.message)
       console.log(error)
    }
  }


  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='mb-3 text-lg font-medium'>Add Doctor</p>
      <div className='bg-white px-8 py-8 border rounded w-full max-h-[80vh] overflow-y-scroll'>

        {/* Upload Picture */}
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img className='w-16 bg-gray-100 rounded-full cursor-pointer'  src={docImg ? URL.createObjectURL(docImg):assets.upload_area} alt="Upload" />
          </label>
          <input onChange={(e)=>setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
          <p>Upload doctor <br /> picture</p>
        </div>

        {/* Two-column layout */}
        <div className='flex flex-col lg:flex-row gap-10 text-gray-600'>

          {/* LEFT SIDE */}
          <div className='flex-1 flex flex-col gap-4'>

            <div className='flex flex-col gap-1'>
              <p>Doctor Name</p>
              <input onChange={(e)=> setName(e.target.value)} value={name} type="text" placeholder='Name' required className='border px-3 py-2 rounded' />
            </div>

            <div className='flex flex-col gap-1'>
              <p>Doctor Email</p>
              <input onChange={(e)=> setEmail(e.target.value)} value={email} type="email" placeholder='Email' required className='border px-3 py-2 rounded' />
            </div>

            <div className='flex flex-col gap-1'>
              <p>Doctor Password</p>
              <input onChange={(e)=> setPassword(e.target.value)} value={password} type="password" placeholder='Password' required className='border px-3 py-2 rounded' />
            </div>

            <div className='flex flex-col gap-1'>
              <p>Experience</p>
              <select onChange={(e)=> setExperience(e.target.value)} value={experience} className='border px-3 py-2 rounded'>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i}>{i + 1} Year</option>
                ))}
              </select>
            </div>

            <div className='flex flex-col gap-1'>
              <p>Fees</p>
              <input onChange={(e)=> setFees(e.target.value)} value={fees} type="number" placeholder='Fees' required className='border px-3 py-2 rounded' />
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className='flex-1 flex flex-col gap-4'>

            <div className='flex flex-col gap-1'>
              <p>Speciality:</p>
              <select onChange={(e)=> setSpeciality(e.target.value)} value={speciality} className='border px-3 py-2 rounded'>
                <option value="General physician">General physician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className='flex flex-col gap-1'>
              <p>Education</p>
              <input onChange={(e)=> setDegree(e.target.value)} value={degree} type="text" placeholder='Education' required className='border px-3 py-2 rounded' />
            </div>

            <div className='flex flex-col gap-1'>
              <p>Address</p>
              <input onChange={(e)=> setAddress1(e.target.value)} value={address1} type="text" placeholder='Address Line 1' required className='border px-3 py-2 rounded' />
              <input onChange={(e)=> setAddress2(e.target.value)} value={address2} type="text" placeholder='Address Line 2' required className='border px-3 py-2 rounded' />
            </div>

            <div className='flex flex-col gap-1'>
              <p>About Doctor</p> 
              <textarea onChange={(e)=> setAbout(e.target.value)} value={about} placeholder='Write about doctor' rows={5} required className='border px-3 py-2 rounded resize-none'></textarea>
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div className='mt-6'>
          <button  type='submit' className='bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded'>
            Add Doctor
          </button>
        </div>
      </div>
    </form>
  )
}

export default AddDoctor
