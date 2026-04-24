let data=[];

let div=document.querySelector(".main-content");
let my_posts=document.querySelector(".inner-block");

async function getdatafromdb() {
   const result=await fetch("/api/posts");
   data = await result.json();
   console.log(data);
   displayposts(data);
}

getdatafromdb();


let modal=document.querySelector(".post-btn");
let post=document.querySelector(".nav-btn");
let cancel=document.querySelector(".cancel-btn");
let submit=document.querySelector(".post-submit");
let search=document.querySelector(".search-btn");
let update=document.querySelector(".edit-submit");
let edit_cancel=document.querySelector(".post-cancel");

if (submit) {
  

submit.addEventListener("click",()=>{
  let input=document.querySelector(".input-text");
  let topic=document.querySelector(".select-data");
  let content=document.querySelector(".content-data");
  
  if (input.value.trim()===""|| content.value.trim()==="") {

    alert("please fill all the Fields");

  } else {

    let newobj={title:input.value,
              type:topic.value,
              description:content.value,
              author:"unknown",
  };

  data.push(newobj);
  

  async function sendata() {

    try {
    const result=await fetch("/api/submit",{
      method:"post",
      headers:{"Content-Type":"application/json"},
      credentials:"include",
      body: JSON.stringify(newobj)
    });

      window.location.href="/";
  
  }catch(err){
    console.log(err);
  }
  };

  sendata();

  }
        
})};

if (cancel) {
  cancel.addEventListener("click",()=>{
    window.location.href="/";
  })
}

if(edit_cancel){
  edit_cancel.addEventListener("click",()=>{
     window.location.href="/myposts";
  })
}

//code for update of post
if(update){
update.addEventListener("click",()=>{
  let input=document.querySelector(".input-text");
  let topic=document.querySelector(".select-data");
  let content=document.querySelector(".content-data");
  let postid=document.getElementById("post-id").value;
  
  if (input.value.trim()===""|| content.value.trim()==="") {

    alert("please fill all the Fields");

  } else {
     let newobj={title:input.value,
              type:topic.value,
              description:content.value,
              author:"unknown",
              id:postid
     }

     async function sendata() {

    try {
    const result=await fetch("/api/edit",{
      method:"post",
      headers:{"Content-Type":"application/json"},
      credentials:"include",
      body: JSON.stringify(newobj)
    });

      window.location.href="/myposts";
  
  }catch(err){
    console.log(err);
  }
  };
  sendata();
  };
});
};

//code for showing data on home-page

function displayposts(arraydata) {
  div.innerHTML="";
   
  arraydata.forEach(element=>{
      div.insertAdjacentHTML("beforeend",`<h3>${element.title}</h3><br>
              <p>${element.type}</p><br>
              <p>${element.description}</p><br>
              <p>${element.author}</p><br>
              <hr><br>`)
  });
}



//code for searching >>

let displaydata=document.getElementById("search-text");
    
if (displaydata) {
  

   displaydata.addEventListener("keyup",()=>{

    let searched=displaydata.value.toLowerCase();
      if(searched.trim()===""){
         displayposts(data);
         return;
      };
      
    let filtered=data.filter(post=>
      post.title.toLowerCase().includes(searched) ||
      post.type.toLowerCase().includes(searched) ||
      post.description.toLowerCase().includes(searched) ||
      post.author.toLowerCase().includes(searched)
    );
      console.log(filtered.length);
    if(filtered.length>0){
    displayposts(filtered);
    }
    else{
      div.innerHTML="<h3>No Result Found</h3>";
    }
   });
  

   let btnvalue=document.querySelectorAll(".search-btn");

   btnvalue.forEach(btn=>{  
   btn.addEventListener("click",()=>{
    let searchbtn=btn.value;

    let searchfilter=data.filter(search=>search.type===searchbtn);
      
    displayposts(searchfilter);
   });
     })};

     
