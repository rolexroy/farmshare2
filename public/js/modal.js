const updateBtn = document.querySelector('.update')

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

salesChart()
let xlabel = []
let ylabel =[]

async function salesChart(){
    await getSalesData()
    var ctx = document.getElementById('sales-chart').getContext('2d');
    var chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: xlabel,
        datasets: [{
            label: 'Daily Sales',
            data: ylabel,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

}

async function getSalesData(){
    const response = await fetch('/payment.json')
    const data = await response.json()

    data.forEach(element => {
        let day = new Date(element.Dates)
       
        xlabel.push(day.getDate())
        ylabel.push(element.payment)
       
        
       
    });

}



updateBtn.addEventListener('click',()=>{
    chart.data.datasets[0].data = [5, 8, 9, 10, 11, 12]

    chart.update()
    
})