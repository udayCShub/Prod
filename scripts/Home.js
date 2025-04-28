import {gtDropDown,mainDropDown,warningPopUp,updateDataAttribute,dateFormat,toYYYYMMDD,activateHiddenDateInput,setId} from "./Common script.js";
import {myFire} from "./Firebase data.js";

gtDropDown('gt-select-inHome');

document.querySelector('.gt-select-inHome').onchange = async ()=>{
    let gtOptionSelected = document.querySelector('.gt-select-inHome').value;
    mainDropDown (gtOptionSelected, 'update-main-select');
    document.querySelector('.js-renderOp').innerHTML = "";
}

/*-----------sub dropDown after selecting main------------*/
document.querySelector(".update-main-select").addEventListener("change", async ()=> {
    const gtOptionSelected = document.querySelector('.gt-select-inHome').value;
    const mainArray = await myFire.getMainArray(gtOptionSelected);

    const mainSelectionElement = document.querySelector(".update-main-select");
    updateDataAttribute(mainSelectionElement)
    const mainComponentId = mainSelectionElement.dataset.componentId;
    
    subDropDown(mainArray,mainComponentId);
})
/*----------------------End--------------------------*/

function subDropDown(mainArray, mainComponentId) {
    const subElement = document.querySelector('.update-sub-select');
    
    let subArray;
    mainArray.forEach((object)=>{
        if(object.id === mainComponentId){
            subArray = object.subComponent;
        }
    });
    
    let html = `<option data-component-id = "">Select Sub</option>`;
    subArray.forEach((object)=>{
        html += `<option data-component-id = ${object.id}>${object.name}</option>`
    });
    
    subElement.innerHTML = html;
}

document.querySelector(".update-sub-select").addEventListener("change", async ()=> {
    const subSelectionElement = document.querySelector(".update-sub-select");
    updateDataAttribute(subSelectionElement);
});

document.querySelector('.update-view-button').onclick = async ()=>{
    const gtOptionSelected = document.querySelector('.gt-select-inHome').value;
    const gtArray = await myFire.getGtArray();
    
    let gtCount=0;
    gtArray.forEach((value)=>{
        if(value === gtOptionSelected){
            gtCount++;
        }
    });
    
    if(!gtCount){
        alert("Select a GT");
        return;
    }
    
    const mainArray = await myFire.getMainArray(gtOptionSelected);
    const mainComponentId = document.querySelector('.update-main-select').dataset.componentId;
    let mainComponentSelected;
    let mainCount=0;
    let subArray;
    mainArray.forEach((object)=>{
       if(object.id === mainComponentId){
           mainCount++;
           mainComponentSelected = object.name;
           subArray = object.subComponent;
       }
    });
    if(!mainCount){
        alert("Select a Main Component");
        return;
    }
    
    const subComponentId = document.querySelector('.update-sub-select').dataset.componentId;
    let subComponentSelected;
    let subCount=0;
    let opArray;
    subArray.forEach((object)=>{
        if(object.id === subComponentId){
            subCount++;
            subComponentSelected = object.name;
            opArray = object.op;
        }
    });
    if(!subCount){
        alert("Select a Sub Component");
        return;
    }
    const html = `
        <span class="view-in-options viewIn-sub" data-sub-id = ${subComponentId}>${subComponentSelected}</span>
        <span class= "arrow">&lArr;</span>
        <span class="view-in-options viewIn-main" data-main-id = ${mainComponentId}>${mainComponentSelected}</span>
        <span class= "arrow">&lArr;</span>
        <span class="view-in-options viewIn-gt">${gtOptionSelected}</span>
    `;
    
    document.querySelector('.viewIn-selection').innerHTML = html;

    
    renderOpHtml(gtOptionSelected,mainArray,opArray);
}

/*--------------renderOP html creation-----------*/
function renderOpHtml(gtSelected,mainArray,opArray) {
    const viewElement = document.querySelector('.opView');
    
    let html='';
    opArray.forEach((object) => {
        html += `
            <div class= "branch-div op-div-${object.id}">
                <div class= "branch-list-div"> 
                    <input type="checkbox" class="checkbox-element checkbox-${object.id}" data-op-id = ${object.id}>
                    <input class="op-value op-value-${object.id}" value="${object.name}" readonly>
                    <input class="date-input date-input-${object.id}" data-op-id = ${object.id} value = "${object.date}">
                    <button class="add-button add-button-${object.id}" data-op-id = ${object.id}>+</button>
                </div>
            </div>
            <div class="branch-div newOp-div-${object.id} newOp-div" style="display: none;">
            </div>
        `;
    });
    
    viewElement.innerHTML = html;
    
    document.querySelectorAll('.checkbox-element').forEach((chkbox)=>{
       const opId = chkbox.dataset.opId;
        const dateElement = document.querySelector(`.date-input-${opId}`);
        const dateValue = dateElement.value;
        const opNameInput = document.querySelector(`.op-value-${opId}`);
        if(dateValue){
            chkbox.checked = true;
            opNameInput.style.backgroundColor = "	lightgreen";
        }
    });
    setOpButtonAttributes(gtSelected,mainArray,opArray);
}
/*-----------------------End--------------------------*/

