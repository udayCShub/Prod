import {myFire} from "./Firebase data.js";

/*------GT drop down----------*/
export async function gtDropDown(elementClass){
    let html = '<option>Select GT</option>';
    const gtArray = await myFire.getGtArray();
    gtArray.forEach((value)=>{
        html += `<option>${value}</option>`
    });
    document.querySelector(`.${elementClass}`).innerHTML = html;
}
/*-------------------End--------------------*/

/*------main component drop down----------*/
export async function mainDropDown (gtSelected, elementClass) {
    const gtArray = await myFire.getGtArray();
    let count=0;
    gtArray.forEach((value)=>{
        if(value === gtSelected){
            count++;
        }
    });
    
    let html='<option data-component-id = "">Select Main</option>';
    if(count){
        const mainArray = await myFire.getMainArray(gtSelected);
        
        mainArray.forEach((object)=>{
            html += `<option data-component-id = ${object.id}>${object.name}</option>`
        });
    }
    document.querySelector(`.${elementClass}`).innerHTML = html;
}
/*-------------------End--------------------*/

/*------sub drop down----------*/
export function subDropDown(mainArray,mainComponentId,subElement) {
    let mainIndex;
    mainArray.forEach((object,index)=>{
        if(mainComponentId === object.id){
            mainIndex=index;
        }
    });
    let html = `<option data-component-id = "">Select Sub</option>`;
    mainArray[mainIndex].subComponent.forEach((object)=>{
        html += `<option data-component-id = ${object.id}>${object.name}</option>`
    });

    subElement.innerHTML = html;
}
/*-------------------End--------------------*/

/*------warning pop up----------*/
export function warningPopUp(warningMatter) {
    
    return new Promise((resolve) => {
        if(warningMatter){
            document.querySelector('.warning-matter').innerText = warningMatter;
        }else{
            document.querySelector('.warning-matter').innerText = 'Are You Sure?';
        }
        
        document.querySelector('.warning-popUp').style.display = 'grid';

        document.querySelector('.warning-yes-button').onclick = () => {
            document.querySelector('.warning-popUp').style.display = 'none';
            resolve('Yes');
        };

        document.querySelector('.warning-no-button').onclick = () => {
            document.querySelector('.warning-popUp').style.display = 'none';
            resolve('No');
        }
    });
}
/*-------------------End--------------------*/


export function updateDataAttribute(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const componentId = selectedOption.dataset.componentId;
    selectElement.setAttribute('data-component-id', componentId);
}


export function dateFormat(inputDate){
    const date = new Date(inputDate);
    
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    let formattedDate = date.toLocaleDateString('en-GB', options);
    if(formattedDate === 'Invalid Date'){
        formattedDate = inputDate;
    }
    return formattedDate;
}

export function setId (myArray){
    let rNumArray = [];
    myArray.forEach((object)=>{
        rNumArray.push(object.rNum)
    });
    
    let matching;
    let rNum;
    while(matching !== 'No'){
        matching=0;
        rNum = Math.floor(Math.random() * 100) + 1;
        rNumArray.forEach((num)=>{
            if(rNum === num){
                matching++;
            }
        })
        if(matching == 0){
            matching = 'No'
        }
    }
    return rNum;
}

function initiateWait(){
    
}