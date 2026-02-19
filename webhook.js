const express = require("express")
const axios = require("axios")
require("dotenv").config()

const app = express()

const PORT = 3000

// Note, templates does not send payload responses to the backend.
// It's just like a one way email with no feedback.

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

         if (messages.text.body.toLowerCase() === "list") {
            sendList(messages.from)
         }

         if (messages.text.body.toLowerCase() === "button") {
            sendReplyButtons(messages.from)
         }
      }

      if (messages.type === "interactive") {
         if (messages.interactive.type === "list_reply") {
            sendMessage(
               messages.from,
               `You selected the option with ID ${messages.interactive.list_reply.id} - Title: ${messages.interactive.list_reply.title}`,
            )
         }

         if (messages.interactive.type === "button_reply") {
            sendMessage(
               messages.from,
               `You selected the option with ID ${messages.interactive.button_reply.id} - Title: ${messages.interactive.button_reply.title}`,
            )
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

async function sendList(to) {
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
            type: "list",
            header: {
               type: "text", // You can also add images as well
               text: "Message Header",
            },
            body: {
               text: "This is an interactive list message",
            },
            footer: {
               text: "This is the message footer",
            },
            action: {
               button: "Tap for the options",
               sections: [
                  {
                     title: "First section",
                     rows: [
                        {
                           id: "first_option",
                           title: "First option",
                           description:
                              "This is the description of the first option",
                        },
                        {
                           id: "second_option",
                           title: "Second option",
                           description:
                              "This is the description of the first option",
                        },
                     ],
                  },

                  {
                     title: "Second section",
                     rows: [
                        {
                           id: "third_option",
                           title: "Third option",
                        },
                     ],
                  },
               ],
            },
         },
      }),
   })
}

async function sendReplyButtons(to) {
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
            type: "button",
            header: {
               type: "text", // You can also add images as well
               text: "Message Header",
            },
            body: {
               text: "This is an interactive reply buttons message",
            },
            footer: {
               text: "This is the message footer",
            },
            action: {
               buttons: [
                  {
                     type: "reply",
                     reply: {
                        id: "first_button",
                        title: "First button",
                     },
                  },
                  {
                     type: "reply",
                     reply: {
                        id: "second_button",
                        title: "Second Button",
                     },
                  },
               ],
            },
         },
      }),
   })
}

app.listen(PORT, () => {
   console.log(`Server listening at http://localhost:${PORT}`)
   //    sendMessage("2349033448434", "This is a message from David")
})
