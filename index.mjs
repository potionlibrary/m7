// Use ECMAScript Modules syntax with 'import' and 'export'
import express from 'express';
import pkg from 'nodemailer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import { products as productData } from './products.js';


// Load environment variables from .env file
dotenv.config();

const { fetchData } = pkg;
const app = express();
const PORT = process.env.PORT
const urlName = 'https://randomuer.me/api/'


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));




let htmlTop = `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel='stylesheet' type='text/css' media='screen' href='main.css'>
    <script src='main.js'></script>
    <title>Juan Wagner</title>
    <link rel="icon" type="image/png" sizes="192x192" href="public/b_knight.png">
  </head>
  <body>
    <header>
      <h1 style="display: inline;">Juan Wagner <img src="public/g_potion.png" alt="green potion" width="50" height="50" style="display: inline;"> </h1>
    </header>
    <nav>
      <a href="index.html">Home</a>
      <a href="gallery.html">Gallery</a>
      <a href="contact.html">Contact</a>
      <a href="order.html">Order</a>
    </nav>
    <section>
      <h2>Contact Us</h2>
`;

let htmlBottom = `
    </section>
    <footer>
      <p>&#169; 2023 Juan Wagner</p>
    </footer>
  </body>
  </html>
`;

function getChosenProduct(productName) {
  for (const product of products) {
    if (product.product === productName) {
      return product;
    }
  }
  return null; // Return null if the product is not found
}

app.get('/')

app.post('/submit_order', (req, res) => {
  // Extract values from the order form
  const fullName = req.body.fullName;
  const address = req.body.address;
  const deliveryInstructions = req.body.deliveryInstructions;
  const productChoice = req.body.product;
  const quantity = parseInt(req.body.quantity); // Parse quantity as an integer

  // Find the chosen product using the getChosenProduct function
  const chosenProduct = getChosenProduct(productChoice);

  // Calculate the total price (assuming chosenProduct is not null)
  const totalPrice = chosenProduct.price * quantity;

  // Format totalPrice as US currency
  const formattedTotalPrice = totalPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });

  // Construct the response message using template literals
  let responseMessage1 = `
      <h3>Thank you for your order, ${fullName}!</h3>
      <p>Your chosen product: ${chosenProduct.product}</p>
      <p>Company: ${chosenProduct.company}</p>
      <p>Address: ${address}</p>
      <p>Delivery Instructions: ${deliveryInstructions}</p>
      <p>Quantity: ${quantity}</p>
      <p>Total Price: ${formattedTotalPrice}</p>
  `;

  // Nodemailer code for sending an email
  nodemailer.createTestAccount().then((account) => {
    console.log('Credentials obtained, sending message...');

    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });

    // Message object
    let message = {
      from: 'Sender Name <sender@example.com>',
      to: 'Recipient <recipient@example.com>',
      subject: 'Order Confirmation',
      text: `Hello ${fullName}!\nThank you for placing an order with us.\n\nOrder Details:\nProduct: ${chosenProduct ? chosenProduct.product : 'Product not found'}\nCompany: ${chosenProduct ? chosenProduct.company : 'Company not found'}\nQuantity: ${quantity}\nTotal Price: ${formattedTotalPrice}\n\nDelivery Address:\n${address}\n\nDelivery Instructions:\n${deliveryInstructions}\n\nYour order has been successfully placed.`,
      html: `<p><b>Hello ${fullName}!</b></p><p>Thank you for placing an order with us.</p><p><b>Order Details:</b></p><ul><li>Product: ${chosenProduct ? chosenProduct.product : 'Product not found'}</li><li>Company: ${chosenProduct ? chosenProduct.company : 'Company not found'}</li><li>Quantity: ${quantity}</li><li>Total Price: ${formattedTotalPrice}</li></ul><p><b>Delivery Address:</b></p><p>${address}</p><p><b>Delivery Instructions:</b></p><p>${deliveryInstructions}</p><p>Your order has been successfully placed.</p>`
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log('Error occurred. ' + err.message);
        return process.exit(1);
      }

      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
  });

  // Send the response with the top and bottom HTML
  res.send(htmlTop + responseMessage1 + htmlBottom);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
