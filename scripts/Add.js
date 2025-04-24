import {gtDropDown,mainDropDown,warningPopUp,setId,updateDataAttribute} from "./Common script.js";
import {myFire} from "./Firebase data.js";

await gtDropDown('gt-selection-forAdd');
let mainArray;
let gtSelected;
typeDropDown();
opDropDown();

/*------Adding new GT----------*/
document.querySelector('.add-gt-button').onclick = async ()=>{
   const newGtElement = document.querySelector('.add-gt-input')
   const newGtValue = newGtElement.value;
   if(newGtValue === ''){
      alert('Type GT number')
   }else{
      const response = await warningPopUp(`Adding GT ${newGtValue}`);
      if(response === 'Yes'){
         await myFire.addGt(newGtValue);
         gtDropDown('gt-selection-forAdd');
         newGtElement.value="";
      }
   }    
}
/*-------------------End--------------------*/

/*------Main Array and Main dropdown----------*/
document.querySelector('.gt-selection-forAdd').onchange = async ()=>{
   gtSelected = document.querySelector('.gt-selection-forAdd').value;
   const gtArray = await myFire.getGtArray();
   
   let count=0;
   gtArray.forEach((value)=>{
      if(value === gtSelected){
         count++;
      }
   });
   
   
   if(count){
      mainArray = await myFire.getMainArray(gtSelected);
   }else{
      mainArray="";
   }
   mainDropDown (gtSelected,'main-select');
}
/*-------------------End--------------------*/


/*------Adding new main component----------*/
document.querySelector('.add-newMain-button').onclick= async ()=>{
   if(mainArray){
       const newMainInputElement = document.querySelector('.new-main-input');
        let newMainName = newMainInputElement.value;
        
        const newMainPattElement = document.querySelector('.new-mainPatt-input');
        let newMainPatt = newMainPattElement.value;
      
        if(newMainName && newMainPatt){
           let count=0;
           mainArray.forEach((object)=>{
              if(newMainName === object.name){
                 count++;
              }
           });
           if(!count){
               const response = await warningPopUp('Are You Sure');
               if(response === 'Yes'){
                  let rNum = await setId (mainArray);
                  mainArray.push({
                    rNum,
                    id : `main-${rNum}`,
                    name: newMainName,
                    patt: newMainPatt,
                    subComponent: []
                 });
                  
                newMainInputElement.value='';
                newMainPattElement.value='';
                await myFire.updateGtData(gtSelected,mainArray)
                alert(`${newMainName} Added in ${gtSelected}`)
                mainDropDown (gtSelected,'main-select'); 
               }
           }else{alert(`${newMainName} already exists`);}
        }else{alert('Fill all the details');}
    }else{alert("Select GT")}
}
/*-------------------End--------------------*/

/*-----------setting id to main Select------------*/
document.querySelector(".main-select").onchange = async ()=>{
   const mainSelectElement = document.querySelector(".main-select");
   await updateDataAttribute(mainSelectElement);
}
/*-------------------End--------------------*/


/*-----------Add Type------------*/
document.querySelector('.add-newType-button').onclick= async ()=>{
    const typeInputElement=document.querySelector('.new-type-input');
    const typeInputValue = typeInputElement.value;
    
    const typeArray = await myFire.getTypeArray();
    
   if(typeInputValue){
       let count=0;
       typeArray.forEach((object)=>{
          if(object.type === typeInputValue){
             count++;
          }
       });
      
       if(!count){
           typeArray.push({type: typeInputValue, op:[]});
           typeInputElement.value = '';
           await myFire.updateTypeArray(typeArray);
       }else{alert("Type already exists")}
    }
   
   typeDropDown();
}
/*-------------------End--------------------*/

/*-----------Type DropDown------------*/
async function typeDropDown(){
    const typeArray = await myFire.getTypeArray();
    let html = '<option>Select Sub Type</option>';
    
   typeArray.forEach((object)=>{
         html += `<option>${object.type}</option>`
    });
                
    document.querySelector('.sub-type-select').innerHTML=html;
    document.querySelector('.assign-type-select').innerHTML=html;
}
/*-------------------End--------------------*/

/*-----------Adding Op------------*/
document.querySelector('.add-newOp-button').onclick= async ()=>{
    const opInputElement=document.querySelector('.new-op-input');
    let opInputValue = opInputElement.value;
    
    if(opInputValue){
       const opArray = await myFire.getOpArray();
       
       let count=0;
       opArray.forEach((value)=>{
          if(value === opInputValue){
             count++;
          }
       });
       
       if(!count){
          opArray.push(opInputValue);
          opInputElement.value='';
          await myFire.updateOpArray(opArray);
          opDropDown();
       }else{alert("Op already exists")}
    }else{alert("Type a Op")}
}
/*-------------------End--------------------*/

