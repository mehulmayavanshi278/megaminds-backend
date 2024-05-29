const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary with your Cloudinary credentials


// module.exports.cloudinarySetup =  ()=>{

// }


// Function to upload an image to Cloudinary
function uploadToCloudinary(imagePath) {
    try{
        return new Promise((resolve, reject) => {
            // Upload image to Cloudinary
            cloudinary.uploader.upload(imagePath, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result?.url);
                }
            });
        });
    }catch(err){
        console.log(err);
    }

}

// Array of image file paths you want to upload
// const imagePaths = ['path/to/your/image1.jpg', 'path/to/your/image2.jpg', 'path/to/your/image3.jpg'];

// Function to upload multiple images to Cloudinary
async function uploadMultipleImages(imagePaths) {
    try {
        const uploadResults = await Promise.all(imagePaths.map(uploadToCloudinary));
        console.log('Images uploaded successfully:', uploadResults);
    } catch (error) {
        console.error('Error uploading images:', error);
    }
}

// Call the function to upload multiple images to Cloudinary
// uploadMultipleImages(imagePaths);


module.exports = {uploadToCloudinary , uploadMultipleImages};