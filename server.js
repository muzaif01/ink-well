import express from "express";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from"bcrypt";
import passport from "passport";
import strategy from "passport-local";
import bodyParser from "body-parser";
import session from "express-session";
import env from "dotenv";

const app=express();
env.config();

const filename=fileURLToPath(import.meta.url);
const dirname=path.dirname(filename);
const saltround=10;


const {Pool}=pg
const db=new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(session({
  secret: process.env.secret,
  resave:false,
  saveUninitialized:false,
  cookie:{
    maxAge:1000*60*60
  }
}))

app.use((req,res,next)=>{
    res.locals.user=req.session.user;
    next();
});

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function hashedpwd(pwd){
  const password=await bcrypt.hash(pwd,saltround);
  return password;
};


app.get("/",(req,res)=>{
    res.render("index.ejs");
})

app.get("/api/posts",async(req,res)=>{
    let data=await db.query("SELECT * FROM posts");
    res.json(data.rows);
    // console.log(filename);
    // console.log(dirname);
});

app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.get("/register",(req,res)=>{
    res.render("register.ejs");
});

app.post("/api/submit",async(req,res)=>{
   let postdata=req.body;
   let userlogged=req.session.user;
   console.log(userlogged);
   await db.query("INSERT INTO posts(title,type,description,author,user_id) VALUES ($1,$2,$3,$4,$5)",[postdata.title,postdata.type,postdata.description,postdata.author,userlogged.id]); 
   res.json({ message: "Success" });
});

app.post("/login",async(req,res)=>{ 
   const email=req.body.username;
   const password=req.body.password;
   const newuser=await db.query("SELECT * FROM login WHERE email=$1",[email]);
   
   if (newuser.rows.length===0) {
    return res.send("user not found");
   }

   let pwdcheck=newuser.rows[0];
   const ismatch=await bcrypt.compare(password,pwdcheck.password);

   if(!ismatch){
    return res.send("wrong password");
   }else{
    req.session.user=newuser.rows[0];
        res.redirect("/");
}});


app.post("/register",async(req,res)=>{
    const registerpwd=req.body.password;
    const password=await hashedpwd(registerpwd);
    if(req.body.username.trim()===""||registerpwd.trim()===""){
       res.send("pls fill all values");
    }else {
    await db.query("INSERT INTO login(email,password) VALUES ($1,$2)",[req.body.username,password]);
    res.redirect("/login");
    }
});

app.get("/logout",(req,res)=>{
    req.session.destroy(()=>{
        res.redirect("/");
    });
});


app.get("/post",async(req,res)=>{
   res.render("post.ejs");
})

app.get("/myposts",async(req,res)=>{
    const user=req.session.user;
    const post= await db.query("SELECT * FROM posts WHERE user_id=$1",[user.id]);
    // res.json(post.rows);
    // console.log(user);

    res.render("my-posts.ejs",{posts:post.rows});
});

app.get("/edit/:id",async(req,res)=>{
   const id=req.params.id;
   console.log(id);
   const result=await db.query("SELECT * FROM posts WHERE id=$1",[id]);
   res.render("edit.ejs",{title:result.rows[0].title,content:result.rows[0].description,id:id});
})

app.post("/api/edit",async(req,res)=>{
    const data=req.body;
    console.log(data);
  await db.query("UPDATE posts SET title=$1,type=$2,description=$3 WHERE id=$4",[data.title,data.type,data.description,data.id]);
  res.json({message:"updated"});
})

app.post("/delete/:id",async(req,res)=>{
  const user=req.session.user;
  const postId = req.params.id;
    if (!user) {
        return res.status(401).json({message:"not logged"});
    }
  await db.query("DELETE FROM posts WHERE id=$1 AND user_id=$2",[postId,user.id]);
  res.redirect("/myposts");
  console.log(user);  
  console.log(postId);
})

app.listen(3000,()=>{
    console.log("Server running on port 3000");
});
