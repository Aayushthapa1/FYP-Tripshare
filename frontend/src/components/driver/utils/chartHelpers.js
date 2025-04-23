// Prepare Chart.js data for trips over time
export function prepareTripsOverTimeChartData(tripsOverTime) {
    if (!tripsOverTime || tripsOverTime.length === 0) return null

    const labels = tripsOverTime.map((item) => item._id)
    const tripCounts = tripsOverTime.map((item) => item.count)
    const revenues = tripsOverTime.map((item) => item.revenue)

    return {
        labels,
        datasets: [
            {
                label: "Trip Count",
                data: tripCounts,
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
                yAxisID: "y",
            },
            {
                label: "Revenue (Rs.)",
                data: revenues,
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.5)",
                yAxisID: "y1",
            },
        ],
    }
}

// Prepare Chart.js options for trips over time
export const tripsOverTimeOptions = {
    responsive: true,
    interaction: {
        mode: "index",
        intersect: false,
    },
    stacked: false,
    scales: {
        y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
                display: true,
                text: "Trip Count",
            },
        },
        y1: {
            type: "linear",
            display: true,
            position: "right",
            grid: {
                drawOnChartArea: false,
            },
            title: {
                display: true,
                text: "Revenue (Rs.)",
            },
        },
    },
}

// Prepare Chart.js data for popular routes
export function preparePopularRoutesChartData(popularRoutes) {
    if (!popularRoutes || popularRoutes.length === 0) return null

    // Take top 5 for chart display
    const topRoutes = popularRoutes.slice(0, 5)

    return {
        labels: topRoutes.map((route) => `${route._id.from} to ${route._id.to}`),
        datasets: [
            {
                label: "Trip Count",
                data: topRoutes.map((route) => route.count),
                backgroundColor: [
                    "rgba(255, 99, 132, 0.5)",
                    "rgba(54, 162, 235, 0.5)",
                    "rgba(255, 206, 86, 0.5)",
                    "rgba(75, 192, 192, 0.5)",
                    "rgba(153, 102, 255, 0.5)",
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                ],
                borderWidth: 1,
            },
        ],
    }
}

// Prepare Chart.js data for trip status distribution
export function prepareTripStatusChartData(tripStatusDistribution) {
    if (!tripStatusDistribution || tripStatusDistribution.length === 0) return null

    const statusColors = {
        Completed: { bg: "rgba(75, 192, 192, 0.5)", border: "rgb(75, 192, 192)" },
        Cancelled: { bg: "rgba(255, 99, 132, 0.5)", border: "rgb(255, 99, 132)" },
        "In Progress": {
            bg: "rgba(54, 162, 235, 0.5)",
            border: "rgb(54, 162, 235)",
        },
        Scheduled: { bg: "rgba(255, 206, 86, 0.5)", border: "rgb(255, 206, 86)" },
        default: { bg: "rgba(153, 102, 255, 0.5)", border: "rgb(153, 102, 255)" },
    }

    const getStatusColor = (status, type) => {
        return (statusColors[status] || statusColors.default)[type]
    }

    return {
        labels: tripStatusDistribution.map((status) => status._id),
        datasets: [
            {
                data: tripStatusDistribution.map((status) => status.count),
                backgroundColor: tripStatusDistribution.map((status) => getStatusColor(status._id, "bg")),
                borderColor: tripStatusDistribution.map((status) => getStatusColor(status._id, "border")),
                borderWidth: 1,
            },
        ],
    }
}
