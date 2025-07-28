import React, { useState, useRef, useEffect } from 'react';
import './SimpleChart.css';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const currentDay = currentDate.getDate();
const startYear = 2025; // Start from 2025
const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

const SimpleChart = () => {
  const [timeRange, setTimeRange] = useState('month'); // 'week' or 'month'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const canvasRef = useRef(null);
  
  // Generate monthly data for the selected year, filtering out future months
  const getMonthlyData = (year) => {
    return months
      .map((month, index) => ({
        name: month.substring(0, 3),
        value: Math.floor(Math.random() * 100) + 20,
        year: year.toString(),
        monthIndex: index
      }))
      .filter(item => {
        // If current year, only include months up to current month
        if (year === currentYear) {
          return item.monthIndex <= currentMonth;
        }
        // For previous years, include all months
        return true;
      });
  };

  // Generate weekly data for the selected month and year, filtering out future weeks
  const getWeeklyData = (monthIndex, year) => {
    // Calculate actual weeks in month
    const getWeeksInMonth = (month, year) => {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const used = firstDay.getDay() + lastDay.getDate();
      return Math.ceil(used / 7);
    };

    const weeksInMonth = getWeeksInMonth(monthIndex, year);
    const currentWeek = Math.ceil((currentDay + new Date(year, monthIndex, 1).getDay()) / 7);
    
    return Array.from({ length: weeksInMonth }, (_, i) => {
      const isFuture = 
        year > currentYear || 
        (year === currentYear && monthIndex > currentMonth) ||
        (year === currentYear && monthIndex === currentMonth && (i + 1) > currentWeek);
      
      return {
        name: `Week ${i + 1}`,
        value: isFuture ? 0 : Math.floor(Math.random() * 100) + 10,
        month: months[monthIndex].substring(0, 3),
        year: year.toString(),
        isFuture
      };
    });
  };
  
  const [monthlyData, setMonthlyData] = useState(getMonthlyData(selectedYear));
  const [weeklyData, setWeeklyData] = useState(getWeeklyData(selectedMonth, selectedYear));
  
  // Update data when month or year changes
  useEffect(() => {
    if (timeRange === 'week') {
      setWeeklyData(getWeeklyData(selectedMonth, selectedYear));
    } else {
      setMonthlyData(getMonthlyData(selectedYear));
    }
    
    // Reset selected month if it's in the future
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  }, [selectedMonth, selectedYear, timeRange, currentMonth, currentYear]);

  const data = timeRange === 'month' ? monthlyData : weeklyData;
  const maxValue = Math.max(...data.map(item => item.value));
  
  // Calculate chart dimensions based on viewport
  const getChartDimensions = () => ({
    width: Math.max(
      window.innerWidth * 0.9, // 90% of viewport width
      (timeRange === 'month' ? months.length : 4) * 60, // Min 60px per data point
      600 // Absolute minimum width
    ),
    height: Math.min(
      Math.max(window.innerHeight * 0.4, 250), // Between 40% of viewport height and 250px
      400 // Max height
    )
  });
  
  const [dimensions, setDimensions] = useState(getChartDimensions());
  
  // Update dimensions on window resize or time range change
  useEffect(() => {
    const handleResize = () => {
      setDimensions(getChartDimensions());
    };
    
    // Set initial dimensions
    handleResize();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [timeRange]);
  
  const chartWidth = dimensions.width;
  const chartHeight = dimensions.height;

  // Filter out future data points
  const filteredData = data.filter(item => {
    if (timeRange === 'month') {
      return true; // Already filtered in getMonthlyData
    } else {
      return !item.isFuture;
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set styles
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // If no data, don't draw anything
    if (filteredData.length === 0) return;
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (i * (height - 2 * padding)) / gridLines;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      // Draw Y-axis labels
      if (i < gridLines) {
        const value = Math.round((1 - i / gridLines) * maxValue);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(value, padding - 10, y + 4);
      }
    }
    
    // Calculate points
    const points = filteredData.map((item, index) => {
      const x = padding + (index * (width - 2 * padding)) / (filteredData.length - 1 || 1);
      const y = height - padding - ((item.value / maxValue) * (height - 2 * padding));
      return { x, y, ...item };
    });
    
    // Draw line
    if (points.length === 0) return;
    
    ctx.beginPath();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    
    ctx.stroke();
    
    // Draw points and labels
    points.forEach((point, index) => {
      // Draw point
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
      
      // Draw value label
      ctx.fillStyle = '#1e40af';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.value, point.x, point.y - 10);
      
      // Draw X-axis labels
      if (timeRange === 'month' || index % 2 === 0) {
        ctx.fillStyle = '#6b7280';
        const label = timeRange === 'month' 
          ? point.name 
          : `${point.name} ${point.month}`;
        ctx.fillText(
          label,
          point.x,
          height - padding / 2
        );
      }
    });
  }, [filteredData, maxValue, timeRange]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Site Analytics</h3>
        
        <div className="chart-controls">
          <div className="time-range-toggle">
            <button
              onClick={() => setTimeRange('week')}
              className={`toggle-btn ${timeRange === 'week' ? 'active' : ''}`}
            >
              Week View
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`toggle-btn ${timeRange === 'month' ? 'active' : ''}`}
            >
              Month View
            </button>
          </div>
          
          <div className="date-selector">
            {timeRange === 'month' ? (
              <>
                <label htmlFor="year-select">Year:</label>
                <select 
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label htmlFor="month-select">Month:</label>
                <select 
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
                
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas 
          ref={canvasRef} 
          width={chartWidth}
          height={chartHeight}
        />
      </div>
    </div>
  );
};

export default SimpleChart;
