import {gtDropDown,mainDropDown,warningPopUp,setId,updateDataAttribute} from "./Common script.js";
import {myFire} from "./Firebase data.js";

typeDropDown()
//addFrom()
/*async function addFrom(){
   const mainArray = await myFire.getMainArray('52');
   mainArray.forEach((mainObject)=>{
      mainObject.subComponent.forEach((subObject)=>{
         subObject.op.forEach((opObject)=>{
            opObject.from = "";
            opObject.to = opObject.date;
         })
      });
   });
   await myFire.updateGtData('52',mainArray)
}*/

document.querySelectorAll('.addIn-options button').forEach((button)=>{
   button.addEventListener('click', ()=>{
      updateGtDropDown();
      const buttonName = button.innerHTML;
      document.querySelector('.addIn-display').style.display = "grid";
      let element;
      if(buttonName === 'GT'){
         element = document.querySelector('.addGT');
         element.style.display = "grid";
      }else if(buttonName === 'Main Component'){
         element = document.querySelector('.add-main');
         element.style.display = "grid";
      }else if(buttonName === 'Sub Component'){
         element = document.querySelector('.add-sub');
         element.style.display = "grid";
      }else if(buttonName === 'Component Type'){
         element = document.querySelector('.add-type');
         element.style.display = "grid";
      }else if(buttonName === 'Assign Op to Type'){
         element = document.querySelector('.assign-opToType');
         element.style.display = "grid";
      }
      
      closingAddInDisplay(element)
   });
});

function closingAddInDisplay(element) {
    document.querySelector('.closing-addIn-display').onclick = ()=>{
       document.querySelector('.addIn-display').style.display = "none";
       element.style.display = "none";
    }
}


/*------Adding new GT----------*/
document.querySelector('.add-gt-button').onclick = async ()=>{
   const newGtElement = document.querySelector('.add-gt-input')
   const newGtValue = newGtElement.value;
   
   if(newGtValue === ''){
      alert('Type a GT number');
      return;
   }
   
   const gtRepeat = await gtCount(newGtValue);
   if(gtRepeat){
      alert('GT already added');
      return;
   }
   
   const response = await warningPopUp(`Adding GT ${newGtValue}`);
   if(response === 'Yes'){
      await myFire.addGt(newGtValue);
      updateGtDropDown();
      newGtElement.value="";
   }
}
/*-------------------End--------------------*/

async  function updateGtDropDown(){
   await gtDropDown('gt-selection-forMain');
   await gtDropDown('gt-selection-forSub');
}


/*------Adding new main component----------*/
document.querySelector('.add-newMain-button').onclick= async ()=>{
   const gtSelected = document.querySelector('.gt-selection-forMain').value;
   const gtIn = await gtCount(gtSelected);
   if(!gtIn){
      alert('Select a GT');
      return;
   }
   
   const newMainInputElement = document.querySelector('.new-main-input');
   const newMainName = newMainInputElement.value;
   const newMainPattElement = document.querySelector('.new-mainPatt-input');
   const newMainPatt = newMainPattElement.value;
   if(!newMainName){
      alert('Type a Component Name');
      return;
   }
   
   const mainArray = await myFire.getMainArray(gtSelected);
   const mainRepeat = await mainCount(mainArray, newMainName);
   if(mainRepeat){
      alert('Componemt already added');
      return;
   }
   
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
   }
}
/*-------------------End--------------------*/

document.querySelector('.gt-selection-forSub').onchange = function (){
   const gtSelected = this.value;
   mainDropDown (gtSelected,'main-select');
}

/*-----------setting id to main Select------------*/
document.querySelector(".main-select").onchange = function () {
   updateDataAttribute(this);
}
/*-------------------End--------------------*/

