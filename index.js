// const express = require("express"); // "type": "commonjs"
import express from "express"; // "type": "module"
const app = express();
import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
const PORT = process.env.PORT || 8080;

const mongo_url = process.env.MONGO_URL;

const client = new MongoClient(mongo_url);
await client.connect();
app.use(express.json());

app.get("/", function (request, response) {
  response.send("🙋‍♂️, 🌏 🎊✨🤩");
});

app.get("/allrooms", async function (request, response) {
  try {
    const rooms = await client
      .db("rooms-data")
      .collection("rooms")
      .find({})
      .toArray();
    response.status(200).send(rooms);
  } catch (error) {
    response.status(404).send(error);
  }
});
app.post("/creat", async function (request, response) {
  const data = request.body;

  try {
    const rooms = await client
      .db("rooms-data")
      .collection("rooms")
      .insertMany(data);
    response.status(200).send(rooms);
  } catch (error) {
    response.status(404).send(error);
  }
});
app.post("/bookingroom", async function (request, response) {
  const { customerName, bookingdate, startTime, endTime } = request.body;

  try {
    const rooms = await client
      .db("rooms-data")
      .collection("rooms")
      .updateOne(
        {
          roomId: request.body.roomId,

          $or: [
            {
              "CustomerData.bookingdate": {
                $ne: request.body.bookingdate,
              },
            },
            { "CustomerData.startTime": { $ne: request.body.startTime } },
          ],
        },
        {
          $set: {
            bookingStatus: true,
          },
          $push: {
            CustomerData: {
              customerName,
              bookingdate,
              startTime,
              endTime,
            },
          },
        }
      );
    {
      rooms
        ? response.status(200).json(rooms)
        : response.status(200).send({ msg: "rooms has Already booked" });
    }
  } catch (error) {
    response.status(404).send(error);
  }
});
app.get("/customer", async function (request, response) {
  try {
    const rooms = await client
      .db("rooms-data")
      .collection("rooms")
      .findOne({ CustomerData: { $ne: [] } });
    response.status(200).send(rooms);
  } catch (error) {
    response.status(404).send(error);
  }
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
