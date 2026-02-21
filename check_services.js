fetch('http://localhost:3000/services')
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Error:', e));
