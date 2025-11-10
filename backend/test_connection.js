const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const connectionString = process.env.PSQLDB_CONNECTIONSTRING;
console.log(' Connection string từ .env:');
if (connectionString) {
  const match = connectionString.match(/@([^\/]+)/);
  console.log('   Host:', match ? match[1] : 'N/A');
  console.log('   Database:', connectionString.match(/\/([^?]+)/)?.[1] || 'N/A');
  
  const pool = new Pool({ connectionString });
  pool.query('SELECT current_database(), inet_server_addr(), version()')
    .then(r => {
      console.log(' Backend đang kết nối đến:');
      console.log('   Database:', r.rows[0].current_database);
      console.log('   Server IP:', r.rows[0].inet_server_addr || 'N/A');
      console.log('   Version:', r.rows[0].version.split(' ')[0] + ' ' + r.rows[0].version.split(' ')[1]);
      
      return pool.query('SELECT COUNT(*) as count FROM \"LogisticsCompany\"');
    })
    .then(r => {
      console.log('   Số công ty trong database:', r.rows[0].count);
      pool.end();
    })
    .catch(e => {
      console.error(' Error:', e.message);
      process.exit(1);
    });
} else {
  console.log(' Không tìm thấy PSQLDB_CONNECTIONSTRING');
  process.exit(1);
}
