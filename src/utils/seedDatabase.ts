import { supabase } from '../lib/supabase';
import { eventsData, barsData, newsSeedData, faqSeedData } from '../data/seedData';

let isSeeding = false;
let hasSeeded = false;

export const seedDatabase = async () => {
  // Prevent multiple simultaneous seeding attempts
  if (isSeeding || hasSeeded) {
    console.log('Seeding already in progress or completed');
    return;
  }

  isSeeding = true;

  try {
    console.log('Starting database seeding...');

    // Check if data already exists with a more thorough check
    const { data: existingEvents, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .limit(5);

    const { data: existingBars, error: barsError } = await supabase
      .from('bars')
      .select('id')
      .limit(5);

    const { data: existingNews, error: newsError } = await supabase
      .from('news_items')
      .select('id')
      .limit(5);

    const { data: existingFaq, error: faqError } = await supabase
      .from('faq_items')
      .select('id')
      .limit(5);

    if (eventsError) {
      console.error('Error checking existing events:', eventsError);
      return;
    }

    if (barsError) {
      console.error('Error checking existing bars:', barsError);
      return;
    }

    if (newsError) {
      console.error('Error checking existing news:', newsError);
      return;
    }

    if (faqError) {
      console.error('Error checking existing FAQ:', faqError);
      return;
    }

    // Only seed if tables are completely empty
    if (!existingEvents || existingEvents.length === 0) {
      console.log('Seeding events...');
      const { error: eventsInsertError } = await supabase
        .from('events')
        .insert(eventsData);

      if (eventsInsertError) {
        console.error('Error seeding events:', eventsInsertError);
        return;
      } else {
        console.log(`Successfully seeded ${eventsData.length} events`);
      }
    } else {
      console.log(`Events table already contains ${existingEvents.length} records, skipping seed`);
    }

    if (!existingBars || existingBars.length === 0) {
      console.log('Seeding bars...');
      const { error: barsInsertError } = await supabase
        .from('bars')
        .insert(barsData);

      if (barsInsertError) {
        console.error('Error seeding bars:', barsInsertError);
        return;
      } else {
        console.log(`Successfully seeded ${barsData.length} bars`);
      }
    } else {
      console.log(`Bars table already contains ${existingBars.length} records, skipping seed`);
    }

    if (!existingNews || existingNews.length === 0) {
      console.log('Seeding news items...');
      const { error: newsInsertError } = await supabase
        .from('news_items')
        .insert(newsSeedData);

      if (newsInsertError) {
        console.error('Error seeding news items:', newsInsertError);
        return;
      } else {
        console.log(`Successfully seeded ${newsSeedData.length} news items`);
      }
    } else {
      console.log(`News table already contains ${existingNews.length} records, skipping seed`);
    }

    if (!existingFaq || existingFaq.length === 0) {
      console.log('Seeding FAQ items...');
      const { error: faqInsertError } = await supabase
        .from('faq_items')
        .insert(faqSeedData);

      if (faqInsertError) {
        console.error('Error seeding FAQ items:', faqInsertError);
        return;
      } else {
        console.log(`Successfully seeded ${faqSeedData.length} FAQ items`);
      }
    } else {
      console.log(`FAQ table already contains ${existingFaq.length} records, skipping seed`);
    }

    hasSeeded = true;
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    isSeeding = false;
  }
};

// Reset the seeding state (useful for development)
export const resetSeedingState = () => {
  hasSeeded = false;
  isSeeding = false;
};