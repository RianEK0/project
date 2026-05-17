import { Chart } from 'react-google-charts';

const AttendanceChart = ({ rows = [] }) => {
  const data = [
    ['Tanggal', 'Jumlah Hadir'],
    ...rows.map((item) => [item.date, item.count]),
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3>Grafik Kehadiran</h3>
          <p className="muted-text">Tren 7 hari terakhir</p>
        </div>
      </div>
      <Chart
        chartType="AreaChart"
        width="100%"
        height="280px"
        data={data}
        options={{
          legend: 'none',
          colors: ['#0f766e'],
          backgroundColor: 'transparent',
          chartArea: { left: 50, top: 20, width: '85%', height: '70%' },
          hAxis: { textStyle: { color: '#64748b' } },
          vAxis: { minValue: 0, textStyle: { color: '#64748b' } },
          areaOpacity: 0.18,
        }}
      />
    </div>
  );
};

export default AttendanceChart;
