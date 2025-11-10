import axios from 'axios';

async function testCityAPI() {
  try {
    // Test the city data API directly
    const response = await axios.get('http://localhost:3001/api/cities/6/data');
    console.log('API Response:');
    console.log('Grid State Type:', typeof response.data.gridState);
    console.log('Grid State is Array:', Array.isArray(response.data.gridState));
    console.log('Grid State Length:', Array.isArray(response.data.gridState) ? response.data.gridState.length : 'N/A');
    console.log('Building Log Type:', typeof response.data.buildingLog);
    console.log('Building Log is Array:', Array.isArray(response.data.buildingLog));
    console.log('Building Log Length:', Array.isArray(response.data.buildingLog) ? response.data.buildingLog.length : 'N/A');
    
    if (Array.isArray(response.data.gridState)) {
      const occupiedCells = response.data.gridState.filter(cell => Array.isArray(cell) && cell.length > 0);
      console.log('Occupied Cells:', occupiedCells.length);
      console.log('First few occupied cells:', occupiedCells.slice(0, 3));
    }
    
  } catch (error) {
    console.error('Error testing city API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testCityAPI();