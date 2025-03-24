const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn")
const fileInput=document.querySelector("#fileInput");


const progressContainer=document.querySelector(".progress-container");
const bgProgress=document.querySelector(".bg-progress");
const progressBar=document.querySelector(".progress-bar");
const percentDiv=document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container");
const fileURLinput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#emailForm");

const host= "https://innshare.herokuapp.com/"; 
//const uploadURL = ${host}api/files; 
//const emailURL = '${host}api/files/send';

dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();
     console.log("dragging");

    if(!dropZone.classList.contains("dragged")){
    dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave",()=>{
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop",(e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files=e.dataTransfer.files;
    console.log(files);
    if(files.length){
        fileInput.files=files;
        uploadFile()
    }
});

fileInput.addEventListener("change", ()=>{
    uploadFile();
})

browseBtn.addEventListener("click", ()=>{
    fileInput.click()
    document.execCommand("copy")
});

copyBtn.addEventListener("click", ()=>{
    fileURLinput.select()
})
const uploadFile=()=>{
    progressContainer.style.display="block";
    const file=fileInput.files[0];
    const formData=new FormData();
    formData.append("myfile", file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange=()=>{
        if (xhr.readyState===XMLHttpRequest.DONE) {
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
    };

    xhr.upload.onprogress=updateProgress;

    xhr.open("POST",uploadURL);
    xhr.send(formData);
};

const updateProgress=(e)=>{
    const percent=Math.round((e.loaded / e.total)*100);
    // console.log(percent);
    bgProgress.style.width= ${percent}%; // syntax error
    percentDiv.innerText=percent;
    progressBar.style.transform=scaleX(${percent/100});
};

const onUploadSuccess = ({file:url})=>{
    console.log(url);
    fileInput.value = "";
    progressContainer.style.display="none"
    sharingContainer.style.display="block"
    fileURLinput.value = url;
};

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    console.log("Submit form");
    const url = fileURLinput.value; 

    const formData = {
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value

    };
    emailForm[2].setAttribute("disabled", "true");
    console.table(formData);

    fetch(emailURL, ){
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(({success}) => {
            if (success){
                sharingContainer.style.display = "none";

            }
    });
}w);