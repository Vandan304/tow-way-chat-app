import React, { useState } from "react";
import { useAppStore } from "../store";
import { Avatar } from "@radix-ui/react-avatar";
import { HOST } from "../utils/constants";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    selectedChatType,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  // State to track which images failed to load
  const [imageErrors, setImageErrors] = useState({});

  const handleClick = (contact) => {
    setSelectedChatType(isChannel ? "channel" : "contact");
    setSelectedChatData(contact);

    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  const handleImageError = (contactId) => {
    setImageErrors((prevErrors) => ({ ...prevErrors, [contactId]: true }));
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          key={contact._id}
          className={`pl-10 py-2 flex items-center gap-3 transition-all duration-300 cursor-pointer ${
            selectedChatData && selectedChatData._id === contact._id
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : "hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleClick(contact)}
        >
          {/* Avatar Section */}
          {!isChannel && (
            <div className="relative w-10 h-10">
              {!imageErrors[contact._id] && contact.images ? (
                <Avatar className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src={`${HOST}/${contact.images}`}
                    alt="profile"
                    className="w-full h-full object-cover rounded-full"
                    onError={() => handleImageError(contact._id)} // Track image errors
                  />
                </Avatar>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center text-lg font-bold rounded-full border-2 border-white bg-gray-700 text-white">
                  {contact.firstName
                    ? contact.firstName.charAt(0).toUpperCase()
                    : "?"}
                </div>
              )}
            </div>
          )}

          {/* Display Name */}
          <span className="text-neutral-300 text-lg font-medium">
            {contact.firstName} {contact.lastName}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
