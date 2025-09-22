import { Collection } from 'mongodb';
import * as bcrypt from 'bcrypt';
import emailList from './data/email-user';
import { EmailService } from '../email/email.service';
import { EmailTemplateType } from '../email/schema/email-template.schema';

export const seedUsers = async (
  userCollection: Collection,
  roleCollection: Collection,
  emailService?: EmailService,
) => {
  try {
    // Get the user role
    const userRole = await roleCollection.findOne({ name: 'user' });
    if (!userRole) {
      console.log('User role not found. Please seed roles first.');
      return;
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // Create users from email list
    const users = emailList.map((email) => {
      const username = email.split('@')[0];
      return {
        email,
        firstName: username,
        lastName: '',
        password: hashedPassword,
        roles: [userRole],
        isEmailVerified: true,
        dailyPromptLimit: 50,
      };
    });

    // Insert users in batches to avoid overwhelming the database
    const batchSize = 100;
    let totalInserted = 0;
    const newlyAddedUsers = []; // Track newly added users

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      try {
        const result = await userCollection.insertMany(batch, {
          ordered: false,
        });
        totalInserted += result.insertedCount;
        // Add successfully inserted users to newlyAddedUsers
        const insertedUsers = batch.filter(
          (_, index) => result.insertedIds && result.insertedIds[index],
        );
        newlyAddedUsers.push(...insertedUsers);
      } catch (error) {
        // Log duplicate key errors but continue with other users
        if (error.code === 11000) {
          console.log('Some users already exist, skipping duplicates');
          // Add only successfully inserted users from the batch
          if (error.writeErrors) {
            const failedIndexes = new Set(
              error.writeErrors.map((e: any) => e.index),
            );
            const successfulUsers = batch.filter(
              (_, index) => !failedIndexes.has(index),
            );
            newlyAddedUsers.push(...successfulUsers);
            totalInserted += batch.length - error.writeErrors.length;
          }
        } else {
          throw error;
        }
      }
    }

    console.log(`Successfully seeded ${totalInserted} users`);

    // Send app launch emails only to newly added users if email service is provided
    if (emailService && newlyAddedUsers.length > 0) {
      console.log(
        `Sending app launch emails to ${newlyAddedUsers.length} new users...`,
      );

      // Send emails in batches to avoid overwhelming the email server
      const emailBatchSize = 50;
      let emailsSent = 0;
      let emailErrors = 0;

      for (let i = 0; i < newlyAddedUsers.length; i += emailBatchSize) {
        const batch = newlyAddedUsers.slice(i, i + emailBatchSize);
        const emailPromises = batch.map(async (user) => {
          try {
            await emailService.sendEmail({
              to: user.email,
              templateType: EmailTemplateType.APP_LAUNCH,
              templateData: {
                fullName: user.firstName || user.email.split('@')[0],
                currentYear: new Date().getFullYear(),
              },
            });
            emailsSent++;
          } catch (error) {
            console.error(
              `Failed to send email to ${user.email}:`,
              error.message,
            );
            emailErrors++;
          }
        });

        await Promise.all(emailPromises);
        console.log(
          `Progress: ${emailsSent + emailErrors}/${newlyAddedUsers.length} emails processed`,
        );
      }

      console.log(
        `App launch emails sent: ${emailsSent} successful, ${emailErrors} failed`,
      );
    }
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};
