const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./travel.db');

console.log('Testing database connection...');

db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
        console.error('Error querying users:', err.message);
        process.exit(1);
    }
    console.log('Users count:', row.count);

    db.all('SELECT * FROM users', (err, users) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            process.exit(1);
        }
        console.log('Users:', JSON.stringify(users, null, 2));

        db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, admin) => {
            if (err) {
                console.error('Error finding admin:', err.message);
                process.exit(1);
            }
            console.log('Admin user:', admin);

            if (admin) {
                const isMatch = bcrypt.compareSync('admin2024', admin.password);
                console.log('Admin password valid:', isMatch);
                console.log('Admin userId:', admin.id);
            }

            db.close();
            console.log('Database test completed!');
        });
    });
});
