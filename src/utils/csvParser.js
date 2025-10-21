import Papa from 'papaparse';

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedCards = results.data.map((row, idx) => ({
          ...row,
          id: `${Date.now()}-${idx}`
        }));
        resolve(parsedCards);
      },
      error: (error) => reject(error)
    });
  });
};
