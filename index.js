require("dotenv").config()
const axios = require("axios")

async function sendTemplateMessages() {
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
            name: "hello_world",
            language: {
               code: "en_US",
            },
         },
      }),
   })

   console.log(response.data)
}

sendTemplateMessages()
