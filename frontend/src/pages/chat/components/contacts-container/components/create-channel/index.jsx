import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { Button } from "../../../../../../components/ui/button.tsx";
import { MultipleSelector } from "../../../../../../components/ui/multipleselect.tsx";
import { GET_ALL_CONTACTS_ROUTE } from "../../../../../../utils/constants";
import { apiClient } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const CreateChannel = () => {
  const [newChannelModal, setNewChannelModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        console.log("Fetching contacts...");
        const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE, {
          withCredentials: true,
        });

        // console.log("✅ Contacts API Response:", response.data);

        if (response.data.contacts && Array.isArray(response.data.contacts)) {
          const formattedContacts = response.data.contacts.map((contact) => ({
            value: contact.value, // Ensure correct field names
            label: contact.label,
          }));

          setAllContacts(formattedContacts);
        } else {
          console.warn("⚠️ No contacts found.");
          setAllContacts([]);
        }
      } catch (error) {
        console.error("❌ Error fetching contacts:", error);
        setAllContacts([]);
      }
    };

    getData();
  }, []);

  const createChannel = async () => {
    
  };

  return (
    <>
      <FaPlus
        className="text-neutral-400 text-opacity-90 font-light text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
        onClick={() => setNewChannelModal(true)}
      />

      <Dialog open={newChannelModal} onOpenChange={setNewChannelModal}>
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please fill up the details for the new channel</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              onChange={(e) => setChannelName(e.target.value)}
              value={channelName}
            />
          </div>
          <div>
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder="Search contacts"
              value={selectedContacts}
              onChange={setSelectedContacts}
              emptyIndicator={<p className="text-center text-lg leading-10 text-gray-600">No result found</p>}
            />
          </div>
          <div>
            <Button className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300" onClick={createChannel}>
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