/*-----------op DropDown------------*/
async function opDropDown(){
   const opArray = await myFire.getOpArray();
   
   let html='<option>Select Op</option>';
   opArray.forEach((value)=>{
      html += `<option>${value}</option>`
   });
                
   document.querySelector('.assign-op-select').innerHTML=html;
}
/*-------------------End--------------------*/

/*-----------Assigning Op to type------------*/
document.querySelector('.assign-opToType-button').onclick= async ()=>{
   const typeSelectedValue = document.querySelector('.assign-type-select').value;
   const opSelectedValue = document.querySelector('.assign-op-select').value;
   
   const typeArray = await myFire.getTypeArray();
   let typeCount=0;
   typeArray.forEach((object)=>{
      if(object.type === typeSelectedValue){
         typeCount++;
      }
   });
   
   const opArray = await myFire.getOpArray();
   let opCount=0;
   opArray.forEach((value)=>{
      if(value === opSelectedValue){
         opCount++;
      }
   });
   
   if(typeCount && opCount){
      typeArray.forEach((object,index)=>{
         if(object.type === typeSelectedValue){
            object.op.push(opSelectedValue);
         }
      });
      await myFire.updateTypeArray(typeArray);
      alert('Done');
      document.querySelector('.assign-op-select').value = 'Select Op';
   }else{alert("select options")}
}
/*-------------------End--------------------*/


/*-----------Adding Sub component------------*/
document.querySelector('.add-newSub-button').onclick = async ()=>{
   const mainSelectedElement=document.querySelector('.main-select');
   const mainComponentId = mainSelectedElement.dataset.componentId
   const mainSelectedValue = mainSelectedElement.value;
   
   const newSubInputElement = document.querySelector('.new-sub-input');
   let newSubName = newSubInputElement.value;
   const newPattInputElement = document.querySelector('.new-subPatt-input');
   let newPattnum = newPattInputElement.value;
   
   const typeName = document.querySelector('.sub-type-select').value;
   
   let mainCount=0;
   let subComponentArray;
   if(mainArray){
       mainArray.forEach((object)=>{
          if(object.name === mainSelectedValue){
             mainCount++;
             subComponentArray = object.subComponent;
          }
       })
   }else{
      alert("Select GT");
      return;
   }
   
   if(!mainCount){
      alert("Select Main Component");
      return;
   }
   
   let subCount =0;
   subComponentArray.forEach((object)=>{
      if(object.name === newSubName){
         subCount++;
      }
   });
   
   if(subCount){
      alert(`${newSubName} already added in ${mainSelectedValue} of ${gtSelected}`);
      return;
   }
   
   let typeCount=0;
   const typeArray = await myFire.getTypeArray();
   typeArray.forEach((object)=>{
      if(object.type === typeName){
         typeCount++;
      }
   })
   
   if(!typeCount){
      alert("Select Type of Sub Component");
      return;
   }
   
   if(mainCount && newSubName && newPattnum && typeCount){
      const response = await warningPopUp('Are You Sure');
      if(response === 'Yes'){
         let mainIndex;
         let subId;
           
         mainArray.forEach((object,index)=>{
            if(object.id === mainComponentId){
               mainIndex = index;
               let rNum = setId (object.subComponent);
               subId = `${mainComponentId}-sub-${rNum}`;
               
               let opArray = setOpType(typeName,typeArray);
               opArray.forEach((object,index)=>{
                  let oprNum = setId (opArray);
                  let opId = `${subId}-op-${oprNum}`;
                  opArray[index].id = opId;
                      opArray[index].rNum = oprNum;
                   });
                   
                   object.subComponent.push({
                       rNum,
                       id : subId,
                       name: newSubName,
                       patt: newPattnum,
                       op: opArray
                   });
                }
           });
         
           newSubInputElement.value='';
           newPattInputElement.value = '';
           document.querySelector('.sub-type-select').value = 'Select Sub Type';
           await myFire.updateGtData(gtSelected,mainArray)
           alert(`${newSubName} component added to ${mainSelectedValue}`)
        }
   }else{alert('Fill all above options')}
}
/*-------------------End--------------------*/

/*-----------adding op object to Sub------------*/
function setOpType(typeValue,typeArray) {
    let resultArray;
    typeArray.filter((object,index)=>{
       if(object.type === typeValue){
        resultArray = object.op;
       }    
    });
                
    let addOpArray=[];
    resultArray.forEach((value)=>{
        addOpArray.push({
           rNum: '',
           id: '',
           name: value,
           date: ''   
        });
    })
   return addOpArray;
}
/*-------------------End--------------------*/
