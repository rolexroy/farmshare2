$(document).ready(function() {
    $('#modal-btn').click(()=>{
        $("#exampleModal").modal();
    })
    
});

var ctx = document.getElementById('chart').getContext('2d');
let xlabels = []
let ydata =[]


var myChart = new Chart(ctx, {
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

getData()

async function getData (){
    const response = await fetch('/farmer-statistics.json')
    const data = await response.json()

    data.forEach(element => {
        xlabels.push(element.Month)
        ydata.push(element.Number)
       
        
       
    });

    console.log(data)
}