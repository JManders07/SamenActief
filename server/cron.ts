import { storage } from "./storage";
import cron from "node-cron";

// Functie om herhalende activiteiten te beheren
async function manageRecurringActivities() {
  try {
    console.log('Starting recurring activities check...');
    // Maak nieuwe activiteiten aan waar nodig
    await storage.createRecurringActivities();
    
    // Update de zichtbaarheid van activiteiten
    await storage.updateActivityVisibility();
    
    console.log('Recurring activities managed successfully');
  } catch (error) {
    console.error('Error managing recurring activities:', error);
  }
}

// Start de cron jobs
export function startCronJobs() {
  // Plan de job om elke nacht om 00:00 te draaien
  cron.schedule('0 0 * * *', () => {
    console.log('Running scheduled recurring activities check...');
    manageRecurringActivities();
  });
  
  // Voer ook direct uit bij het opstarten
  manageRecurringActivities();
} 