const { notificationService } = require("../Services/services");
const { Notification } = require("../models/Notification");
const mongoose = require("mongoose");

class notificationController {
  get = async (req, res) => {
    try {
      const id = req.user?._id;
      const data = await Notification.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(id) },
        },
        {
          $facet: {
            unreadCount: [
              { $match: { read: false } },
              { $count: "totalUnread" },
            ],
            last10Notifications: [
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              {
                $project: {
                  userId: 1,
                  title: 1,
                  message: 1,
                  read: 1,
                  senderId: 1,
                  createdAt: 1,
                },
              },
              
            ],
          },
        },
      ]);
      const totalUnread = data[0].unreadCount[0]
        ? data[0].unreadCount[0].totalUnread
        : 0;
      const last10Notifications = data[0].last10Notifications;

      const result = {
        totalUnread,
        last10Notifications,
      };
      return res.status(200).send(result);
    } catch (err) {
      console.log(err);
    }
  };
  create = async (req, res) => {
    try {
      const body = req.body;
      let newNotification = await notificationService.create(body);
      return res.status(200).send(newNotification);
    } catch (err) {
      console.log(err);
    }
  };
  update = async (req, res) => {
    try {
      const id = req?.user._id;
      console.log("id is", id);
      await notificationService.updateMany(
        { userId: id },
        { $set: { read: true } }
      );
      return res.status(200).send({ message: "updated successfully" });
    } catch (err) {
      console.log(err);
    }
  };
}

module.exports.notificationController = new notificationController();
