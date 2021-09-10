let quantity = document.querySelector("#quantity")
let form = document.querySelector('#form')
console.log('hello world')
form.addEventListener('submit',(e)=>{
    e.preventDefault()
    fetch('/stock.json')
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(data => {
   console.log(data)
 
    console.log('data loaded')
})
.catch(function () {
    this.dataError = true;
})

})

 

  
