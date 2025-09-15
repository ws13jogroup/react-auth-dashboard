import { useMemo } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function Dashboard() {
  // dati finti per esempio
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

  const revenueData = useMemo(() => ({
    labels: months,
    datasets: [
      { label: 'Fatturato', data: months.map(() => rand(10_000, 60_000)), borderWidth: 2, fill: false }
    ]
  }), [])

  const usersData = useMemo(() => ({
    labels: months.slice(0, 6),
    datasets: [
      { label: 'Nuovi utenti', data: months.slice(0, 6).map(() => rand(100, 800)) }
    ]
  }), [])

  const options = { responsive: true, plugins: { legend: { position: 'top' } } }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div className="grid">
        <div className="panel">
          <h2>Fatturato (Linea)</h2>
          <Line options={options} data={revenueData} />
        </div>
        <div className="panel">
          <h2>Nuovi utenti (Barre)</h2>
          <Bar options={options} data={usersData} />
        </div>
      </div>
    </div>
  )
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