/*-----------Adding Sub component------------*/
document.querySelector('.add-newSub-button').onclick = async ()=>{
   const gtSelected = document.querySelector('.gt-selection-forSub').value;
   const gtIn = await gtCount(gtSelected);
   if(!gtIn){
      alert('Select a GT');
      return;
   }
   
   const mainArray = await myFire.getMainArray(gtSelected);
   const mainSelectedElement=document.querySelector('.main-select');
   const mainComponentId = mainSelectedElement.dataset.componentId
   const mainSelectedValue = mainSelectedElement.value;
   
   const mainIn = mainCount(mainArray, mainSelectedValue);
   if(!mainIn){
      alert('Select a Main Component');
      return;
   }
   
   let subArray;
   mainArray.forEach((object)=>{
      if(object.id === mainComponentId){
         subArray = object.subComponent;
      }
   })
   const newSubInputElement = document.querySelector('.new-sub-input');
   let newSubName = newSubInputElement.value;
   const newPattInputElement = document.querySelector('.new-subPatt-input');
   let newPattnum = newPattInputElement.value;
   if(!newSubName){
      alert('Type a Sub Component Name');
      return;
   }
   let subCount =0;
   subArray.forEach((object)=>{
      if(object.name === newSubName){
         subCount++;
      }
   });
   if(subCount){
      alert(`${newSubName} already added in ${mainSelectedValue} of ${gtSelected}`);
      return;
   }
   
   const typeName = document.querySelector('.sub-type-select').value;
   const typeArray = await myFire.getTypeArray();
   const typeIn = typeCount(typeArray, typeName);
   if(!typeIn){
      alert("Select Type of Sub Component");
      return;
   }
   
   const response = await warningPopUp('Are You Sure');
   if(response === 'Yes'){
      const rNum = setId (subArray);
      const subId = `${mainComponentId}-sub-${rNum}`;
      let opArray = setOpType(typeName,typeArray);
      opArray.forEach((object,index)=>{
         let oprNum = setId (opArray);
         let opId = `${subId}-op-${oprNum}`;
         opArray[index].id = opId;
         opArray[index].rNum = oprNum;
      });
                   
      subArray.push({
         rNum,
         id : subId,
         name: newSubName,
         patt: newPattnum,
         op: opArray
      });
      
      newSubInputElement.value='';
      newPattInputElement.value = '';
      document.querySelector('.sub-type-select').value = 'Select Sub Type';
      await myFire.updateGtData(gtSelected,mainArray)
      alert(`${newSubName} component added to ${mainSelectedValue}`)
   }
}
/*-------------------End--------------------*/

async function gtCount(gtValue) {
   const gtArray = await myFire.getGtArray();
   let count = 0;
   gtArray.forEach((value)=>{
      if(value === gtValue){
         count++;
      }
   });
   return count;
}

function mainCount(mainArray, mainValue) {
   let count = 0;
   mainArray.forEach((object)=>{
      if(object.name === mainValue){
         count++;
      }
   });
   return count;
}

function typeCount(typeArray, typeValue) {
   let count = 0;
   typeArray.forEach((object)=>{
      if(object.type === typeValue){
         count++;
      }
   });
   return count;
}
/*------------ End------------------*/

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
           from: '',
           to: ''
        });
    })
   return addOpArray;
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


document.querySelector(".assign-op-button").onclick = async ()=>{
   const typeSelectedValue = document.querySelector(".assign-type-select").value;
   const typeArray = await myFire.getTypeArray();
   
   let typeCount = 0;
   let opArray;
   typeArray.forEach((object,index)=>{
      if(object.type === typeSelectedValue){
         typeCount++;
         opArray = object.op;
      }
   });
   if(!typeCount){
      alert("Select a type");
      return;
   }
   
   document.querySelector(".assign-opToType-div").style.display = "flex";
   
   document.querySelector(".closing-opToType-div").onclick = ()=>{
      document.querySelector(".assign-opToType-div").style.display = "none";
   }
   
   document.querySelector(".type-selected-value").innerHTML = typeSelectedValue;
   
   renderOpTypeHtml(opArray, typeArray);
}

