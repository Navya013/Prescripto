import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.error("Error in changeAvailability:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.error("Error in doctorList:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error in loginDoctor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Error in appointmentsDoctor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to show complete appointment for doctor panel

const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointment } = req.body;
    const appointmentData = await appointmentModel.findById(appointment);

    if (!appointmentData) {
      console.log(`Appointment not found: ${appointment}`);
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData.docId.toString() !== docId) {
      console.log(`Doctor ID mismatch: appointment docId ${appointmentData.docId}, request docId ${docId}`);
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointment, { isCompleted: true });
    return res.json({ success: true, message: "Appointment Completed" });
  } catch (error) {
    console.error("Error completing appointment:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to show cancel appointment for doctor panel

const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointment } = req.body;
    const appointmentData = await appointmentModel.findById(appointment);

    if (!appointmentData) {
      console.log(`Appointment not found: ${appointment}`);
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointmentData.docId.toString() !== docId) {
      console.log(`Doctor ID mismatch: appointment docId ${appointmentData.docId}, request docId ${docId}`);
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointment, { cancelled: true });
    return res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to get dashboard data for doctor panel
const doctorDashboard = async (req,res) => {
   try{
     const {docId} = req.body
     const appointments =  await appointmentModel.find({docId})

     let earnings = 0
     appointments.map((item)=>{
        if(item.isCompleted || item.payment)
        {
           earnings += item.amount
        }
     })

      let patients = []

      appointments.map((item)=>{
         if (!patients.includes(item.userId))
          {
             patients.push(item.userId)
          }
      })

      const dashData = {
         earnings,
         appointments: appointments.length,
         patients : patients.length,
         latestAppointments : appointments.reverse().slice(0,5)
      }

      res.json({ success: true, dashData });


   }
   catch (error) {
    console.error("Error cancelling appointment:", error);
    return res.status(500).json({ success: false, message: error.message });
  }

}

// API to get doctor profile for doctor panel
const doctorProfile = async (req,res) => {
   try{
     const {docId} = req.body
     const profileData = await doctorModel.findById(docId).select('-password')

     res.json({success:true,profileData})

   }
   catch(error)
   {
     console.log(error)
     res.json({success:false,message:error.message})
   }
   
}

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async(req,res) => {
   try{
      
    const {docId,fees,address,available} = req.body

    await doctorModel.findByIdAndUpdate(docId,{fees,address,available})

    res.json({success:true,message:'Profile Updated'})
   }
   catch(error)
   {
     console.log(error)
     res.json({success:false,message:error.message})
   }
   
}



export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile
};
