import {gtDropDown,warningPopUp,updateDataAttribute,dateFormat,activateHiddenDateInput} from "./Common script.js";
import {myFire} from "./Firebase data.js";

await gtDropDown('edit-gt-select');
let mainArray;
let gtSelected;

document.querySelector('.edit-gt-select').onchange = ()=>{
    gtSelected = "";
    mainArray = "";
    document.querySelector('.render-selected').innerHTML = "";
}

document.querySelector('.initial-edit-button').onclick = async ()=>{
    const gtArray = await myFire.getGtArray();
    gtSelected = document.querySelector('.edit-gt-select').value;
    
    let count=0;
    gtArray.forEach((value)=>{
        if(value === gtSelected){
            count++;
        }
    });
    
    if(!count){
        alert("Select a GT");
        return;
    }
    
    mainArray = await myFire.getMainArray(gtSelected);

    const displayElement = document.querySelector('.render-selected');
    renderMainComponents(displayElement);
}

function renderMainComponents(displayElement){
    let html='';
    mainArray.forEach((object)=>{
        const componentName = object.name;
        const patt = object.patt;
        html += `
                <div class="rendered-main">
                    <button class="render-main-button main-button-${object.id}" data-main-id = ${object.id}>${componentName}</button>
                    <button class="main-edit-button edit-button" data-main-id = ${object.id}>✏️</button>
                    <div class="details-main details-main-${object.id} details" ></div>
                </div>
        `;
        displayElement.innerHTML = html;
    })
    displayElement.innerHTML = html;
    
    const changingIn = 'main';
    componentButtonAttributes(mainArray,changingIn);
}

/*----------------render sub components-------------*/
function renderSubComponents(mainId,subArray){
    let html='';
    subArray.forEach((object)=>{
       const componentName = object.name;
        const patt = object.patt;
        html += `
            <div class="rendered-sub">
                <button class="render-sub-button sub-button-${object.id}" data-sub-id = ${object.id}>${componentName}</button>
                <button class="sub-edit-button edit-button" data-sub-id = ${object.id}>✏️</button>
                <div class="details-sub details-sub-${object.id} details" ></div>
            </div>
        `;
    });
    isToDisplay(mainId,'main',html);
    
    const changingIn = 'sub';
    componentButtonAttributes(subArray,changingIn);
}
/*------------------------------ENd-----------------------*/


/*----------------render op-------------*/
function renderOp(subId,opArray){
    let html='';
    opArray.forEach((object)=>{
       const opName = object.name;
        const date = object.date;
        html += `<div class="rendered-op">
                        <button class="render-op-button op-button-${object.id}" data-op-id = ${object.id}>${opName}</button>
                        <button class="op-edit-button edit-button" data-op-id = ${object.id}>Edit</button>
                        <div class="details-op details-op-${object.id} details" ></div>
                </div>`;
    });
    isToDisplay(subId,'sub',html);
    
    opArray.forEach((object)=>{
        if(object.date){
            document.querySelector(`.op-button-${object.id}`).style.backgroundColor = 'lightgreen';
        }
    });
    
    
    const changingIn = 'op';
    componentButtonAttributes(opArray,changingIn);
}
/*------------------------------End-----------------------*/


/*----------------componentButtonAttributes-------------*/
function componentButtonAttributes(myArray,changingIn){
    if(document.title === "Home"){
        document.querySelectorAll('.edit-button').forEach((btns)=>{
            btns.style.display = "none";
        })
    }
    
    document.querySelectorAll(`.${changingIn}-edit-button`).forEach((editButton)=>{
        editButton.addEventListener('click',()=>{
            const id = editButton.dataset[`${changingIn}Id`];
            renderDetails(myArray,id,changingIn);
        });
    });
    
    document.querySelectorAll(`.render-${changingIn}-button`).forEach((mainButton,index)=>{
        mainButton.addEventListener('click',()=>{
            let index = mainButton.dataset.indexValue;
            const id = mainButton.dataset[`${changingIn}Id`];
            if(changingIn === 'main'){
                const objectProperty = 'subComponent';
                
                let nextArray;
                myArray.forEach((object)=>{
                    if(object.id === id){
                        nextArray = object[objectProperty];
                    }
                });
                renderSubComponents(id,nextArray);
            }else if(changingIn === 'sub'){
                const objectProperty = 'op';
                let nextArray;
                myArray.forEach((object)=>{
                    if(object.id === id){
                        nextArray = object[objectProperty];
                    }
                });
                renderOp(id,nextArray);
            }else if(changingIn === 'op'){
                const id = mainButton.dataset[`${changingIn}Id`];
                renderDetails(myArray,id,changingIn)
            }
        });
    });
}
/*------------------------------ENd-----------------------*/


