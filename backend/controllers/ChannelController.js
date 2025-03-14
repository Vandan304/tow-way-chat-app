import Channel from "../models/ChannelModel.js"; // Ensure 'C' is capitalized
import User from "../models/UserModel.js";

export const createChannel = async (request, response, next) => {
  try {
    const { name, members } = request.body;
    const userId = request.userId; // Ensure verifyToken sets this correctly

    if (!userId) {
      return response.status(401).json({ error: "Unauthorized: User ID missing" });
    }

    const admin = await User.findById(userId);
    if (!admin) {
      return response.status(404).json({ error: "Admin user not found" });
    }

    if (!name || !Array.isArray(members) || members.length === 0) {
      return response.status(400).json({ error: "Invalid channel name or members" });
    }

    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return response.status(400).json({ error: "Some members are not valid users" });
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();
    return response.status(201).json({ message: "Channel created successfully", channel: newChannel });
  } catch (error) {
    console.error("❌ Error creating channel:", error);
    return response.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
