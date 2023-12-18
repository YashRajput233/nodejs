import express from "express";
import "./src/config/db.js";
import userRouter from "./src/routes/userRoute.js";
const app = express();
const port = 5000;
app.use(express.json());
app.use("/api/v1", userRouter);

app.get('/',function(req,res){
  res.send('welcome')
})

app.listen(port, () => {
  console.log(`server is running on ${port} ..👍`);
  const error = false;
  if (error) {
    console.log(`error running is server`, error);
  }
});
