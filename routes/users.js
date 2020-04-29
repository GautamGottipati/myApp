var express = require('express');
var router = express.Router();
const uuid = require('uuid');
const app = express();
const userpost = require('../helpers/userpost');
const members = require('../helpers/db');
const mongo =  require('mongodb');
const assert = require('assert');
const cookieParser = require('cookie-parser');

const url = "mongodb+srv://gautam123:gautam123@projectcrud-qrqlx.mongodb.net/test?retryWrites=true&w=majority";

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
var authentication = function (req, res, next) {
  console.log(req.cookies);
  if (req.cookies.auth_token) {
    next();
  } else {
    res.redirect('/');
  }
 };


//Body parser middle ware

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());


router.get('/',authentication,(req,res)=>{
  const myActiveMembers = [];
  members.forEach((member)=>{
    if(member.status === "active"){
      myActiveMembers.push(member);
    }
  })
  console.log(myActiveMembers,"came here");
  res.render('userlist',{title:"Users",condition:false,myActiveMembers});
  // res.sendFile('/users');
  // res.json(myActiveMembers);
});

// Viewing all posts
router.get('/posts',authentication,(req,res)=>{
  const myPosts = [];
  console.log("This is for view posts ",req.cookies);
  userpost.forEach((post)=>{
    if(post.status === "active"){
      myPosts.push(post);
    }
  })
  console.log(myPosts,"came here");
  res.render('posts',{title:"Posts",username:`${req.cookies.userCookie}`,condition:false,myPosts});
  // res.sendFile('/users');
  // res.json(myActiveMembers);
});

// Get user base on id
router.get('/:id',authentication,(req,res)=>{
  const user = req.params;
  console.log(members);
  const found = members.some(member=>member.id === parseInt(user.id));
  var a = [];
  
  console.log(user.id);
  var myuser = members.filter((member)=>{
    console.log(member.id);
    if(`${member.id}` === `${user.id}`){
      a.push(member);
    }
    member.id === parseInt(user.id);
  });
  console.log(found);
  if(found){
    res.render('user',{id:a[0].id ,name:a[0].name, email:a[0].email,posts:a[0].posts});
    console.log("Printing user", myuser);
    // res.json(a);  
  }else{
    res.status(400).render('error',{message:"User not found"});//json({ msg : `No member with id: ${user.id}`});
  }
  
  
})

// geting user page based on name
router.get('/user/:name',authentication,(req,res)=>{
  // console.log("Hurray came here")
  const user = req.params;
  console.log(typeof(user.name));
  console.log(members);
  const found = members.some(member=>member.name === user.name);
  console.log(found);
  var a = [];
  
  console.log(user.name);
  var myuser = members.filter((member)=>{
    console.log(member.name,user.name);
    if(member.name === user.name){
      a.push(member);
    }
    member.name === parseInt(user.name);
  });
  console.log(found);
  if(found){
    console.log(a[0]);
    res.render('user',{id:a[0].id ,name:a[0].name, email:a[0].email,posts:a[0].posts});
    console.log("Printing user", myuser);
    // res.json(a);  
  }else{
    res.status(400).render('error',{message:"User not found"});//json({ msg : `No member with id: ${user.id}`});
  }
  
  
})


//creating members

router.post('/',(req,res)=>{
  console.log("Came here");
  var newUser = req.body;
  if(!newUser.name || !newUser.email){
    return res.status(400).render('error',{
      message: 'Please enter name and email id'
    });
  }

  const found = members.some(member=>member.name === newUser.name);
  console.log(found,newUser.name);
  if(found){
    res.cookie('userCookie',newUser.name);
    res.cookie("auth_token", "qwertyuio", { httpOnly: true, maxAge: 1000000 });
    console.log("found the user");
    return res.redirect(`api/user/${newUser.name}`);
  }
  const user = {
    id : uuid.v4() ,
    name : newUser.name,
    email : newUser.email,
    posts : [],
    status : 'active'
  }
  console.log("I am printing user:",user);
  members.push(user);
  // res.json(members);
  res.render('posted',{name : user.name});
  // res.redirect('/posted');
  // res.send(req.body);
})

//Adding post

router.post('/post',authentication,(req,res)=>{
  console.log("Came here posting");
  var newUser = req.body;
  var cname = req.cookies;
  console.log("Printing cookies",cname.userCookie);
  console.log("Your",req.body.post);
  var newpost = {
    name : cname.userCookie,
    posts : req.body.post,
    status : 'active'
  };
  console.log(userpost);
  console.log(newpost);
  userpost.unshift(newpost);
  console.log("added to userpost");
  console.log(userpost);
  console.log(members);
  members.forEach((member)=>{
    if(member.name === cname.userCookie){
      console.log("inside if :",member.posts,member);
      member.posts.unshift(req.body.post);
    }
      console.log("after if :",member.posts);
    
  });
  console.log("Printing macha");
  res.redirect(`/api/posts`);
  // res.redirect(`/users/user/${cname.userCookie}`);
})

//load edit form

router.get('/edit/:id',authentication,(req,res)=>{
  const user = req.params;
  console.log(members);
  const found = members.some(member=>member.id === parseInt(user.id));
  var a = [];
  
  console.log(user.id);
  var myuser = members.filter((member)=>{
    console.log(member.id);
    if(`${member.id}` === `${user.id}`){
      a.push(member);
    }
    member.id === parseInt(user.id);
  });
  console.log(found);
  if(found){
    res.render('edit',{title:"Edit", id:a[0].id ,name:a[0].name, email:a[0].email});
    console.log("Printing user", myuser);
    // res.json(a);  
  }else{
    res.status(400).render('error',{message:"User not found"});//json({ msg : `No member with id: ${user.id}`});
  }
  
  
})

//updating
router.post('/edit/:id',authentication,(req,res)=>{
  console.log("Came here macha - - - - ");
  const user = req.params;
  const found = members.some(member=>member.id === parseInt(user.id) && member.status ==="active");
  console.log(req.params);
 
  if(found){
    const updateMember = req.body;
    console.log(updateMember,"Printing um");
    members.forEach((member)=>{
      console.log(member,"Helo");
      if(member.id === parseInt(req.params.id)){
        console.log("camein");
        member.name = updateMember.name ? updateMember.name : member.name;
        member.email = updateMember.email ? updateMember.email : member.email;
        // res.render('error',{message:"You have updated successfully"});
        res.redirect('/api');
        // res.json({msg:"Member updated",member})
        console.log("updated");
      }

      
    })
  }else{
    res.status(400).render({message:`No member with id: ${user.id}`});//json({ msg : `No member with id: ${user.id}`});
  }
  
  
})

// Delete User
router.delete('/:id',authentication,(req,res)=>{
  const user = req.params;
  const found = members.some((member)=>member.id === parseInt(user.id) && member.status ==="active");
  console.log(found);
  if(found){
    // members= [];
    members.forEach((member)=>{
        if(member.id === parseInt(req.params.id)){
          member.status = "deleted";
        }
      
    })
    res.json({ 
      msg : "Member deleted",
      
    }) ; 
  }else{
    res.status(400).json({ msg : `No member with id: ${user.id}`});
  }
  
  
})


module.exports = router;
