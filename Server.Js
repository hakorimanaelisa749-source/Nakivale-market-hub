const express = require('express');
const app = express();
app.use(express.json());
let products = [
 {id:1, name:"Maize Flour 5kg", price:15000, vendor:"Mama Grace"},
 {id:2, name:"Tomatoes", price:3000, vendor:"John Zone 3"}
];
app.get('/api/products', (req,res)=>res.json(products));
app.post('/api/products', (req,res)=>{
  const p={id:Date.now(), ...req.body};
  products.push(p);
  res.json(p);
});
app.use(express.static('.'));
app.listen(3000, ()=>console.log('Server on 3000'));
