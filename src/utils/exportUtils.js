// CSV export utility for reports and data tables

export function exportToCSV(filename, data, headers = null) {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // If explicit headers array of { key, label } is provided
  let headerKeys = [];
  let headerLabels = [];

  if (headers && headers.length) {
    headerKeys = headers.map(h => h.key);
    headerLabels = headers.map(h => h.label);
  } else {
    // Infer keys from first object
    headerKeys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object');
    headerLabels = headerKeys.map(k => k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
  }

  const csvRows = [];
  // Add header row
  csvRows.push(headerLabels.map(escapeCSVField).join(','));

  // Add data rows
  for (const row of data) {
    const values = headerKeys.map(key => {
      let val = row[key];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') {
        val = JSON.stringify(val);
      }
      return escapeCSVField(String(val));
    });
    csvRows.push(values.join(','));
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filename}_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSVField(field) {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function exportJSON(filename, data) {
  const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', jsonContent);
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filename}_${timestamp}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
