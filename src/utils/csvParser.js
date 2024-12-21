export const parseCSV = (data) => {
  try {
    const rows = data.split('\n');
    const headers = rows[0].split(',').map(header => header.trim());
    
    const parsedData = rows.slice(1)
      .filter(row => row.trim()) // Remove empty rows
      .map(row => {
        const values = row.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index]?.trim() || '';
          return obj;
        }, {});
      });

    return {
      headers,
      data: parsedData
    };
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error('Failed to parse CSV data');
  }
}; 