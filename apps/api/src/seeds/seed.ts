import { MongoClient, ObjectId } from 'mongodb';
import { defaultRoles } from '../roles/seeds/default-roles.seed';
import { defaultPermissions } from '@api/permissions/seeds/default-permissions.seed';
import * as bcrypt from 'bcrypt';
import { seedEmailTemplates } from './email-templates.seed';
import { seedProducts } from './products.seed';

export async function seed(mongoUri: string): Promise<void> {
  console.log('Seeding data...');
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db();

    const permissionsCollection = db.collection('permissions');
    const rolesCollection = db.collection('roles');
    const usersCollection = db.collection('users');
    const emailTemplatesCollection = db.collection('email_templates');
    const productsCollection = db.collection('products');

    // Seed permissions
    for (const permissionData of defaultPermissions) {
      const exists = await permissionsCollection.findOne({
        action: permissionData.action,
        subject: permissionData.subject,
      });
      if (!exists) {
        const permissionToInsert = {
          ...permissionData,
          _id: new ObjectId(), // Ensure _id is a valid ObjectId
        };
        await permissionsCollection.insertOne(permissionToInsert);
        console.log(
          `Permission added: ${permissionData.action} on ${permissionData.subject}`,
        );
      } else {
        console.log(
          `Permission already exists: ${permissionData.action} on ${permissionData.subject}`,
        );
      }
    }

    // Seed roles
    for (const roleData of defaultRoles) {
      const exists = await rolesCollection.findOne({ name: roleData.name });
      if (!exists) {
        const permissions = await Promise.all(
          roleData.permissions.map(async (perm: any) => {
            const [action, subject] = perm.split('_');
            return permissionsCollection.findOne({ action, subject });
          }),
        );

        const role = {
          ...roleData,
          permissions: permissions.filter((p) => p !== null),
        };

        await rolesCollection.insertOne(role);
        console.log(`Role added: ${roleData.name}`);
      } else {
        console.log(`Role already exists: ${roleData.name}`);
      }
    }

    // Create admin user
    const adminRole = await rolesCollection.findOne({ name: 'admin' });
    if (!adminRole) {
      console.error('Admin role not found. Skipping admin user creation.');
      return;
    }

    const adminExists = await usersCollection.findOne({
      email: 'admin@example.com',
    });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      const adminUser = {
        email: 'admin@example.com',
        password: hashedPassword,
        roles: [adminRole],
        firstName: 'Admin',
        lastName: 'System',
      };
      await usersCollection.insertOne(adminUser);
      console.log('Admin user created: admin@example.com');
    } else {
      console.log('Admin user already exists');
    }

    // Seed email templates
    await seedEmailTemplates(emailTemplatesCollection);

    // Seed products
    await seedProducts(productsCollection);

    // Seed users from email list
    // await seedUsers(usersCollection, rolesCollection, emailService);

    console.log('Seeding completed');
  } finally {
    await client.close();
  }
}
