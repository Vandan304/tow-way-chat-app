import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessagesModel.js";

export const searchContacts = async (request, response, next) => {
  try {
    const { searchTerm } = request.body;
    if (!searchTerm) {
      return response.status(400).send("SearchTerm is required.");
    }

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find({
      $and: [
        { _id: { $ne: request.userId } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    });

    return response.status(200).json({ contacts });
  } catch (error) {
    console.error(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const getContactsForDMList = async (request, response, next) => {
  try {
    let { userId } = request;
    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timestamp: -1 }, // Sorting messages to get the latest first
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" }, // Ensure we pick the latest timestamp
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: { $ifNull: ["$lastMessageTime", new Date(0)] }, // Prevent null values
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          images: { $ifNull: ["$contactInfo.images", []] }, // Ensure images are always an array
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 }, // Ensure sorting by latest message
      },
    ]);

    return response.status(200).json({ contacts });
  } catch (error) {
    console.error(error);
    return response.status(500).send("Internal Server Error");
  }
};

export const getAllContacts = async (request, response, next) => {
  try {
    console.log("🔹 Request User ID:", request.userId); // Debugging

    if (!request.userId) {
      return response.status(400).json({ message: "User ID missing in request" });
    }

    const users = await User.find(
      { _id: { $ne: request.userId } }, // Exclude current user
      "firstName lastName _id email"
    );

    console.log("🔹 Fetched Users:", users); // Debugging

    if (!users.length) {
      return response.status(404).json({ message: "No contacts found" });
    }

    const contacts = users.map((user) => ({
      label: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id.toString(), // Ensure _id is a string
    }));

    console.log("🔹 Contacts Response:", contacts); // Debugging

    return response.status(200).json({ contacts });
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
};

