const argon2 = require('argon2');
const { pool, withTransaction } = require('./pool');
const MoneyService = require('../services/money');

async function seedDatabase() {
  console.log('🌱 Starting database seeding for India Hisaab...');
  const passwordHash = await argon2.hash('Password@123');

  await withTransaction(async (client) => {
    // 1. Create or get test users
    const usersData = [
      { name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+919876543210' },
      { name: 'Arjun Verma', email: 'arjun.verma@example.com', phone: '+919876543211' },
      { name: 'Rohit Mehta', email: 'rohit.mehta@example.com', phone: '+919876543212' },
      { name: 'Ananya Iyer', email: 'ananya.iyer@example.com', phone: '+919876543213' }
    ];

    const users = {};
    for (const u of usersData) {
      const res = await client.query(
        `INSERT INTO users (display_name, email_normalized, phone_e164, password_hash, preferred_currency)
         VALUES ($1, $2, $3, $4, 'INR')
         ON CONFLICT (email_normalized) 
         DO UPDATE SET display_name = EXCLUDED.display_name, password_hash = EXCLUDED.password_hash
         RETURNING id, display_name, email_normalized`,
        [u.name, u.email, u.phone, passwordHash]
      );
      users[u.email] = res.rows[0];
    }
    console.log(`✅ Seeded ${Object.keys(users).length} users.`);

    // 2. Create Goa Vacation Group
    const priya = users['priya.sharma@example.com'];
    const arjun = users['arjun.verma@example.com'];
    const rohit = users['rohit.mehta@example.com'];
    const ananya = users['ananya.iyer@example.com'];

    // Group 1: Goa Vacation 2026
    const goaRes = await client.query(
      `INSERT INTO groups (name, mode, base_currency, description, created_by)
       VALUES ('Goa Vacation 2026', 'trip', 'INR', 'Beach trip with friends, villa booking and dinners', $1)
       RETURNING id`,
      [priya.id]
    );
    const goaId = goaRes.rows[0].id;

    // Add members
    const goaMembers = [
      { id: priya.id, role: 'owner' },
      { id: arjun.id, role: 'member' },
      { id: rohit.id, role: 'member' },
      { id: ananya.id, role: 'member' }
    ];
    for (const m of goaMembers) {
      await client.query(
        `INSERT INTO group_members (group_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (group_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
        [goaId, m.id, m.role]
      );
    }

    // Helper to insert an expense with equal split
    async function addEqualExpense(groupId, creatorId, description, category, amountPaise, memberIds, expenseType = 'shared') {
      const expRes = await client.query(
        `INSERT INTO expenses (group_id, created_by, description, category, currency, total_minor, expense_type)
         VALUES ($1, $2, $3, $4, 'INR', $5, $6)
         RETURNING id`,
        [groupId, creatorId, description, category, amountPaise, expenseType]
      );
      const expenseId = expRes.rows[0].id;

      // Payer
      await client.query(
        `INSERT INTO expense_payers (expense_id, user_id, amount_minor)
         VALUES ($1, $2, $3)`,
        [expenseId, creatorId, amountPaise]
      );

      // Splits
      if (expenseType === 'family_contribution') {
        await client.query(
          `INSERT INTO expense_splits (expense_id, user_id, share_minor, split_method)
           VALUES ($1, $2, $3, 'custom')`,
          [expenseId, creatorId, amountPaise]
        );
      } else {
        const splits = MoneyService.calculateEqualSplit(BigInt(amountPaise), memberIds);
        for (const s of splits) {
          await client.query(
            `INSERT INTO expense_splits (expense_id, user_id, share_minor, split_method)
             VALUES ($1, $2, $3, 'equal')`,
            [expenseId, s.userId, s.shareMinor.toString()]
          );
        }
      }
    }

    const goaMemberIds = [priya.id, arjun.id, rohit.id, ananya.id];
    await addEqualExpense(goaId, priya.id, 'Private Beach Villa (3 Nights)', 'travel', '2400000', goaMemberIds);
    await addEqualExpense(goaId, arjun.id, 'Dinner at Thalassa & Drinks', 'food', '560000', goaMemberIds);
    await addEqualExpense(goaId, rohit.id, 'Scooty Rentals & Fuel', 'travel', '280000', goaMemberIds);
    await addEqualExpense(goaId, ananya.id, 'Breakfast & Café Coffee', 'food', '160000', goaMemberIds);
    console.log('✅ Seeded Goa Vacation 2026 group with 4 expenses & splits.');

    // Group 2: Flat 402 - Indiranagar
    const flatRes = await client.query(
      `INSERT INTO groups (name, mode, base_currency, description, created_by)
       VALUES ('Flat 402 - Indiranagar', 'flat', 'INR', 'Apartment bills, rent & groceries', $1)
       RETURNING id`,
      [priya.id]
    );
    const flatId = flatRes.rows[0].id;

    for (const m of [{ id: priya.id, role: 'owner' }, { id: ananya.id, role: 'member' }]) {
      await client.query(
        `INSERT INTO group_members (group_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (group_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
        [flatId, m.id, m.role]
      );
    }
    await addEqualExpense(flatId, priya.id, 'ACT Fiber High-Speed WiFi', 'utilities', '149900', [priya.id, ananya.id]);
    await addEqualExpense(flatId, ananya.id, 'Groceries & House Essentials', 'groceries', '235000', [priya.id, ananya.id]);
    console.log('✅ Seeded Flat 402 group with expenses.');

    // Group 3: Sharma Parivar (Family Mode)
    const familyRes = await client.query(
      `INSERT INTO groups (name, mode, base_currency, description, created_by)
       VALUES ('Sharma Parivar', 'family', 'INR', 'Family household spending & mutual care', $1)
       RETURNING id`,
      [priya.id]
    );
    const familyId = familyRes.rows[0].id;

    for (const m of [{ id: priya.id, role: 'owner' }, { id: arjun.id, role: 'member' }]) {
      await client.query(
        `INSERT INTO group_members (group_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (group_id, user_id) DO UPDATE SET role = EXCLUDED.role`,
        [familyId, m.id, m.role]
      );
    }
    await addEqualExpense(familyId, priya.id, 'Monthly Ration & Organic Pantry', 'groceries', '720000', [priya.id, arjun.id], 'family_contribution');
    console.log('✅ Seeded Sharma Parivar (Family) group with contribution.');
  });

  console.log('🎉 Database seeding complete! Test accounts ready.');
  await pool.end();
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
