const express = require("express")
const axios = require("axios")
require("dotenv").config()

const app = express()

const PORT = 3000

const WEBHOOK_VERIFY_TOKEN = "my-verify-token"

app.use(express.json())

app.get("/", (req, res) => {
   res.send("Whatsapp with Nodejs and Webhooks")
})

app.get("/webhook", (req, res) => {
   console.log(req.query)
   const mode = req.query["hub.mode"]
   const challenge = req.query["hub.challenge"]
   const token = req.query["hub.verify_token"]

   if (mode && token === WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge)
   } else {
      res.sendStatus(403)
   }
})

// after subscribing to messages, the hook will automatically call the post part of /webhook
// so ensure it is the same name

app.post("/webhook", (req, res) => {
   console.log("------------------------------------")

   const { entry } = req.body
   if (!entry || entry.length === 0) {
      return res.status(400).send("Invalid request")
   }

   const changes = entry[0].changes
   if (!changes || changes.length === 0) {
      return res.status(400).send("Invalid request")
   }

   const statuses = changes[0].value.statuses
      ? changes[0].value.statuses[0]
      : null
   const messages = changes[0].value.messages
      ? changes[0].value.messages[0]
      : null

   if (statuses) {
      // Handle message status

      console.log(
         `MESSGE STATUS UPDATE: ID: ${statuses.id}, STATUS: ${statuses.status}`,
      )
   }

   if (messages) {
      // Handle received messages

      if (messages.type === "text") {
         if (messages.text.body.toLowerCase() === "hello") {
            replyMessage(messages.from, "Hello, how are you?", messages.id)
         }
      }

      console.log(JSON.stringify(messages, null, 2))
   }

   res.status(200).send("Webhook processed")
})

async function sendMessage(to, body) {
   await axios({
      url: `https://graph.facebook.com/v22.0/${process.env.PHONE_ID}/messages`,
      method: "post",
      headers: {
         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
         "Content-Type": "application/json",
      },
      data: JSON.stringify({
         messaging_product: "whatsapp",
         to: to,
         type: "text",
         text: {
            body: body,
         },
      }),
   })
}

async function replyMessage(to, body, messageId) {
   await axios({
      url: `https://graph.facebook.com/v22.0/${process.env.PHONE_ID}/messages`,
      method: "post",
      headers: {
         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
         "Content-Type": "application/json",
      },
      data: JSON.stringify({
         messaging_product: "whatsapp",
         to: to,
         type: "text",
         text: {
            body: body,
         },
         context: {
            message_id: messageId,
         },
      }),
   })
}

async function sendList(to, body) {
   await axios({
      url: `https://graph.facebook.com/v22.0/${process.env.PHONE_ID}/messages`,
      method: "post",
      headers: {
         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
         "Content-Type": "application/json",
      },
      data: JSON.stringify({
         messaging_product: "whatsapp",
         to: to,
         type: "interactive",
         interactive: {
            body: body,
         },
      }),
   })
}

app.listen(PORT, () => {
   console.log(`Server listening at http://localhost:${PORT}`)
   //    sendMessage("2349033448434", "This is a message from David")
})
