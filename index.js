require("dotenv").config()
const axios = require("axios")
const FormData = require("form-data")
const fs = require("fs")
const path = require("path")

async function sendTemplateMessages() {
   const response = await axios({
      url: `https://graph.facebook.com/v22.0/${process.env.PHONE_ID}/messages`,
      method: "post",
      headers: {
         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
         "Content-Type": "application/json",
      },
      data: JSON.stringify({
         messaging_product: "whatsapp",
         to: "2349033448434",
         type: "template",
         template: {
            name: "hello_world",
            language: {
               code: "en_US",
            },
         },
      }),
   })

   console.log(response.data)
}

// Whatsapp works in such a way that if you send a user a message, you can't send another message
// till 24hrs later except the user responds to that message or sends a follow up message then you
// can send follow up messages. This is to not allow businesses to spam users everytime

async function sendTextMessage() {
   const response = await axios({
      url: `https://graph.facebook.com/v22.0/${process.env.PHONE_ID}/messages`,
      method: "post",
      headers: {
         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
         "Content-Type": "application/json",
      },
      data: JSON.stringify({
         messaging_product: "whatsapp",
         to: "2349033448434",
         type: "text",
         text: {
            body: "This is a text message",
         },
      }),
   })

   console.log(response.data)
}

async function sendMediaMessage() {
   const response = await axios({
      url: `https://graph.facebook.com/v22.0/${process.env.PHONE_ID}/messages`,
      method: "post",
      headers: {
         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
         "Content-Type": "application/json",
      },
      data: JSON.stringify({
         messaging_product: "whatsapp",
         to: "2349033448434",
         type: "image",
         image: {
            // link: "https://dummyimage.com/600x400/000/fff.png&text=adamsdave",
            id: "913094838099948", // You can also use only the id of an image stored on whatsapp to fetch the image
            caption: "This is a media message",
         },
      }),
   })

   console.log(response.data)
}

// This uploads your media to whatsapp server and returns an ID that you can use to fetch the image at
// any time
async function uploadMedia() {
   const data = new FormData()
   data.append("messaging_product", "whatsapp")
   data.append(
      "file",
      fs.createReadStream(path.resolve() + "/test_media.png", {
         contentType: "image/png",
      }),
   )
   data.append("type", "image/png")

   const response = await axios({
      url: `https://graph.facebook.com/v22.0/${process.env.PHONE_ID}/media`,
      method: "post",
      headers: {
         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
      data: data,
   })

   console.log(response.data)
}

// This function has variables included

async function sendTemplateMessagesWithVariables() {
   const response = await axios({
      url: "https://graph.facebook.com/v22.0/967027536498144/messages",
      method: "post",
      headers: {
         Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
         "Content-Type": "application/json",
      },
      data: JSON.stringify({
         messaging_product: "whatsapp",
         to: "2349033448434",
         type: "template",
         template: {
            name: "discount",
            language: {
               code: "en_US",
            },
            components: [
               {
                  type: "header",
                  parameters: [
                     {
                        type: "text",
                        text: "Chukwudi David",
                     },
                  ],
               },
               {
                  type: "body",
                  parameters: [
                     {
                        type: "text",
                        text: "20",
                     },
                     {
                        type: "text",
                        text: "24",
                     }, // Since there is another variable
                  ],
               },
            ],
         },
      }),
   })

   console.log(response.data)
}

sendTemplateMessagesWithVariables()
