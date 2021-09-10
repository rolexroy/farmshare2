

$(document).ready(function() {
    $('#modal-btn').click(()=>{
        $("#exampleModal").modal();
    })
    
});

let xlabels = []
let ydata =[]



chartIt()

async function chartIt(){
    await getData()
    const ctx = document.getElementById('chart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xlabels,
            datasets: [{
                label: '# of Onboarded Farmers 2020',
                data:ydata,
                fill:false,
                borderColor:'#436A28'
               
              
            }      
        ]
        },
        options: {
           aspectRatio:4,       
            interaction: {
                mode: 'index',
                intersect: false,
              },
              scales: {
                y: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                },
               
              }
        }
    });
   
}









async function getData (){
    const response = await fetch('/farmers/statistics.json')
    const data = await response.json()

    data.forEach(element => {
        xlabels.push(element.Month)
        ydata.push(element.Number)
       
        
       
    });

   
}