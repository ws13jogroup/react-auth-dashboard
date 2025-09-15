import { useMemo } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function Dashboard() {
  // Dati più realistici per fatturato (trend crescente con fluttuazioni)
  const revenueData = useMemo(() => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    
    // Simuliamo un trend di crescita con alcune fluttuazioni stagionali
    const baseRevenue = [
      25000, 28000, 32000, 30000, 35000, 42000, // Q1-Q2
      45000, 48000, 44000, 52000, 58000, 65000  // Q3-Q4 (stagione alta)
    ]
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Fatturato (€)',
          data: baseRevenue,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4 // Linea più morbida
        }
      ]
    }
  }, [])

  // Dati per nuovi utenti (crescita più irregolare)
  const usersData = useMemo(() => {
    const monthsShort = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu']
    
    const newUsers = [120, 95, 180, 220, 165, 280]
    
    return {
      labels: monthsShort,
      datasets: [
        {
          label: 'Nuovi Utenti',
          data: newUsers,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }
      ]
    }
  }, [])

  // Statistiche riassuntive calcolate dai dati
  const stats = useMemo(() => {
    const totalRevenue = revenueData.datasets[0].data.reduce((sum, value) => sum + value, 0)
    const avgMonthlyRevenue = Math.round(totalRevenue / 12)
    const totalUsers = usersData.datasets[0].data.reduce((sum, value) => sum + value, 0)
    const avgMonthlyUsers = Math.round(totalUsers / 6)
    
    return {
      totalRevenue: totalRevenue.toLocaleString('it-IT'),
      avgMonthlyRevenue: avgMonthlyRevenue.toLocaleString('it-IT'),
      totalUsers,
      avgMonthlyUsers
    }
  }, [revenueData, usersData])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Andamento Business'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      {/* Sezione statistiche riassuntive */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Fatturato Totale</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>€{stats.totalRevenue}</p>
        </div>
        <div className="stat-card" style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Media Mensile</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>€{stats.avgMonthlyRevenue}</p>
        </div>
        <div className="stat-card" style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Utenti Totali</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>{stats.totalUsers}</p>
        </div>
        <div className="stat-card" style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Media Utenti/Mese</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6f42c1' }}>{stats.avgMonthlyUsers}</p>
        </div>
      </div>

      {/* Grafici */}
      <div className="grid">
        <div className="panel">
          <h2>Fatturato Annuale (€)</h2>
          <Line options={chartOptions} data={revenueData} />
        </div>
        <div className="panel">
          <h2>Nuovi Utenti (Primo Semestre)</h2>
          <Bar options={chartOptions} data={usersData} />
        </div>
      </div>
    </div>
  )
}