function setOpButtonAttributes(gtSelected,mainArray,opArray){
    document.querySelectorAll('.checkbox-element').forEach((checkElement)=>{
        let checkStatus = checkElement.checked;
        checkElement.addEventListener('click', async () => {
            checkElement.checked = checkStatus;
                        
            let warningMatter;
            let opDate;
            if(checkStatus){
                opDate = "";
                warningMatter = "Date will be removed and work is Unchecked";
            }else{
                opDate = getTodayDate();
                warningMatter = "Do You want to Submit today date";
            }
            
            const response = await warningPopUp(warningMatter);
            if(response === 'Yes'){
                const opId = checkElement.dataset.opId;
                opArray.forEach((object)=>{
                    if(object.id === opId){
                        object.date = opDate;
                    }
                });
                
                await myFire.updateGtData(gtSelected,mainArray);
                renderOpHtml(gtSelected,mainArray,opArray);
            }
            
       });
    });
    
    document.querySelectorAll('.date-input').forEach((dateInputElement)=>{
        dateInputElement.readOnly = true;
        dateInputElement.addEventListener('click', async ()=>{
            const opId = dateInputElement.dataset.opId;
            const selectedDate  = await activateHiddenDateInput(dateInputElement);
            const response = await warningPopUp();
            if(response === 'Yes'){
                
                opArray.forEach((object)=>{
                    if(object.id === opId){
                        object.date = selectedDate;
                    }
                });
                    
                await myFire.updateGtData(gtSelected,mainArray);
                renderOpHtml(gtSelected,mainArray,opArray);
            }
        });
    });
    
    document.querySelectorAll('.add-button').forEach((addButton)=>{
        addButton.addEventListener('click', async ()=>{
            document.querySelectorAll('.newOp-div').forEach((element)=>{
                element.innerHTML = "";
                element.style.display = "none";
            });
            
            const opId = addButton.dataset.opId;
            const subId = document.querySelector('.viewIn-sub').dataset.subId;
            const rNum = setId(opArray);
            const newOpId = `${subId}-op-${rNum}`
            
            const newOpDiv = document.querySelector(`.newOp-div-${opId}`);
            newOpDiv.innerHTML = `
                <div class= "branch-list-div"> 
                    <button class="close-newOp-button"> X </button>
                    <input for="checkbox-${newOpId}" class="op-value op-value-${newOpId}" placeholder= "Type New Op">
                    <input type = "date" class="date-input newOp-date-input date-input-${newOpId}" data-op-id = ${newOpId}>
                    <button class="newOp-save-button newOp-save-button-${newOpId}" data-op-id = ${newOpId}>Save</button>
                </div>
            `;
            newOpDiv.style.display = "grid";
            
            document.querySelector('.newOp-save-button').onclick = async ()=>{
                const newOpInputElement = document.querySelector(`.op-value-${newOpId}`);
                const newOpValue = newOpInputElement.value;
                
                const newOpDateElement = document.querySelector(`.date-input-${newOpId}`);
                let newDateValue = newOpDateElement.value;
                newDateValue = dateFormat(newDateValue);
                
                if(!newOpValue){
                    alert("Type a New Op name");
                    return;
                }
                
                const response = await warningPopUp();
                if(response === 'Yes'){
                    const newOpObject = {
                        rNum,
                        id: newOpId,
                        name: newOpValue,
                        date: newDateValue
                    }
                    
                    let matchingIndex;
                    opArray.forEach((object,index)=>{
                        if(object.id === opId){
                            matchingIndex = index;
                        }
                    });
                    matchingIndex++;
                    opArray.splice(matchingIndex,0,newOpObject);
                    await myFire.updateGtData(gtSelected,mainArray);
                    renderOpHtml(gtSelected,mainArray,opArray);
                }
            }
            
            document.querySelector(".close-newOp-button").onclick = ()=>{
                document.querySelectorAll(".newOp-div").forEach((element)=>{
                    element.innerHTML = "";
                    element.style.display = "none";
                })
            }
        });
    });
}

function getTodayDate(){
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = today.toLocaleString('en', { month: 'short' });
    const year = today.getFullYear();
    
    const formattedDate = `${day} ${month} ${year}`;
    return formattedDate;
}