function renderOpTypeHtml(opArray, typeArray) {
   const opArrayLength = opArray.length;
   if(!opArrayLength){
      opArray.push('');
   }
   
   let html = "";
   opArray.forEach((value, index)=>{
      html += `
      <div class= "rendered-op-div">
        <input class="rendered-op-input op-input-${index}" placeholder="Type New Op" data-index = ${index} value = "${value}">
        <button class="add-op-button" data-index = ${index}>+</button>
        <button class="op-delete-button" data-index = ${index}>X</button>
      </div>
      <div class="op-list op-list-${index}">
        
      </div>
      `;
   });
   
   document.querySelector(".render-typeOp").innerHTML = html;
   renderedOpAttributes(opArray, typeArray);
}

function renderedOpAttributes(opArray, typeArray){
   document.querySelectorAll('.rendered-op-input').forEach(async (inputElement)=>{
      const previousValue = inputElement.value;
      const opListArray = await myFire.getOpArray();

      inputElement.addEventListener('keydown', async (event)=>{
         const index = inputElement.dataset.index;
         const newName = inputElement.value;
             
         if(event.key === 'Enter'){
            if(!newName){
               alert("Type a New Op");
               return;
            }
            if(newName !== previousValue){
               const response = await warningPopUp('Are You Sure');
                if(response === 'Yes'){
                   opArray[index] = newName;
                   await myFire.updateTypeArray(typeArray);
                   
                   addToOpList(newName);
                }else{
                   inputElement.value = previousValue;
                }
            }
         }
      });
      
      inputElement.addEventListener('input', async ()=>{
         const index = inputElement.dataset.index;
         document.querySelector(`.op-list-${index}`).style.display = "grid";
         const inputValue = inputElement.value;
         opDropDown(opListArray,inputElement,index);
      });
      
      inputElement.addEventListener('change', async ()=>{
         const index = inputElement.dataset.index;
         setTimeout(()=>{
            document.querySelector(`.op-list-${index}`).style.display = "none";
         },100);
         
      });
   });
   
   document.querySelectorAll('.add-op-button').forEach((addOpButton)=>{
      addOpButton.addEventListener('click', ()=>{
         let index = addOpButton.dataset.index;
         index++;
         opArray.splice(index,0,"");
         renderOpTypeHtml(opArray,typeArray);
      });
   });
   
   document.querySelectorAll('.op-delete-button').forEach((deleteOpButton)=>{
      deleteOpButton.addEventListener('click', async ()=>{
         const index = deleteOpButton.dataset.index;
         
         const response = await warningPopUp('Are You Sure');
         if(response === 'Yes'){
             opArray.splice(index,1);
             await myFire.updateTypeArray(typeArray);
             renderOpTypeHtml(opArray,typeArray);
         }
      });
   });
}

/*-----------Adding Op------------*/
async function addToOpList(newOp) {
   const opArray = await myFire.getOpArray();
      
   let count=0;
   opArray.forEach((value)=>{
      if(value === newOp){
             count++;
      }
   });
       
   if(!count){
      opArray.push(newOp);
      await myFire.updateOpArray(opArray);
      opDropDown();
   }
}
/*-------------------End--------------------*/

/*-----------op DropDown------------*/
async function opDropDown(opArray,inputElement,index) {
   let inputValue = inputElement.value;
   inputValue = inputValue.toLowerCase();
   
   const result = opArray.filter(value => value.toLowerCase().includes(inputValue));
   
   let html="";
   result.forEach((value)=>{
      html += `<button class="op-list-options">${value}</button>`
   });
   
   document.querySelector(`.op-list-${index}`).innerHTML = html;
   
   document.querySelectorAll('.op-list-options').forEach((option)=>{
      option.addEventListener('click',()=>{
         const newValue = option.innerHTML;
         inputElement.value = newValue;
         inputElement.focus();
      });
      
   })
}
/*-------------------End--------------------*/