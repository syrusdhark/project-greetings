import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Full catalog of sports
const SPORTS_CATALOG = [
  { name: 'Surfing', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center' },
  { name: 'Scuba Diving', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&crop=center' },
  { name: 'Kitesurfing', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center' },
  { name: 'Kayaking', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&crop=center' },
  { name: 'Paddleboarding', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&crop=center' },
  { name: 'Windsurfing', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&crop=center' }
];

async function seedSportsPlaceholders() {
  console.log('🌊 Starting sports placeholder seeding...');

  try {
    // 1. Ensure all sports exist in the sports table
    console.log('📝 Ensuring all sports exist in database...');
    
    for (const sport of SPORTS_CATALOG) {
      const { data: existingSport, error: checkError } = await supabase
        .from('sports')
        .select('id')
        .eq('name', sport.name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (!existingSport) {
        const { error: insertError } = await supabase
          .from('sports')
          .insert({ name: sport.name });
        
        if (insertError) throw insertError;
        console.log(`✅ Created sport: ${sport.name}`);
      } else {
        console.log(`ℹ️  Sport already exists: ${sport.name}`);
      }
    }

    // 2. Get or create placeholder school
    console.log('🏫 Setting up placeholder school...');
    
    let placeholderSchoolId: string;
    
    const { data: existingSchool, error: schoolCheckError } = await supabase
      .from('schools')
      .select('id')
      .eq('name', 'Demo Vendor')
      .single();

    if (schoolCheckError && schoolCheckError.code !== 'PGRST116') {
      throw schoolCheckError;
    }

    if (!existingSchool) {
      const { data: newSchool, error: schoolInsertError } = await supabase
        .from('schools')
        .insert({
          name: 'Demo Vendor',
          display_name: 'Demo Water Sports School',
          description: 'Placeholder school for sports without real vendors',
          city: 'Test City',
          address: 'Demo Beach, Test City',
          latitude: 12.9716,
          longitude: 77.5946,
          cover_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center',
          is_active: false, // Mark as inactive so it doesn't show in real results
          website: 'https://example.com',
          primary_beach: 'Demo Beach'
        })
        .select('id')
        .single();

      if (schoolInsertError) throw schoolInsertError;
      placeholderSchoolId = newSchool.id;
      console.log('✅ Created placeholder school');
    } else {
      placeholderSchoolId = existingSchool.id;
      console.log('ℹ️  Placeholder school already exists');
    }

    // 3. Check which sports have no activities and create placeholder entries
    console.log('🔍 Checking sports without activities...');
    
    const { data: allSports, error: sportsError } = await supabase
      .from('sports')
      .select('id, name');

    if (sportsError) throw sportsError;

    for (const sport of allSports) {
      // Check if this sport has any school_sports entries
      const { data: existingSchoolSports, error: schoolSportsError } = await supabase
        .from('school_sports')
        .select('id')
        .eq('sport_id', sport.id)
        .limit(1);

      if (schoolSportsError) throw schoolSportsError;

      if (!existingSchoolSports || existingSchoolSports.length === 0) {
        console.log(`⚠️  Sport "${sport.name}" has no activities, creating placeholder...`);
        
        // Create placeholder school_sports entry
        const { error: schoolSportsInsertError } = await supabase
          .from('school_sports')
          .insert({
            school_id: placeholderSchoolId,
            sport_id: sport.id,
            price_per_person: 1000, // Default placeholder price
            currency: 'INR',
            active: false, // Mark as inactive
            languages: ['English'],
            eligibility: 'All skill levels welcome'
          });

        if (schoolSportsInsertError) throw schoolSportsInsertError;

        // Create placeholder time slots (inactive)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const { error: timeSlotsError } = await supabase
          .from('time_slots')
          .insert({
            school_id: placeholderSchoolId,
            sport_id: sport.id,
            date: tomorrow.toISOString().split('T')[0],
            start_time: '09:00:00',
            end_time: '10:00:00',
            capacity: 1,
            seats_left: 0, // No seats available
            status: 'closed' // Mark as closed
          });

        if (timeSlotsError) throw timeSlotsError;

        console.log(`✅ Created placeholder activities for: ${sport.name}`);
      } else {
        console.log(`ℹ️  Sport "${sport.name}" already has activities`);
      }
    }

    console.log('🎉 Sports placeholder seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Sports catalog: ${SPORTS_CATALOG.length} sports`);
    console.log(`   - All sports now have at least 1 placeholder activity`);
    console.log(`   - Placeholder school: Demo Vendor (inactive)`);
    console.log(`   - Placeholder activities are marked as inactive/closed`);

  } catch (error) {
    console.error('❌ Error during sports placeholder seeding:', error);
    throw error;
  }
}

// Run the seeding function
if (require.main === module) {
  seedSportsPlaceholders()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedSportsPlaceholders;
