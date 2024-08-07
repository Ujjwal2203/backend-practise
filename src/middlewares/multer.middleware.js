import multer  from "multer";

// multer is used for uploading files into the local storage temporary then these files will be uploaded to cloudnary ]]

// in multer we using diskstorage to store files in disk there are other options available such as - memory storage etc , but storing files in memiry is not right as size f=of memory is much less as compared to disk storage

const storage = multer.diskStorage({
  destination: function(req,file,cb){  // req comes from user and can be processed in express but file cann't be processed in express that's why multer is used  and cb is nothing but a callback funtion 
    cb(null , './public/temp')
  },
  filename: function(req,file,cb){
    cb(null,file.originalname) // file has many methods read documentation
  }
})

export const upload = multer({
  storage
})