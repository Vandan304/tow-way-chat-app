import React, { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import { Avatar } from '../../components/ui/avatar'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { AvatarImage } from '@radix-ui/react-avatar'
import { colors, getColor } from "../../lib/utils"
import { FaPlus, FaTrash } from "react-icons/fa"
import { toast } from "sonner"
import { apiClient } from "../../lib/api-client"
import { HOST, ADD_PROFILE_IMAGE_ROUTE, UPDATE_PROFILE_ROUTE, REMOVE_PROFILE_IMAGE_ROUTE } from '../../utils/constants'

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore()
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [images, setImages] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
    if (userInfo.images) {
      setImages(`${HOST}/${userInfo.images}`);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First Name is required");
      return false;
    }
    if (!lastName) {
      toast.error("Last Name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFILE_ROUTE, 
          { firstName, lastName, color: selectedColor }, 
          { withCredentials: true }
        );
        if (response.status === 200 && response.data) {
          setUserInfo(response.data);
        }
        toast.success("Profile Updated Successfully");
        navigate("/chat");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate('/chat');
    } else {
      toast.error("Please setup profile");
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file);
      try {
        const response = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE, formData, { withCredentials: true });
        if (response.status === 200 && response.data.images) {
          setUserInfo({ ...userInfo, images: response.data.images });
          setImages(`${HOST}/${response.data.images}`);
          toast.success("Image updated successfully");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, { withCredentials: true });
      if (response.status === 200) {
        setUserInfo({ ...userInfo, images: null });
        setImages(null);
        toast.success("Image removed successfully");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='bg-[#1b1c24] h-[100vh] flex flex-col justify-center items-center gap-10'>
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={handleNavigate}>
          <IoArrowBack className='text-4xl lg:text-6xl text-white/90 cursor-pointer' />
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-2">
          <div 
            className="h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center" 
            onMouseEnter={() => setHovered(true)} 
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className='h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-white'>
              {images ? (
                <AvatarImage 
                  src={images} 
                  alt='profile' 
                  className='object-cover w-full h-full rounded-full'
                  
                />
              ) : (
                <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl flex items-center justify-center rounded-full ${getColor(selectedColor)}`}>
                  {firstName ? firstName.charAt(0) : userInfo.email.charAt(0)}
                </div>
              )}
            </Avatar>

            {hovered && (
              <div 
                className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer'
                onClick={images ? handleDeleteImage : handleFileInputClick}
              >
                {images ? (
                  <FaTrash className='text-white text-3xl cursor-pointer' />
                ) : (
                  <FaPlus className='text-white text-3xl cursor-pointer' />
                )}
              </div>
            )}

            <input 
              type="file" 
              ref={fileInputRef} 
              className='hidden' 
              onChange={handleImageChange} 
              name='profile-image' 
              accept=".png,.jpg,.jpeg,.svg,.webp" 
            />
          </div>

          <div className='flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center'>
            <Input className='border-none rounded-lg p-6 bg-[#2c2e3b]' placeholder='Email' type='email' disabled value={userInfo.email} />
            <Input className='border-none rounded-lg p-6 bg-[#2c2e3b]' placeholder='First Name' type='text' onChange={e => setFirstName(e.target.value)} value={firstName} />
            <Input className='border-none rounded-lg p-6 bg-[#2c2e3b]' placeholder='Last Name' type='text' onChange={e => setLastName(e.target.value)} value={lastName} />
            <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div 
                  key={index} 
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                  ${selectedColor === index ? "outline outline-1 outline-white/50" : ""}`} 
                  onClick={() => setSelectedColor(index)}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full">
          <Button 
            className='h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300'
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
