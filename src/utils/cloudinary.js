import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
 });
  
const uploadoncloudinary = async (localfilepath) => {
  try {
    if(!localfilepath){
      console.log("error occured could't find the localfilepath")
      return null;
    }
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localfilepath,{
      resource_type: "auto"
     })
     // file has been uploaded successfully 
    console.log("file uploaded on cloudinary ", response.url)
    // deleting the files from local storage 
    fs.unlinkSync(localfilepath)
     return response;
  } catch (error) {
    fs.unlinkSync(localfilepath) // remove the locally saved temporary  file as operation fails 
    return null;
  }
}

export {uploadoncloudinary}