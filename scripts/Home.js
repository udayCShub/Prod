import {gtDropDown,mainDropDown,warningPopUp,updateDataAttribute,dateFormat,toYYYYMMDD,activateHiddenDateInput,setId} from "./Common script.js";
import {myFire} from "./Firebase data.js";

gtDropDown('gt-select-inHome');

const gtSelectElement = document.querySelector(".gt-select-inHome");
const mainSelectElement = document.querySelector(".update-main-select");
const subSelectElement = document.querySelector(".update-sub-select");
const renderOpElement = document.querySelector('.js-renderOp');
const optionsSelectedElement = document.querySelector('.viewIn-selection');

gtSelectElement.onchange = async ()=>{
    renderOpElement.innerHTML = "";
    optionsSelectedElement.innerHTML = "";
    mainSelectElement.dataset.componentId = "";
    
    let gtOptionSelected = gtSelectElement.value;
    mainDropDown (gtOptionSelected, 'update-main-select');
}

/*-----------sub dropDown after selecting main------------*/
mainSelectElement.addEventListener("change", async ()=> {
    renderOpElement.innerHTML = "";
    optionsSelectedElement.innerHTML = "";
    subSelectElement.dataset.componentId = "";
    
    const gtOptionSelected = gtSelectElement.value;
    const mainArray = await myFire.getMainArray(gtOptionSelected);
    
    updateDataAttribute(mainSelectElement)
    const mainComponentId = mainSelectElement.dataset.componentId;
    
    subDropDown(mainArray,mainComponentId);
})
/*----------------------End--------------------------*/

function subDropDown(mainArray, mainComponentId) {
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
    
    subSelectElement.innerHTML = html;
}

subSelectElement.addEventListener("change", async ()=> {
    renderOpElement.innerHTML = "";
    optionsSelectedElement.innerHTML = "";
    
    updateDataAttribute(subSelectElement);
});

document.querySelector('.update-view-button').onclick = async ()=>{
    const gtOptionSelected = gtSelectElement.value;
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
    const mainComponentId = mainSelectElement.dataset.componentId;
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
    
    const subComponentId = subSelectElement.dataset.componentId;
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
    optionsSelectedElement.innerHTML = html;
    
    renderOpHtml(gtOptionSelected,mainArray,opArray);
}

/*--------------renderOP html creation-----------*/
function renderOpHtml(gtSelected,mainArray,opArray) {
    const viewElement = document.querySelector('.opView');
    
    let html='';
    opArray.forEach((object) => {
        html += `
            <div class= "branch-div op-div-${object.id}">
                <div class= "branch-list-opDetails">  
                    <div class= "branch-list-opCheck">      
                        <input type="checkbox" class="checkbox-element checkbox-${object.id}" data-op-id = ${object.id}>
                        <input class="op-value op-value-${object.id}" value="${object.name}" readonly>
                        <button class="add-button add-button-${object.id}" data-op-id = ${object.id}>+</button>
                    </div>
                    <div class= "branch-list-dates"> 
                        <input class="date-input date-from-${object.id}" data-op-id = ${object.id} data-change-what="from" value = "${object.from}" readonly>
                        <input class="date-input date-to-${object.id}" data-op-id = ${object.id} data-change-what="to" value = "${object.to}" readonly>
                    </div>
                </div>
            </div>
            <div class="branch-div newOp-div-${object.id} newOp-div" style="display: none;">
            </div>
        `;
    });
    
    viewElement.innerHTML = html;
    
    document.querySelectorAll('.checkbox-element').forEach((chkbox)=>{
        const opId = chkbox.dataset.opId;
        const toDate = document.querySelector(`.date-to-${opId}`).value;
        const opNameInput = document.querySelector(`.op-value-${opId}`);
        const fromDate = document.querySelector(`.date-from-${opId}`).value;
        if(toDate){
            chkbox.checked = true;
            opNameInput.style.backgroundColor = "	lightgreen";
        }
        if(fromDate && !toDate){
            chkbox.type ="radio";
            chkbox.checked = true;
            opNameInput.style.backgroundColor = "	orange";
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
            
            const response = await warningPopUp();
            if(response === 'Yes'){
                let warningMatter;
                let changeWhat;
                if(!checkStatus){
                    checkElement.type = "radio";
                    checkElement.checked = true;
                    checkStatus = true;
                    changeWhat = "from";
                }else if(checkElement.type === "radio"){
                    checkElement.type = "checkbox";
                    checkElement.checked = true;
                    changeWhat = "to";
                }else{
                    return;
                }
                
                const opId = checkElement.dataset.opId;
                opArray.forEach((object)=>{
                    if(object.id === opId){
                        object[changeWhat] = getTodayDate();
                    }
                });
                
                await myFire.updateGtData(gtSelected,mainArray);
                renderOpHtml(gtSelected,mainArray,opArray);
            }
       });
    });
    
    document.querySelectorAll('.date-input').forEach((dateInputElement)=>{
        dateInputElement.addEventListener('click', async ()=>{
            const opId = dateInputElement.dataset.opId;
            const changeWhat = dateInputElement.dataset.changeWhat;
            const selectedDate  = await activateHiddenDateInput(dateInputElement);
            
            const response = await warningPopUp();
            if(response === 'Yes'){
                opArray.forEach((object)=>{
                    if(object.id === opId){
                        object[changeWhat] = selectedDate;
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
                <div class= "branch-list-opDetails">
                    <div class="branch-list-opCheck">            
                        <button class="close-newOp-button"> X </button>
                        <input class="op-value op-value-${newOpId}" placeholder= "Type New Op">
                        <button class="newOp-save-button newOp-save-button-${newOpId}" data-op-id = ${newOpId}>Save</button>
                    </div>
                </div>
            `;
            newOpDiv.style.display = "grid";
            
            document.querySelector('.newOp-save-button').onclick = async ()=>{
                const newOpInputElement = document.querySelector(`.op-value-${newOpId}`);
                const newOpValue = newOpInputElement.value;
                
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
                        from: "",
                        to: ""
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