/*----------------render details-------------*/
function renderDetails(myArray,id,changingIn){
    let property2;
    
    if(changingIn === 'op'){
        property2 = 'date';
    }else{
        property2 = 'patt';
    }
    
    let input2Type = 'text';
    
    let value1;
    let value2;
    myArray.forEach((object)=>{
        if(object.id === id){
            value1 = object.name;
            value2 = object[property2];
        }
    });
    
    let html = 
        `<input class="details-input-${id}-1 edit-input"  value ="${value1}">
        <input type= ${input2Type} class="details-input-${id}-2 details-input-2-${changingIn} edit-input"  value ="${value2}" data-id = ${id}>
        <div>
            <button class="details-save-button details-${changingIn}-buttons" data-id = ${id}>Save</button>
            <button class="details-delete-button details-${changingIn}-buttons" data-id = ${id}>Delete</button>
        </div>
    `;
    const goAhead = isToDisplay(id,changingIn,html);
    
    if(goAhead){
        renderButtonAttributes(myArray,changingIn)
    }
    if(changingIn === 'op'){
        convertToDate();
    }
}
/*------------------------------ENd-----------------------*/


/*----------------isToDisplay-------------*/
function isToDisplay (id,changingIn,html){
    const detailsElement = document.querySelector(`.details-${changingIn}-${id}`);
    const detailsHtml = detailsElement.innerHTML;
  
    const siblingElements = document.querySelectorAll(`.details-${changingIn}`);
    if(detailsHtml === ''){
        
        siblingElements.forEach((element)=>{
            element.innerHTML = '';
        });
        detailsElement.innerHTML = html;
        return true;
    }else{
        detailsElement.innerHTML = ''
        changingIn = false;
        return false;
    }
}
/*------------------------------ENd-----------------------*/


/*-----------Button Attributes to render------------*/
function renderButtonAttributes(myArray,changingIn){    
    /*-----------Render Save Button------------*/
    document.querySelectorAll('.details-save-button').forEach((saveButton)=>{
        saveButton.addEventListener('click', async ()=>{
            const id = saveButton.dataset.id;
            const inputElement1 = document.querySelector(`.details-input-${id}-1`);
            const value1 = inputElement1.value;
            const inputElement2 = document.querySelector(`.details-input-${id}-2`);
            const value2 = inputElement2.value;
            
            let matchingIndex;
            let matchingObject;
            let selfIndex;
            let selfObject
            
            let property2;
            if(changingIn === 'op'){
                property2 = 'date';
            }else{
                property2 = 'patt';
            }
            
            myArray.forEach((object,index)=>{
                if(object.id !== id && object.name === value1){
                    matchingIndex = index;
                    matchingObject = object;
                }
                if(object.id === id){
                    selfIndex = index;
                    selfObject = object;
                }
            });
            
            if(Number(matchingIndex) >= 0){
                const warningMatter = 'Value already exists do u want to shift the value'
                const response = await warningPopUp(warningMatter);
                if(response === 'Yes'){
                    myArray.splice(selfIndex,0,matchingObject);
                    matchingIndex++;
                    myArray.splice(matchingIndex,1);
                    await myFire.updateGtData(gtSelected,mainArray)
                    renderAfterChanges(myArray,changingIn,id);
                }
           }else if(selfObject.name !== value1 || selfObject[property2] !== value2){
               const response = await warningPopUp();
                if(response === 'Yes'){
                    selfObject.name = value1;
                    selfObject[property2] = value2
                    await myFire.updateGtData(gtSelected,mainArray)
                    renderAfterChanges(myArray,changingIn,id);
                }
           }
            
        });
    });
    /*----------------------End--------------------------*/

    document.querySelectorAll('.details-delete-button').forEach((deleteButton)=>{
        deleteButton.addEventListener('click', async ()=>{
            
            const response = await warningPopUp();
                if(response === 'Yes'){
                    const id = deleteButton.dataset.id;
                    let myIndex;
                    myArray.forEach((object,index)=>{
                        if(object.id === id){
                            myIndex = index
                        }
                    }); 
                    
                    myArray.splice(myIndex,1);
                    await myFire.updateGtData(gtSelected,mainArray)
                    alert('Element deleted');
                    renderAfterChanges(myArray,changingIn,id)
                }
        });
    });

}
/*------------------------------ENd-----------------------*/

function renderAfterChanges(myArray,changingIn,id){
    const idSplitArray = id.split("-");
    if(changingIn === 'main'){
        const displayElement = document.querySelector('.render-selected');
        renderMainComponents(displayElement);
    }else if (changingIn === 'sub'){
        const mainId = `${idSplitArray[0]}-${idSplitArray[1]}`;
        document.querySelector(`.details-main-${mainId}`).innerHTML = '';
        renderSubComponents(mainId,myArray)
    }else if(changingIn === 'op'){
        const subId = `${idSplitArray[0]}-${idSplitArray[1]}-${idSplitArray[2]}-${idSplitArray[3]}`;
        document.querySelector(`.details-sub-${subId}`).innerHTML = '';
        renderOp(subId,myArray)
    }
 }


function convertToDate() {
    document.querySelectorAll('.details-input-2-op').forEach((input)=>{
        input.readOnly = true;
        input.addEventListener('click',async ()=>{
            const id = input.dataset.id;
            let selectedDate = await activateHiddenDateInput(input);
            input.value = selectedDate;
        });
    });
}
