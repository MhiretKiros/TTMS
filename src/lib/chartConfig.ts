export const chartConfig = {
    areaChart: {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Series 1',
                    data: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    },
    pieChart: {
        type: 'pie',
        data: {
            labels: ['Engineering', 'Management', 'Economics', 'Marketing', 'Others'],
            datasets: [
                {
                    data: [14.8, 4.9, 2.6, 1.5, 5.5],
                    backgroundColor: ['#4CAF50', '#FF9800', '#F44336', '#2196F3', '#9C27B0'],
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            return `${context.label}: ${context.raw} %`
                        },
                    },
                },
            },
        },
    },
}