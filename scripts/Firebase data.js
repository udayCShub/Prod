import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, addDoc,collection, getDocs,getDoc,setDoc, doc,updateDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
  
const firebaseConfig = {
    apiKey: "AIzaSyAG2OBGHpuPp0J_gVRowl9auzboSVmzJWM",
    authDomain: "trying-forebase.firebaseapp.com",
    projectId: "trying-forebase",
    storageBucket: "trying-forebase.firebasestorage.app",
    messagingSenderId: "18119804797",
    appId: "1:18119804797:web:74d2047787c24055db6e14",
    measurementId: "G-ED0S4J6SLB"
};

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

async function getallGTsData(){
    const docRef = doc(db, "Prod", "allGTs");
    const docSnap = await getDoc(docRef);
    
    let allGTsData;
    if (docSnap.exists()) {
        allGTsData = docSnap.data();
    }
    return allGTsData
}

async function getTypeOpDoc(){
    const docRef = doc(db, "Prod", "typeOpDoc");
    const docSnap = await getDoc(docRef);
    
    let typeOpDoc
    if (docSnap.exists()) {
        typeOpDoc = docSnap.data();
    }
    return typeOpDoc
}

export const myFire = {
    async getGtArray(){
        document.querySelector('.wait-popUp').style.display = "grid";
        const allGTsData = await getallGTsData();
        const gtArray = Object.keys(allGTsData);
        document.querySelector('.wait-popUp').style.display = "none";
        return gtArray;
    },
    
    async addGt(gtNum){
        document.querySelector('.wait-popUp').style.display = "grid";
        let gtArray = await myFire.getGtArray()
        let count=0;
        gtArray.forEach((gtValue)=>{
            if(gtValue === gtNum){
                count++;
            }
        });
        
        if(!count){
            let mainArray = await myFire.getMainArray("Main");
            await myFire.updateGtData(gtNum,mainArray);
            alert("GT successfully added"); 
        }else{alert("Gt already exists")}
        document.querySelector('.wait-popUp').style.display = "none";
    },
    
    async updateGtData(gtNum,mainArray){
        document.querySelector('.wait-popUp').style.display = "grid";
        await updateDoc(doc(db, "Prod", "allGTs"), {
            [gtNum]: mainArray
        });
        alert("stored to fire")
        document.querySelector('.wait-popUp').style.display = "none";
    },
    
    async getMainArray(gtNum){
        document.querySelector('.wait-popUp').style.display = "grid";
        const allGTsData = await getallGTsData();
        let mainArray = allGTsData[gtNum];
        document.querySelector('.wait-popUp').style.display = "none";
        return mainArray;
    },
    
    async getTypeArray(){
        document.querySelector('.wait-popUp').style.display = "grid";
        const typeOpDoc = await getTypeOpDoc();
        let typeArray = typeOpDoc.typeArray;
        document.querySelector('.wait-popUp').style.display = "none";
        return typeArray;
    },
    
    async updateTypeArray(typeArray){
        document.querySelector('.wait-popUp').style.display = "grid";
        await updateDoc(doc(db, "Prod", "typeOpDoc"), {
            typeArray
        });
        alert("typeArray stored to fire");
        document.querySelector('.wait-popUp').style.display = "none";
    },
    
    async getOpArray(){
        document.querySelector('.wait-popUp').style.display = "grid";
        const typeOpDoc = await getTypeOpDoc();
        let opArray = typeOpDoc.opArray;
        document.querySelector('.wait-popUp').style.display = "none";
        return opArray;
    },
    
    async updateOpArray(opArray){
        document.querySelector('.wait-popUp').style.display = "grid";
        await updateDoc(doc(db, "Prod", "typeOpDoc"), {
            opArray
        });
        alert("opArray stored to fire");
        document.querySelector('.wait-popUp').style.display = "none";
    }
}
